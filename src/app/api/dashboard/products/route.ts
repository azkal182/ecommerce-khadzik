import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { generateUniqueSlug } from "@/lib/slug";
import { z } from "zod";

const createProductSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  basePrice: z.number().min(0, "Base price must be positive"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  images: z.array(z.object({
    url: z.string(),
    alt: z.string(),
    order: z.number(),
  })).optional().default([]),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  optionTypes: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Option type name is required"),
    values: z.array(z.string()).min(1, "At least one option value is required"),
  })).optional().default([]),
  variants: z.array(z.object({
    sku: z.string().optional(),
    priceAbsolute: z.number().min(0, "Variant price is required"),
    stock: z.number().min(0, "Stock cannot be negative"),
    optionValues: z.array(z.object({
      typeName: z.string(),
      value: z.string(),
    })).optional().default([]),
  })).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const storeId = searchParams.get("storeId");
    const categoryId = searchParams.get("categoryId");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (storeId && storeId !== "all") {
      where.storeId = storeId;
    }

    if (categoryId && categoryId !== "all") {
      where.categories = {
        some: {
          categoryId: categoryId,
        },
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        variants: {
          select: {
            id: true,
            sku: true,
            priceAbsolute: true,
            priceDelta: true,
            stock: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            alt: true,
            order: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            variants: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();

    // Validate request body
    const validatedData = createProductSchema.parse(body);

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: validatedData.storeId },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // Check if any variant SKU already exists (only check provided SKUs)
    const providedSkus = validatedData.variants.map(v => v.sku).filter(Boolean);
    if (providedSkus.length > 0) {
      const existingVariantSkus = await prisma.variant.findMany({
        where: {
          sku: {
            in: providedSkus
          }
        }
      });

      if (existingVariantSkus.length > 0) {
        return NextResponse.json(
          { error: "One or more variant SKUs already exist" },
          { status: 400 }
        );
      }
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(validatedData.name, 'product');

    // Process images - upload to Supabase if they're base64
    const processedImages = await Promise.all(
      validatedData.images.map(async (image, index) => {
        let url = image.url;

        // Check if image is base64
        if (image.url.startsWith('data:image/')) {
          try {
            // Convert base64 to file
            const base64Data = image.url.split(',')[1];
            const mimeType = image.url.split(':')[1].split(';')[0];
            const fileExt = mimeType.split('/')[1];
            const fileName = `product-${Date.now()}-${index}.${fileExt}`;

            // Convert base64 to Blob
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            const file = new File([blob], fileName, { type: mimeType });

            // Upload to Supabase
            const uploadResult = await supabase.storage
              .from('product-images')
              .upload(`products/${fileName}`, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadResult.error) {
              throw uploadResult.error;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(uploadResult.data.path);

            url = publicUrl;
          } catch (error) {
            console.error("Failed to upload image:", error);
            // Keep original URL if upload fails
          }
        }

        return {
          url,
          alt: image.alt,
          order: image.order,
        };
      })
    );

    // Create product within a transaction
    const product = await prisma.$transaction(async (tx) => {
      // First create the product with basic data
      const createdProduct = await tx.product.create({
        data: {
          name: validatedData.name,
          slug,
          description: validatedData.description,
          basePrice: validatedData.basePrice,
          status: validatedData.status,
          storeId: validatedData.storeId,
          images: {
            create: processedImages.map((img) => ({
              url: img.url,
              alt: img.alt,
              order: img.order,
            })),
          },
          categories: {
            create: validatedData.categories.map((categoryId) => ({
              categoryId,
            })),
          },
        },
        include: {
          images: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      // Create option types if any
      const createdOptionTypes = [];
      if (validatedData.optionTypes.length > 0) {
        for (const optionType of validatedData.optionTypes) {
          const createdType = await tx.variantOptionType.create({
            data: {
              productId: createdProduct.id,
              name: optionType.name,
            },
          });

          // Create option values for this type
          const createdValues = await Promise.all(
            optionType.values.map(value =>
              tx.variantOptionValue.create({
                data: {
                  typeId: createdType.id,
                  name: value,
                },
              })
            )
          );

          createdOptionTypes.push({
            ...createdType,
            values: createdValues,
          });
        }
      }

      // Handle variants - create default variant if none provided
      const variantsToCreate = validatedData.variants && validatedData.variants.length > 0
        ? validatedData.variants
        : [{
            sku: null,
            priceAbsolute: validatedData.basePrice,
            stock: 0, // Default stock
            optionValues: []
          }];

      const createdVariants = await Promise.all(
        variantsToCreate.map((variant) =>
          tx.variant.create({
            data: {
              productId: createdProduct.id,
              sku: variant.sku,
              priceAbsolute: variant.priceAbsolute,
              stock: variant.stock,
            },
          })
        )
      );

      // Connect variants to option values
      if (createdOptionTypes.length > 0 && validatedData.variants && validatedData.variants.length > 0) {
        for (let i = 0; i < validatedData.variants.length; i++) {
          const variant = validatedData.variants[i];
          const createdVariant = createdVariants[i];

          // Find and connect option values
          for (const optionValue of variant.optionValues) {
            const optionType = createdOptionTypes.find(
              type => type.name === optionValue.typeName
            );

            if (optionType) {
              const value = optionType.values.find(
                v => v.name === optionValue.value
              );

              if (value) {
                await tx.variantOptionValue.update({
                  where: { id: value.id },
                  data: { variantId: createdVariant.id },
                });
              }
            }
          }
        }
      }

      return createdProduct;
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}