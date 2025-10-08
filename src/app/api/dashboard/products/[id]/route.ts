import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { generateUniqueSlug } from "@/lib/slug";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            order: "asc",
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
        optionTypes: {
          include: {
            values: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        variants: {
          include: {
            optionValues: {
              include: {
                type: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Transform the data to match the new flexible variant structure
    const transformedProduct = {
      id: product.id,
      storeId: product.storeId,
      name: product.name,
      description: product.description || "",
      basePrice: product.basePrice,
      status: product.status,
      images: product.images.map((img) => ({
        url: img.url,
        alt: img.alt || "",
        order: img.order,
      })),
      categories: product.categories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      })),
      optionTypes: product.optionTypes.map((type) => ({
        id: type.id,
        name: type.name,
        values: type.values.map((value) => ({
          id: value.id,
          name: value.name,
        })),
      })),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku || "",
        priceAbsolute: variant.priceAbsolute || 0,
        stock: variant.stock,
        optionValues: variant.optionValues.map((ov) => ({
          id: ov.id,
          typeId: ov.typeId,
          typeName: ov.type.name,
          name: ov.name,
        })),
      })),
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

const updateProductSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  basePrice: z.number().min(0, "Base price must be positive"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  images: z.array(z.object({
    url: z.string(),
    alt: z.string(),
    order: z.number(),
  })).optional().default([]),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  optionTypes: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Option type name is required"),
    values: z.array(z.string()).min(1, "At least one option value is required"),
  })).optional().default([]),
  variants: z.array(z.object({
    id: z.string().optional(),
    sku: z.string().optional(),
    priceAbsolute: z.number().min(0, "Variant price is required"),
    stock: z.number().min(0, "Stock cannot be negative"),
    optionValues: z.array(z.object({
      typeName: z.string(),
      value: z.string(),
    })).optional().default([]),
  })).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateProductSchema.parse(body);

    // Check if product exists and get store info
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        categories: true,
        variants: true,
        store: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

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

    // Check if any variant SKU already exists (excluding current variants)
    const existingVariantSkus = await prisma.variant.findMany({
      where: {
        sku: {
          in: validatedData.variants?.map(v => v.sku).filter((sku): sku is string => Boolean(sku)) || []
        },
        productId: {
          not: id
        }
      }
    });

    if (existingVariantSkus.length > 0) {
      return NextResponse.json(
        { error: "One or more variant SKUs already exist" },
        { status: 400 }
      );
    }

    // Generate unique slug (excluding current product ID from uniqueness check)
    const slug = await generateUniqueSlug(validatedData.name, 'product', id);

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
            const byteArray = new Uint8Array(byteNumbers as number[]);
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

    // Update product within a transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Delete existing relationships
      await tx.productImage.deleteMany({
        where: { productId: id },
      });

      await tx.productCategory.deleteMany({
        where: { productId: id },
      });

      await tx.variantOptionValue.deleteMany({
        where: {
          variant: {
            productId: id
          }
        }
      });

      await tx.variantOptionType.deleteMany({
        where: { productId: id },
      });

      await tx.variant.deleteMany({
        where: { productId: id },
      });

      // Create option types if any
      const createdOptionTypes = [];
      if (validatedData.optionTypes.length > 0) {
        for (const optionType of validatedData.optionTypes) {
          const createdType = await tx.variantOptionType.create({
            data: {
              productId: id,
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
              productId: id,
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

      // Update product
      const product = await tx.product.update({
        where: { id },
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
          variants: {
            include: {
              optionValues: {
                include: {
                  type: true,
                },
              },
            },
          },
          optionTypes: {
            include: {
              values: true,
            },
          },
        },
      });

      return product;
    });

    // Revalidate SSG pages
    try {
      // Revalidate both old and new product slugs if slug changed
      revalidatePath(`/product/${existingProduct.slug}`);
      if (existingProduct.slug !== slug) {
        revalidatePath(`/product/${slug}`);
      }
      // Revalidate store page (both old and new stores if store changed)
      revalidatePath(`/store/${existingProduct.store.slug}`);
      if (store.slug !== existingProduct.store.slug) {
        revalidatePath(`/store/${store.slug}`);
      }
      // Revalidate stores list and home page
      revalidatePath('/stores');
      revalidatePath('/');
    } catch (revalidationError) {
      console.error('Revalidation error:', revalidationError);
      // Don't fail the request if revalidation fails
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        store: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete product within a transaction
    await prisma.$transaction(async (tx) => {
      // Delete related records
      await tx.productImage.deleteMany({
        where: { productId: id },
      });

      await tx.productCategory.deleteMany({
        where: { productId: id },
      });

      await tx.variant.deleteMany({
        where: { productId: id },
      });

      // Delete the product
      await tx.product.delete({
        where: { id },
      });
    });

    // Revalidate SSG pages
    try {
      // Revalidate product page
      revalidatePath(`/product/${existingProduct.slug}`);
      // Revalidate store page
      revalidatePath(`/store/${existingProduct.store.slug}`);
      // Revalidate stores list and home page
      revalidatePath('/stores');
      revalidatePath('/');
    } catch (revalidationError) {
      console.error('Revalidation error:', revalidationError);
      // Don't fail the request if revalidation fails
    }

    // Optionally: Delete images from Supabase (this would require tracking which images are in Supabase)
    // For now, we'll keep the images in Supabase even after product deletion

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}