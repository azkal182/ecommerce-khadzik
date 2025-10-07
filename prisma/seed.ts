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
      name: 'Graphic Hoodie',
      slug: 'graphic-hoodie',
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
    {
      name: 'Polo Shirt Classic',
      slug: 'polo-shirt-classic',
      description: 'Classic polo shirt with embroidered logo, perfect for semi-formal occasions',
      basePrice: 195000,
      categories: [shirtsCategory.id],
    },
    {
      name: 'V-Neck Sweater',
      slug: 'vneck-sweater',
      description: 'Comfortable v-neck sweater made from premium wool blend',
      basePrice: 375000,
      categories: [hoodiesCategory.id],
    },
    {
      name: 'Chino Pants',
      slug: 'chino-pants',
      description: 'Versatile chino pants perfect for office and casual wear',
      basePrice: 425000,
      categories: [pantsCategory.id],
    },
    {
      name: 'Cargo Shorts',
      slug: 'cargo-shorts',
      description: 'Functional cargo shorts with multiple pockets',
      basePrice: 225000,
      categories: [shortsCategory.id],
    },
    {
      name: 'Leather Jacket',
      slug: 'leather-jacket',
      description: 'Premium leather jacket with classic styling',
      basePrice: 1250000,
      categories: [jacketsCategory.id],
    },
    {
      name: 'Crossbody Bag',
      slug: 'crossbody-bag',
      description: 'Stylish crossbody bag with adjustable strap',
      basePrice: 325000,
      categories: [bagsCategory.id, accessoriesCategory.id],
    },
    {
      name: 'Sneakers Sport',
      slug: 'sneakers-sport',
      description: 'Comfortable sport sneakers with modern design',
      basePrice: 550000,
      categories: [shoesCategory.id],
    },
    {
      name: 'Long Sleeve Tee',
      slug: 'long-sleeve-tee',
      description: 'Comfortable long sleeve t-shirt for casual wear',
      basePrice: 145000,
      categories: [tshirtsCategory.id],
    },
    {
      name: 'Oxford Shirt',
      slug: 'oxford-shirt',
      description: 'Premium oxford shirt for professional settings',
      basePrice: 325000,
      categories: [shirtsCategory.id, formalCategory.id],
    },
    {
      name: 'Zip-up Hoodie',
      slug: 'zip-up-hoodie',
      description: 'Comfortable zip-up hoodie with front pockets',
      basePrice: 355000,
      categories: [hoodiesCategory.id],
    },
    {
      name: 'Skinny Jeans',
      slug: 'skinny-jeans',
      description: 'Trendy skinny jeans with stretch comfort',
      basePrice: 475000,
      categories: [jeansCategory.id, pantsCategory.id],
    },
    {
      name: 'Board Shorts',
      slug: 'board-shorts',
      description: 'Quick-dry board shorts for beach activities',
      basePrice: 195000,
      categories: [shortsCategory.id, sportsCategory.id],
    },
    {
      name: 'Bomber Jacket',
      slug: 'bomber-jacket',
      description: 'Modern bomber jacket with ribbed cuffs',
      basePrice: 595000,
      categories: [jacketsCategory.id],
    },
    {
      name: 'Tote Bag Large',
      slug: 'tote-bag-large',
      description: 'Spacious tote bag perfect for work and shopping',
      basePrice: 275000,
      categories: [bagsCategory.id, accessoriesCategory.id],
    },
    {
      name: 'Loafers Classic',
      slug: 'loafers-classic',
      description: 'Classic leather loafers for formal occasions',
      basePrice: 725000,
      categories: [shoesCategory.id, formalCategory.id],
    },
    {
      name: 'Henley Shirt',
      slug: 'henley-shirt',
      description: 'Stylish henley shirt with button placket',
      basePrice: 165000,
      categories: [tshirtsCategory.id, shirtsCategory.id],
    },
    {
      name: 'Flannel Shirt',
      slug: 'flannel-shirt',
      description: 'Warm flannel shirt perfect for cold weather',
      basePrice: 285000,
      categories: [shirtsCategory.id],
    },
    {
      name: 'Pullover Sweater',
      slug: 'pullover-sweater',
      description: 'Cozy pullover sweater for winter wear',
      basePrice: 395000,
      categories: [hoodiesCategory.id],
    },
    {
      name: 'Relaxed Fit Jeans',
      slug: 'relaxed-fit-jeans',
      description: 'Comfortable relaxed fit jeans for all-day wear',
      basePrice: 425000,
      categories: [jeansCategory.id, pantsCategory.id],
    },
    {
      name: 'Bermuda Shorts',
      slug: 'bermuda-shorts',
      description: 'Classic bermuda shorts for summer casual',
      basePrice: 185000,
      categories: [shortsCategory.id],
    },
    {
      name: 'Windbreaker Jacket',
      slug: 'windbreaker-jacket',
      description: 'Lightweight windbreaker perfect for outdoor activities',
      basePrice: 425000,
      categories: [jacketsCategory.id, sportsCategory.id],
    },
    {
      name: 'Clutch Bag Evening',
      slug: 'clutch-bag-evening',
      description: 'Elegant clutch bag for special occasions',
      basePrice: 425000,
      categories: [bagsCategory.id, accessoriesCategory.id],
    },
    {
      name: 'Boots Ankle',
      slug: 'boots-ankle',
      description: 'Stylish ankle boots for all seasons',
      basePrice: 825000,
      categories: [shoesCategory.id],
    },
    {
      name: 'Tank Top Basic',
      slug: 'tank-top-basic',
      description: 'Basic tank top perfect for layering',
      basePrice: 95000,
      categories: [tshirtsCategory.id],
    },
    {
      name: 'Dress Shirt White',
      slug: 'dress-shirt-white',
      description: 'Classic white dress shirt for formal wear',
      basePrice: 355000,
      categories: [shirtsCategory.id, formalCategory.id],
    },
    {
      name: 'Sweatshirt Crewneck',
      slug: 'sweatshirt-crewneck',
      description: 'Classic crewneck sweatshirt for casual comfort',
      basePrice: 295000,
      categories: [hoodiesCategory.id],
    },
    {
      name: 'Bootcut Jeans',
      slug: 'bootcut-jeans',
      description: 'Classic bootcut jeans with slight flare',
      basePrice: 455000,
      categories: [jeansCategory.id, pantsCategory.id],
    },
    {
      name: 'Denim Shorts',
      slug: 'denim-shorts',
      description: 'Classic denim shorts for summer style',
      basePrice: 205000,
      categories: [shortsCategory.id, jeansCategory.id],
    },
    {
      name: 'Leather Biker Jacket',
      slug: 'leather-biker-jacket',
      description: 'Edgy leather biker jacket with metal hardware',
      basePrice: 1450000,
      categories: [jacketsCategory.id],
    },
    {
      name: 'Waist Bag Sport',
      slug: 'waist-bag-sport',
      description: 'Sporty waist bag for hands-free convenience',
      basePrice: 185000,
      categories: [bagsCategory.id, accessoriesCategory.id],
    },
    {
      name: 'High Top Sneakers',
      slug: 'high-top-sneakers',
      description: 'Classic high-top sneakers with retro style',
      basePrice: 625000,
      categories: [shoesCategory.id],
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
    {
      name: 'Gaming Console Pro',
      slug: 'gaming-console-pro',
      description: 'Next-generation gaming console with 4K graphics and ray tracing',
      basePrice: 8999000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: 'Drone Camera 4K',
      slug: 'drone-camera-4k',
      description: 'Professional drone with 4K camera and GPS stabilization',
      basePrice: 12499000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Action Camera Hero',
      slug: 'action-camera-hero',
      description: 'Waterproof action camera with 4K recording and image stabilization',
      basePrice: 4299000,
      categories: [electronicsCategory.id, sportsCategory.id],
    },
    {
      name: 'Smart Speaker Hub',
      slug: 'smart-speaker-hub',
      description: 'Voice-controlled smart speaker with home automation features',
      basePrice: 2299000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: 'Wireless Charger Premium',
      slug: 'wireless-charger-premium',
      description: 'Fast wireless charger with multiple device support',
      basePrice: 899000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Fitness Tracker Band',
      slug: 'fitness-tracker-band',
      description: 'Advanced fitness tracker with heart rate monitoring',
      basePrice: 1999000,
      categories: [electronicsCategory.id, smartCategory.id, sportsCategory.id],
    },
    {
      name: 'Gaming Headset RGB',
      slug: 'gaming-headset-rgb',
      description: 'Professional gaming headset with 7.1 surround sound',
      basePrice: 1899000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Smart TV 55" OLED',
      slug: 'smart-tv-55-oled',
      description: 'Premium OLED smart TV with 4K resolution and HDR',
      basePrice: 18999000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Bluetooth Speaker Portable',
      slug: 'bluetooth-speaker-portable',
      description: 'Waterproof portable speaker with 360-degree sound',
      basePrice: 1599000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'VR Headset Pro',
      slug: 'vr-headset-pro',
      description: 'Virtual reality headset with hand tracking and haptic feedback',
      basePrice: 9999000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: 'Power Bank 20000mAh',
      slug: 'power-bank-20000mah',
      description: 'High-capacity power bank with fast charging support',
      basePrice: 699000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Smart Home Hub',
      slug: 'smart-home-hub',
      description: 'Central hub for smart home devices and automation',
      basePrice: 2799000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: 'Digital Camera Mirrorless',
      slug: 'digital-camera-mirrorless',
      description: 'Professional mirrorless camera with 4K video recording',
      basePrice: 22999000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Gaming Keyboard Mechanical',
      slug: 'gaming-keyboard-mechanical',
      description: 'RGB mechanical gaming keyboard with programmable keys',
      basePrice: 1799000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Gaming Mouse Wireless',
      slug: 'gaming-mouse-wireless',
      description: 'High-precision wireless gaming mouse with customizable DPI',
      basePrice: 1499000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Monitor Gaming 27"',
      slug: 'monitor-gaming-27',
      description: '27-inch gaming monitor with 144Hz refresh rate and 1ms response',
      basePrice: 6999000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Smart Door Lock',
      slug: 'smart-door-lock',
      description: 'Keyless smart door lock with app control and biometric access',
      basePrice: 3299000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: 'Security Camera WiFi',
      slug: 'security-camera-wifi',
      description: 'WiFi security camera with night vision and motion detection',
      basePrice: 1299000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Smart Light Bulbs Set',
      slug: 'smart-light-bulbs-set',
      description: 'RGB smart light bulbs with app control and scheduling',
      basePrice: 899000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: 'Smart Thermostat',
      slug: 'smart-thermostat',
      description: 'Energy-saving smart thermostat with learning algorithms',
      basePrice: 2499000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: 'Wireless Router Mesh',
      slug: 'wireless-router-mesh',
      description: 'Mesh WiFi router system for whole home coverage',
      basePrice: 3499000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Smart Watch Sport',
      slug: 'smart-watch-sport',
      description: 'GPS-enabled smartwatch for fitness and outdoor activities',
      basePrice: 4499000,
      categories: [electronicsCategory.id, smartCategory.id, watchesCategory.id, sportsCategory.id],
    },
    {
      name: 'Tablet Keyboard Case',
      slug: 'tablet-keyboard-case',
      description: 'Protective case with built-in keyboard for tablets',
      basePrice: 1299000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Webcam HD Pro',
      slug: 'webcam-hd-pro',
      description: '1080p HD webcam with auto-focus and noise reduction',
      basePrice: 899000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'USB-C Hub Multiport',
      slug: 'usb-c-hub-multiport',
      description: 'Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader',
      basePrice: 699000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Smart Scale Digital',
      slug: 'smart-scale-digital',
      description: 'Digital scale with body composition analysis and app sync',
      basePrice: 999000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: 'Phone Camera Lens Kit',
      slug: 'phone-camera-lens-kit',
      description: 'Professional lens kit for smartphone photography',
      basePrice: 799000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Smart Water Bottle',
      slug: 'smart-water-bottle',
      description: 'Hydration tracking water bottle with temperature control',
      basePrice: 1299000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: 'Laptop Stand Adjustable',
      slug: 'laptop-stand-adjustable',
      description: 'Ergonomic laptop stand with adjustable height and angle',
      basePrice: 499000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Smart Alarm Clock',
      slug: 'smart-alarm-clock',
      description: 'WiFi-enabled alarm clock with sleep tracking and sunrise simulation',
      basePrice: 899000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: 'External SSD 1TB',
      slug: 'external-ssd-1tb',
      description: 'Portable external SSD with fast transfer speeds',
      basePrice: 1999000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Smart Plug Outlet',
      slug: 'smart-plug-outlet',
      description: 'WiFi-enabled smart plug with energy monitoring',
      basePrice: 399000,
      categories: [electronicsCategory.id, smartCategory.id],
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

  
  console.log('📦 Created products');

  // Add product images
  for (const product of [...createdFashionProducts, ...createdTechProducts]) {
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

  
  // Create variant options for tech products
  for (const product of createdTechProducts) {
    // Create variants for specific tech products that benefit from variations
    if (product.slug.includes('smartphone') || product.slug.includes('laptop') || product.slug.includes('tablet')) {
      // Create Storage option type
      const storageOptionType = await prisma.variantOptionType.create({
        data: {
          productId: product.id,
          name: 'Storage',
        },
      });

      // Create Color option type
      const colorOptionType = await prisma.variantOptionType.create({
        data: {
          productId: product.id,
          name: 'Color',
        },
      });

      // Create storage values
      await prisma.variantOptionValue.createMany({
        data: product.slug.includes('smartphone')
          ? [
              { typeId: storageOptionType.id, name: '128GB' },
              { typeId: storageOptionType.id, name: '256GB' },
              { typeId: storageOptionType.id, name: '512GB' },
            ]
          : [
              { typeId: storageOptionType.id, name: '256GB' },
              { typeId: storageOptionType.id, name: '512GB' },
              { typeId: storageOptionType.id, name: '1TB' },
            ],
      });

      // Create color values
      await prisma.variantOptionValue.createMany({
        data: [
          { typeId: colorOptionType.id, name: 'Space Gray' },
          { typeId: colorOptionType.id, name: 'Silver' },
          { typeId: colorOptionType.id, name: 'Midnight Blue' },
        ],
      });

      // Get the created values for variant creation
      const createdStorageValues = await prisma.variantOptionValue.findMany({
        where: { typeId: storageOptionType.id },
      });
      const createdColorValues = await prisma.variantOptionValue.findMany({
        where: { typeId: colorOptionType.id },
      });

      // Create variants (combinations of storage and color)
      const variantCombinations = [];
      for (const storage of createdStorageValues) {
        for (const color of createdColorValues) {
          variantCombinations.push([storage.id, color.id]);
        }
      }

      for (const [storageId, colorId] of variantCombinations) {
        // Calculate price delta based on storage
        let priceDelta = 0;
        const storage = createdStorageValues.find(s => s.id === storageId);
        if (storage?.name.includes('512')) priceDelta = 2000000;
        else if (storage?.name.includes('1TB')) priceDelta = 5000000;
        else if (storage?.name.includes('256')) priceDelta = 1000000;

        const variant = await prisma.variant.create({
          data: {
            productId: product.id,
            sku: `${product.slug}-${storageId}-${colorId}`,
            priceAbsolute: product.basePrice,
            priceDelta: priceDelta,
            stock: Math.floor(Math.random() * 15) + 3, // Random stock between 3-18
          },
        });

        // Link option values to variant
        await prisma.variantOptionValue.updateMany({
          where: { id: { in: [storageId, colorId] } },
          data: { variantId: variant.id },
        });
      }
    }
  }

  console.log('💻 Created variants for tech products');

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
      productId: createdTechProducts[0].id,
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
  console.log(`- Stores: 2`);
  console.log(`- Categories: 20`);
  console.log(`- Products: ${createdFashionProducts.length + createdTechProducts.length}`);
  console.log(`- Fashion Store Products: ${createdFashionProducts.length}`);
  console.log(`- Tech Hub Products: ${createdTechProducts.length}`);
  console.log(`- Variants: ${createdFashionProducts.length * 9 + createdTechProducts.filter(p => p.slug.includes('smartphone') || p.slug.includes('laptop') || p.slug.includes('tablet')).length * 9}`);
  console.log(`- Discounts: 3`);
  console.log('\n🏪 Stores:');
  console.log(`- Fashion Store (fashion-store): Fashion and apparel products`);
  console.log(`- Tech Hub (tech-hub): Electronics and gadgets`);
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