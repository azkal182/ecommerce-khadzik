import { PrismaClient, Role, DiscountScope, DiscountType, ProductStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean up existing data
  await prisma.event.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.variantOptionValue.deleteMany();
  await prisma.variantOptionType.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.storeRole.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const ownerUser = await prisma.user.create({
    data: {
      email: 'owner@example.com',
      password: hashedPassword,
      role: Role.OWNER,
    },
  });

  const editorUser = await prisma.user.create({
    data: {
      email: 'editor@example.com',
      password: hashedPassword,
      role: Role.EDITOR,
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      email: 'viewer@example.com',
      password: hashedPassword,
      role: Role.VIEWER,
    },
  });

  console.log('👥 Created users');

  // Create Categories
  const shirtsCategory = await prisma.category.create({
    data: { name: 'Shirts', slug: 'shirts' },
  });

  const tshirtsCategory = await prisma.category.create({
    data: { name: 'T-Shirts', slug: 't-shirts' },
  });

  const hoodiesCategory = await prisma.category.create({
    data: { name: 'Hoodies', slug: 'hoodies' },
  });

  const pantsCategory = await prisma.category.create({
    data: { name: 'Pants', slug: 'pants' },
  });

  const jeansCategory = await prisma.category.create({
    data: { name: 'Jeans', slug: 'jeans' },
  });

  const shortsCategory = await prisma.category.create({
    data: { name: 'Shorts', slug: 'shorts' },
  });

  const jacketsCategory = await prisma.category.create({
    data: { name: 'Jackets', slug: 'jackets' },
  });

  const accessoriesCategory = await prisma.category.create({
    data: { name: 'Accessories', slug: 'accessories' },
  });

  const shoesCategory = await prisma.category.create({
    data: { name: 'Shoes', slug: 'shoes' },
  });

  const bagsCategory = await prisma.category.create({
    data: { name: 'Bags', slug: 'bags' },
  });

  const watchesCategory = await prisma.category.create({
    data: { name: 'Watches', slug: 'watches' },
  });

  const electronicsCategory = await prisma.category.create({
    data: { name: 'Electronics', slug: 'electronics' },
  });

  const analogCategory = await prisma.category.create({
    data: { name: 'Analog', slug: 'analog' },
  });

  const digitalCategory = await prisma.category.create({
    data: { name: 'Digital', slug: 'digital' },
  });

  const smartCategory = await prisma.category.create({
    data: { name: 'Smart', slug: 'smart' },
  });

  const sportsCategory = await prisma.category.create({
    data: { name: 'Sports', slug: 'sports' },
  });

  const formalCategory = await prisma.category.create({
    data: { name: 'Formal', slug: 'formal' },
  });

  console.log('📁 Created categories');

  // Create Stores
  const clothingStore = await prisma.store.create({
    data: {
      slug: 'fashion-store',
      name: 'Fashion Store',
      description: 'Discover our curated collection of modern fashion. From casual wear to formal attire, find the perfect pieces to elevate your style.',
      theme: {
        primary: '#3b82f6',
        secondary: '#1d4ed8',
        bg: '#ffffff',
        fg: '#111827',
        accent: '#f59e0b',
      },
      waNumber: '628123456789',
      isActive: true,
    },
  });

  const techStore = await prisma.store.create({
    data: {
      slug: 'tech-hub',
      name: 'Tech Hub',
      description: 'Your one-stop destination for the latest gadgets and electronics. From smartphones to smartwatches, we have everything you need to stay connected and productive.',
      theme: {
        primary: '#00b4d8',
        secondary: '#0077b6',
        bg: '#f0f9ff',
        fg: '#0c4a6e',
        accent: '#00d9ff',
      },
      waNumber: '628555123456',
      isActive: true,
    },
  });

  const sportsStore = await prisma.store.create({
    data: {
      slug: 'sports-central',
      name: 'Sports Central',
      description: 'Get geared up with our premium sports equipment and activewear. From professional gear to everyday fitness essentials, we have everything for your active lifestyle.',
      theme: {
        primary: '#dc2626',
        secondary: '#b91c1c',
        bg: '#fef2f2',
        fg: '#7f1d1d',
        accent: '#ef4444',
      },
      waNumber: '628778991122',
      isActive: true,
    },
  });

  const watchesStore = await prisma.store.create({
    data: {
      slug: 'timepieces',
      name: 'Luxury Timepieces',
      description: 'Explore our collection of premium timepieces. From classic analog designs to modern smartwatches, find the perfect watch for every occasion.',
      theme: {
        primary: '#000000',
        secondary: '#1f2937',
        bg: '#f9fafb',
        fg: '#111827',
        accent: '#fbbf24',
      },
      waNumber: '628987654321',
      isActive: true,
    },
  });

  console.log('🏪 Created stores');

  // Assign Store Roles
  await prisma.storeRole.create({
    data: {
      storeId: clothingStore.id,
      userId: editorUser.id,
      role: Role.EDITOR,
    },
  });

  console.log('🔐 Assigned store roles');

  // Create Products for Fashion Store
  const fashionProducts = [
    {
      name: 'Premium Cotton T-Shirt',
      slug: 'premium-cotton-tshirt',
      description: 'High-quality cotton t-shirt with comfortable fit and modern design',
      basePrice: 125000,
      categories: [tshirtsCategory.id],
    },
    {
      name: 'Classic Button-Up Shirt',
      slug: 'classic-button-up-shirt',
      description: 'Professional button-up shirt perfect for office and formal occasions',
      basePrice: 275000,
      categories: [shirtsCategory.id, formalCategory.id],
    },
    {
      'name': 'Graphic Hoodie',
      'slug': 'graphic-hoodie',
      description: 'Cozy hoodie with stylish graphic print, perfect for casual wear',
      basePrice: 325000,
      categories: [hoodiesCategory.id],
    },
    {
      name: 'Slim Fit Jeans',
      slug: 'slim-fit-jeans',
      description: 'Modern slim fit jeans that flatter your silhouette',
      basePrice: 450000,
      categories: [jeansCategory.id, pantsCategory.id],
    },
    {
      name: 'Athletic Shorts',
      slug: 'athletic-shorts',
      description: 'Performance shorts designed for maximum comfort and mobility',
      basePrice: 175000,
      categories: [shortsCategory.id, sportsCategory.id],
    },
    {
      name: 'Denim Jacket',
      slug: 'denim-jacket',
      description: 'Classic denim jacket with modern styling and durability',
      basePrice: 525000,
      categories: [jacketsCategory.id],
    },
    {
      name: 'Canvas Backpack',
      slug: 'canvas-backpack',
      description: 'Durable canvas backpack with multiple compartments for daily use',
      basePrice: 225000,
      categories: [bagsCategory.id, accessoriesCategory.id],
    },
    {
      name: 'Running Shoes',
      slug: 'running-shoes',
      description: 'Professional running shoes with advanced cushioning technology',
      basePrice: 675000,
      categories: [shoesCategory.id, sportsCategory.id],
    },
  ];

  const createdFashionProducts = [];
  for (const productData of fashionProducts) {
    const { categories, ...product } = productData;
    const createdProduct = await prisma.product.create({
      data: {
        ...product,
        storeId: clothingStore.id,
        status: ProductStatus.ACTIVE,
      },
    });

    // Connect categories
    await prisma.productCategory.createMany({
      data: categories.map(categoryId => ({
        productId: createdProduct.id,
        categoryId,
      })),
    });

    createdFashionProducts.push(createdProduct);
  }

  // Create Products for Tech Store
  const techProducts = [
    {
      name: 'Smartphone Pro Max',
      slug: 'smartphone-pro-max',
      description: 'Flagship smartphone with advanced features and premium build quality',
      basePrice: 15999000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: 'Wireless Earbuds Pro',
      slug: 'wireless-earbuds-pro',
      description: 'Premium wireless earbuds with active noise cancellation',
      basePrice: 3299000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Smart Watch Ultra',
      slug: 'smart-watch-ultra',
      description: 'Advanced smartwatch with health monitoring and fitness tracking',
      basePrice: 7499000,
      categories: [electronicsCategory.id, smartCategory.id, watchesCategory.id],
    },
    {
      name: 'Laptop Pro 16"',
      slug: 'laptop-pro-16',
      description: 'High-performance laptop with stunning retina display and powerful processor',
      basePrice: 28999000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Tablet Pro 12"',
      slug: 'tablet-pro-12',
      description: 'Professional tablet with Apple Pencil support and stunning display',
      basePrice: 10999000,
      categories: [electronicsCategory.id],
    },
  ];

  const createdTechProducts = [];
  for (const productData of techProducts) {
    const { categories, ...product } = productData;
    const createdProduct = await prisma.product.create({
      data: {
        ...product,
        storeId: techStore.id,
        status: ProductStatus.ACTIVE,
      },
    });

    // Connect categories
    await prisma.productCategory.createMany({
      data: categories.map(categoryId => ({
        productId: createdProduct.id,
        categoryId,
      })),
    });

    createdTechProducts.push(createdProduct);
  }

  // Create Products for Sports Store
  const sportsProducts = [
    {
      name: 'Professional Yoga Mat',
      slug: 'professional-yoga-mat',
      description: 'Extra thick yoga mat with superior grip and cushioning',
      basePrice: 185000,
      categories: [sportsCategory.id],
    },
    {
      name: 'Resistance Bands Set',
      slug: 'resistance-bands-set',
      description: 'Complete set of resistance bands for full-body workouts',
      basePrice: 275000,
      categories: [sportsCategory.id],
    },
    {
      name: 'Dumbbells Pair',
      slug: 'dumbbells-pair',
      description: 'Adjustable dumbbells with ergonomic grip design',
      basePrice: 425000,
      categories: [sportsCategory.id],
    },
    {
      name: 'Jump Rope Pro',
      slug: 'jump-rope-pro',
      description: 'Professional speed rope with digital counter and smooth rotation',
      basePrice: 95000,
      categories: [sportsCategory.id],
    },
  ];

  const createdSportsProducts = [];
  for (const productData of sportsProducts) {
    const { categories, ...product } = productData;
    const createdProduct = await prisma.product.create({
      data: {
        ...product,
        storeId: sportsStore.id,
        status: ProductStatus.ACTIVE,
      },
    });

    // Connect categories
    await prisma.productCategory.createMany({
      data: categories.map(categoryId => ({
        productId: createdProduct.id,
        categoryId,
      })),
    });

    createdSportsProducts.push(createdProduct);
  }

  // Create Products for Watches Store
  const watchProducts = [
    {
      name: 'Classic Analog Watch',
      slug: 'classic-analog-watch',
      description: 'Timeless analog watch with genuine leather strap',
      basePrice: 3250000,
      categories: [watchesCategory.id, analogCategory.id],
    },
    {
      name: 'Smart Watch Series 8',
      slug: 'smart-watch-series-8',
      description: 'Advanced smartwatch with health monitoring and GPS tracking',
      basePrice: 5999000,
      categories: [watchesCategory.id, smartCategory.id, digitalCategory.id],
    },
    {
      name: 'Digital Sport Watch',
      slug: 'digital-sport-watch',
      description: 'Feature-rich digital watch with fitness tracking capabilities',
      basePrice: 2450000,
      categories: [watchesCategory.id, digitalCategory.id, sportsCategory.id],
    },
    {
      name: 'Luxury Automatic Watch',
      'slug': 'luxury-automatic-watch',
      description: 'Premium automatic movement watch with sapphire crystal',
      basePrice: 12999000,
      categories: [watchesCategory.id, analogCategory.id],
    },
  ];

  const createdWatchProducts = [];
  for (const productData of watchProducts) {
    const { categories, ...product } = productData;
    const createdProduct = await prisma.product.create({
      data: {
        ...product,
        storeId: watchesStore.id,
        status: ProductStatus.ACTIVE,
      },
    });

    // Connect categories
    await prisma.productCategory.createMany({
      data: categories.map(categoryId => ({
        productId: createdProduct.id,
        categoryId,
      })),
    });

    createdWatchProducts.push(createdProduct);
  }

  console.log('📦 Created products');

  // Add product images
  for (const product of [...createdFashionProducts, ...createdTechProducts, ...createdSportsProducts, ...createdWatchProducts]) {
    await prisma.productImage.createMany({
      data: [
        {
          productId: product.id,
          url: `https://picsum.photos/400/300?random=${product.id}&1`,
          alt: `${product.name} - Image 1`,
          order: 0,
        },
        {
          productId: product.id,
          url: `https://picsum.photos/400/300?random=${product.id}&2`,
          alt: `${product.name} - Image 2`,
          order: 1,
        },
      ],
    });
  }

  console.log('🖼️ Added product images');

  // Create variant options for clothing products
  for (const product of createdFashionProducts) {
    // Create Color option type
    const colorOptionType = await prisma.variantOptionType.create({
      data: {
        productId: product.id,
        name: 'Color',
      },
    });

    // Create Size option type
    const sizeOptionType = await prisma.variantOptionType.create({
      data: {
        productId: product.id,
        name: 'Size',
      },
    });

    // Create color values
    const colorValues = await prisma.variantOptionValue.createMany({
      data: [
        { typeId: colorOptionType.id, name: 'Blue' },
        { typeId: colorOptionType.id, name: 'Black' },
        { typeId: colorOptionType.id, name: 'White' },
      ],
    });

    // Create size values
    const sizeValues = await prisma.variantOptionValue.createMany({
      data: [
        { typeId: sizeOptionType.id, name: 'M' },
        { typeId: sizeOptionType.id, name: 'L' },
        { typeId: sizeOptionType.id, name: 'XL' },
      ],
    });

    // Get the created values for variant creation
    const createdColorValues = await prisma.variantOptionValue.findMany({
      where: { typeId: colorOptionType.id },
    });
    const createdSizeValues = await prisma.variantOptionValue.findMany({
      where: { typeId: sizeOptionType.id },
    });

    // Create variants (combinations of color and size)
    const variantCombinations = [];
    for (const color of createdColorValues) {
      for (const size of createdSizeValues) {
        variantCombinations.push([color.id, size.id]);
      }
    }

    for (const [colorId, sizeId] of variantCombinations) {
      const variant = await prisma.variant.create({
        data: {
          productId: product.id,
          sku: `${product.slug}-${colorId}-${sizeId}`,
          priceAbsolute: product.basePrice,
          stock: Math.floor(Math.random() * 20) + 5, // Random stock between 5-25
        },
      });

      // Link option values to variant
      await prisma.variantOptionValue.updateMany({
        where: { id: { in: [colorId, sizeId] } },
        data: { variantId: variant.id },
      });
    }
  }

  console.log('🎨 Created variants for clothing products');

  // Create variant options for watch products
  for (const product of createdWatchProducts) {
    // Create Band Material option type
    const bandOptionType = await prisma.variantOptionType.create({
      data: {
        productId: product.id,
        name: 'Band Material',
      },
    });

    // Create band material values
    await prisma.variantOptionValue.createMany({
      data: [
        { typeId: bandOptionType.id, name: 'Leather' },
        { typeId: bandOptionType.id, name: 'Steel' },
        { typeId: bandOptionType.id, name: 'Silicone' },
      ],
    });

    // Get the created values for variant creation
    const createdBandValues = await prisma.variantOptionValue.findMany({
      where: { typeId: bandOptionType.id },
    });

    // Create variants
    for (const band of createdBandValues) {
      const variant = await prisma.variant.create({
        data: {
          productId: product.id,
          sku: `${product.slug}-${band.id}`,
          priceDelta: band.name === 'Leather' ? 100000 : band.name === 'Steel' ? 150000 : 0,
          stock: Math.floor(Math.random() * 10) + 3, // Random stock between 3-13
        },
      });

      // Link option value to variant
      await prisma.variantOptionValue.update({
        where: { id: band.id },
        data: { variantId: variant.id },
      });
    }
  }

  console.log('⌚ Created variants for watch products');

  // Create Discounts
  // Store-scoped discount for clothing
  await prisma.discount.create({
    data: {
      scope: DiscountScope.STORE,
      type: DiscountType.PERCENT,
      value: 10,
      priority: 100,
      stackable: false,
      startAt: new Date(),
      endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      storeId: clothingStore.id,
    },
  });

  // Product-scoped discount for specific watch
  await prisma.discount.create({
    data: {
      scope: DiscountScope.PRODUCT,
      type: DiscountType.FIXED,
      value: 200000,
      priority: 50,
      stackable: false,
      startAt: new Date(),
      endAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      productId: createdWatchProducts[0].id,
    },
  });

  // Global discount
  await prisma.discount.create({
    data: {
      scope: DiscountScope.GLOBAL,
      type: DiscountType.PERCENT,
      value: 5,
      priority: 200,
      stackable: true,
      startAt: new Date(),
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  console.log('💰 Created discounts');

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: 3`);
  console.log(`- Stores: 4`);
  console.log(`- Categories: 20`);
  console.log(`- Products: ${createdFashionProducts.length + createdTechProducts.length + createdSportsProducts.length + createdWatchProducts.length}`);
  console.log(`- Variants: ${createdFashionProducts.length * 9 + createdTechProducts.length * 3 + createdSportsProducts.length * 3 + createdWatchProducts.length * 3}`);
  console.log(`- Discounts: 3`);
  console.log('\n🔑 Login credentials:');
  console.log(`- Owner: owner@example.com / password123`);
  console.log(`- Editor: editor@example.com / password123`);
  console.log(`- Viewer: viewer@example.com / password123`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });