import {
  PrismaClient,
  Role,
  DiscountScope,
  DiscountType,
  ProductStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai proses seed...");

  // Bersihkan data yang sudah ada
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

  console.log("🧹 Data lama berhasil dibersihkan");

  // Buat Pengguna
  const hashedPassword = await bcrypt.hash("password123", 10);

  const ownerUser = await prisma.user.create({
    data: {
      email: "owner@example.com",
      password: hashedPassword,
      role: Role.OWNER,
    },
  });

  const editorUser = await prisma.user.create({
    data: {
      email: "editor@example.com",
      password: hashedPassword,
      role: Role.EDITOR,
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      email: "viewer@example.com",
      password: hashedPassword,
      role: Role.VIEWER,
    },
  });

  console.log("👥 Pengguna berhasil dibuat");

  // Buat Kategori
  const shirtsCategory = await prisma.category.create({
    data: { name: "Kemeja", slug: "shirts" },
  });

  const tshirtsCategory = await prisma.category.create({
    data: { name: "Kaos", slug: "t-shirts" },
  });

  const hoodiesCategory = await prisma.category.create({
    data: { name: "Hoodie & Sweater", slug: "hoodies" },
  });

  const pantsCategory = await prisma.category.create({
    data: { name: "Celana", slug: "pants" },
  });

  const jeansCategory = await prisma.category.create({
    data: { name: "Jeans", slug: "jeans" },
  });

  const shortsCategory = await prisma.category.create({
    data: { name: "Celana Pendek", slug: "shorts" },
  });

  const jacketsCategory = await prisma.category.create({
    data: { name: "Jaket", slug: "jackets" },
  });

  const accessoriesCategory = await prisma.category.create({
    data: { name: "Aksesori", slug: "accessories" },
  });

  const shoesCategory = await prisma.category.create({
    data: { name: "Sepatu", slug: "shoes" },
  });

  const bagsCategory = await prisma.category.create({
    data: { name: "Tas", slug: "bags" },
  });

  const watchesCategory = await prisma.category.create({
    data: { name: "Jam Tangan", slug: "watches" },
  });

  const electronicsCategory = await prisma.category.create({
    data: { name: "Elektronik", slug: "electronics" },
  });

  const analogCategory = await prisma.category.create({
    data: { name: "Analog", slug: "analog" },
  });

  const digitalCategory = await prisma.category.create({
    data: { name: "Digital", slug: "digital" },
  });

  const smartCategory = await prisma.category.create({
    data: { name: "Pintar", slug: "smart" },
  });

  const sportsCategory = await prisma.category.create({
    data: { name: "Olahraga", slug: "sports" },
  });

  const formalCategory = await prisma.category.create({
    data: { name: "Formal", slug: "formal" },
  });

  console.log("📁 Kategori berhasil dibuat");

  // Buat Toko
  const clothingStore = await prisma.store.create({
    data: {
      slug: "fashion-store",
      name: "Toko Fashion",
      description:
        "Jelajahi koleksi fashion modern kurasi kami. Dari kasual hingga formal, temukan pilihan terbaik untuk menyempurnakan gaya Anda.",
      theme: {
        primary: "#3b82f6",
        secondary: "#1d4ed8",
        bg: "#ffffff",
        fg: "#111827",
        accent: "#f59e0b",
      },
      waNumber: "628123456789",
      isActive: true,
    },
  });

  const techStore = await prisma.store.create({
    data: {
      slug: "tech-hub",
      name: "Pusat Teknologi",
      description:
        "Tujuan satu tempat untuk gawai dan elektronik terbaru. Dari smartphone hingga smartwatch, semua yang Anda butuhkan untuk tetap terhubung dan produktif ada di sini.",
      theme: {
        primary: "#00b4d8",
        secondary: "#0077b6",
        bg: "#f0f9ff",
        fg: "#0c4a6e",
        accent: "#00d9ff",
      },
      waNumber: "628555123456",
      isActive: true,
    },
  });

  console.log("🏪 Toko berhasil dibuat");

  // Beri Peran Toko
  await prisma.storeRole.create({
    data: {
      storeId: clothingStore.id,
      userId: editorUser.id,
      role: Role.EDITOR,
    },
  });

  console.log("🔐 Peran pengguna pada toko berhasil ditetapkan");

  // Produk untuk Toko Fashion
  const fashionProducts = [
    {
      name: "Kaos Katun Premium",
      slug: "premium-cotton-tshirt",
      description:
        "Kaos katun berkualitas tinggi dengan potongan nyaman dan desain modern",
      basePrice: 125000,
      categories: [tshirtsCategory.id],
    },
    {
      name: "Kemeja Kancing Klasik",
      slug: "classic-button-up-shirt",
      description:
        "Kemeja profesional yang cocok untuk kantor dan acara formal",
      basePrice: 275000,
      categories: [shirtsCategory.id, formalCategory.id],
    },
    {
      name: "Hoodie Grafis",
      slug: "graphic-hoodie",
      description:
        "Hoodie hangat dengan cetak grafis stylish, cocok untuk gaya kasual",
      basePrice: 325000,
      categories: [hoodiesCategory.id],
    },
    {
      name: "Jeans Slim Fit",
      slug: "slim-fit-jeans",
      description: "Jeans slim fit modern yang menyanjung siluet Anda",
      basePrice: 450000,
      categories: [jeansCategory.id, pantsCategory.id],
    },
    {
      name: "Celana Pendek Atletik",
      slug: "athletic-shorts",
      description:
        "Celana pendek performa untuk kenyamanan dan mobilitas maksimal",
      basePrice: 175000,
      categories: [shortsCategory.id, sportsCategory.id],
    },
    {
      name: "Jaket Denim",
      slug: "denim-jacket",
      description:
        "Jaket denim klasik dengan gaya modern dan daya tahan tinggi",
      basePrice: 525000,
      categories: [jacketsCategory.id],
    },
    {
      name: "Ransel Kanvas",
      slug: "canvas-backpack",
      description:
        "Ransel kanvas tahan lama dengan banyak kompartemen untuk penggunaan harian",
      basePrice: 225000,
      categories: [bagsCategory.id, accessoriesCategory.id],
    },
    {
      name: "Sepatu Lari",
      slug: "running-shoes",
      description: "Sepatu lari profesional dengan teknologi bantalan canggih",
      basePrice: 675000,
      categories: [shoesCategory.id, sportsCategory.id],
    },
    {
      name: "Polo Klasik",
      slug: "polo-shirt-classic",
      description:
        "Kaos polo klasik dengan logo bordir, cocok untuk semi-formal",
      basePrice: 195000,
      categories: [shirtsCategory.id],
    },
    {
      name: "Sweter V-Neck",
      slug: "vneck-sweater",
      description: "Sweter v-neck nyaman dari campuran wol premium",
      basePrice: 375000,
      categories: [hoodiesCategory.id],
    },
    {
      name: "Celana Chino",
      slug: "chino-pants",
      description: "Celana chino serbaguna untuk kantor maupun kasual",
      basePrice: 425000,
      categories: [pantsCategory.id],
    },
    {
      name: "Celana Pendek Kargo",
      slug: "cargo-shorts",
      description: "Celana pendek kargo fungsional dengan banyak kantong",
      basePrice: 225000,
      categories: [shortsCategory.id],
    },
    {
      name: "Jaket Kulit",
      slug: "leather-jacket",
      description: "Jaket kulit premium dengan gaya klasik",
      basePrice: 1250000,
      categories: [jacketsCategory.id],
    },
    {
      name: "Tas Selempang",
      slug: "crossbody-bag",
      description: "Tas selempang stylish dengan tali yang dapat disesuaikan",
      basePrice: 325000,
      categories: [bagsCategory.id, accessoriesCategory.id],
    },
    {
      name: "Sneakers Olahraga",
      slug: "sneakers-sport",
      description: "Sneakers olahraga nyaman dengan desain modern",
      basePrice: 550000,
      categories: [shoesCategory.id],
    },
    {
      name: "Kaos Lengan Panjang",
      slug: "long-sleeve-tee",
      description: "Kaos lengan panjang nyaman untuk gaya kasual",
      basePrice: 145000,
      categories: [tshirtsCategory.id],
    },
    {
      name: "Kemeja Oxford",
      slug: "oxford-shirt",
      description: "Kemeja oxford premium untuk suasana profesional",
      basePrice: 325000,
      categories: [shirtsCategory.id, formalCategory.id],
    },
    {
      name: "Hoodie Resleting",
      slug: "zip-up-hoodie",
      description: "Hoodie dengan resleting dan kantong depan yang nyaman",
      basePrice: 355000,
      categories: [hoodiesCategory.id],
    },
    {
      name: "Jeans Skinny",
      slug: "skinny-jeans",
      description: "Jeans skinny trendi dengan kenyamanan stretch",
      basePrice: 475000,
      categories: [jeansCategory.id, pantsCategory.id],
    },
    {
      name: "Boardshort",
      slug: "board-shorts",
      description: "Celana pendek cepat kering untuk aktivitas pantai",
      basePrice: 195000,
      categories: [shortsCategory.id, sportsCategory.id],
    },
    {
      name: "Jaket Bomber",
      slug: "bomber-jacket",
      description: "Jaket bomber modern dengan manset rib",
      basePrice: 595000,
      categories: [jacketsCategory.id],
    },
    {
      name: "Tas Tote Besar",
      slug: "tote-bag-large",
      description: "Tas tote luas, ideal untuk kerja dan belanja",
      basePrice: 275000,
      categories: [bagsCategory.id, accessoriesCategory.id],
    },
    {
      name: "Loafers Klasik",
      slug: "loafers-classic",
      description: "Loafers kulit klasik untuk acara formal",
      basePrice: 725000,
      categories: [shoesCategory.id, formalCategory.id],
    },
    {
      name: "Kaus Henley",
      slug: "henley-shirt",
      description: "Kaus henley stylish dengan bukaan kancing",
      basePrice: 165000,
      categories: [tshirtsCategory.id, shirtsCategory.id],
    },
    {
      name: "Kemeja Flanel",
      slug: "flannel-shirt",
      description: "Kemeja flanel hangat untuk cuaca dingin",
      basePrice: 285000,
      categories: [shirtsCategory.id],
    },
    {
      name: "Sweter Pullover",
      slug: "pullover-sweater",
      description: "Sweter pullover hangat untuk musim dingin",
      basePrice: 395000,
      categories: [hoodiesCategory.id],
    },
    {
      name: "Jeans Relaxed Fit",
      slug: "relaxed-fit-jeans",
      description: "Jeans relaxed fit nyaman untuk seharian",
      basePrice: 425000,
      categories: [jeansCategory.id, pantsCategory.id],
    },
    {
      name: "Celana Pendek Bermuda",
      slug: "bermuda-shorts",
      description: "Celana pendek bermuda klasik untuk musim panas",
      basePrice: 185000,
      categories: [shortsCategory.id],
    },
    {
      name: "Jaket Windbreaker",
      slug: "windbreaker-jacket",
      description: "Windbreaker ringan untuk aktivitas luar ruang",
      basePrice: 425000,
      categories: [jacketsCategory.id, sportsCategory.id],
    },
    {
      name: "Clutch Malam",
      slug: "clutch-bag-evening",
      description: "Tas clutch elegan untuk acara spesial",
      basePrice: 425000,
      categories: [bagsCategory.id, accessoriesCategory.id],
    },
    {
      name: "Boots Pendek",
      slug: "boots-ankle",
      description: "Boots pergelangan kaki stylish untuk segala musim",
      basePrice: 825000,
      categories: [shoesCategory.id],
    },
    {
      name: "Tank Top Basic",
      slug: "tank-top-basic",
      description: "Tank top basic ideal untuk layering",
      basePrice: 95000,
      categories: [tshirtsCategory.id],
    },
    {
      name: "Kemeja Putih Formal",
      slug: "dress-shirt-white",
      description: "Kemeja putih klasik untuk busana formal",
      basePrice: 355000,
      categories: [shirtsCategory.id, formalCategory.id],
    },
    {
      name: "Sweatshirt Crewneck",
      slug: "sweatshirt-crewneck",
      description: "Sweatshirt crewneck klasik untuk kenyamanan kasual",
      basePrice: 295000,
      categories: [hoodiesCategory.id],
    },
    {
      name: "Jeans Bootcut",
      slug: "bootcut-jeans",
      description: "Jeans bootcut klasik dengan sedikit flare",
      basePrice: 455000,
      categories: [jeansCategory.id, pantsCategory.id],
    },
    {
      name: "Celana Pendek Denim",
      slug: "denim-shorts",
      description: "Celana pendek denim klasik untuk gaya musim panas",
      basePrice: 205000,
      categories: [shortsCategory.id, jeansCategory.id],
    },
    {
      name: "Jaket Kulit Biker",
      slug: "leather-biker-jacket",
      description: "Jaket kulit biker dengan aksen hardware metal",
      basePrice: 1450000,
      categories: [jacketsCategory.id],
    },
    {
      name: "Tas Pinggang Sport",
      slug: "waist-bag-sport",
      description: "Tas pinggang sporty untuk kepraktisan tanpa tangan",
      basePrice: 185000,
      categories: [bagsCategory.id, accessoriesCategory.id],
    },
    {
      name: "Sneakers High Top",
      slug: "high-top-sneakers",
      description: "Sneakers high-top klasik bergaya retro",
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

    // Hubungkan kategori
    await prisma.productCategory.createMany({
      data: categories.map((categoryId) => ({
        productId: createdProduct.id,
        categoryId,
      })),
    });

    createdFashionProducts.push(createdProduct);
  }

  // Produk untuk Pusat Teknologi
  const techProducts = [
    {
      name: "Smartphone Pro Max",
      slug: "smartphone-pro-max",
      description:
        "Smartphone flagship dengan fitur canggih dan kualitas build premium",
      basePrice: 15999000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: "Earbuds Nirkabel Pro",
      slug: "wireless-earbuds-pro",
      description: "Earbuds nirkabel premium dengan peredam bising aktif",
      basePrice: 3299000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Jam Tangan Pintar Ultra",
      slug: "smart-watch-ultra",
      description:
        "Smartwatch canggih dengan pemantauan kesehatan dan pelacak kebugaran",
      basePrice: 7499000,
      categories: [
        electronicsCategory.id,
        smartCategory.id,
        watchesCategory.id,
      ],
    },
    {
      name: 'Laptop Pro 16"',
      slug: "laptop-pro-16",
      description:
        "Laptop bertenaga tinggi dengan layar retina memukau dan prosesor tangguh",
      basePrice: 28999000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Tablet Pro 12"',
      slug: "tablet-pro-12",
      description:
        "Tablet profesional dengan dukungan stylus dan layar menawan",
      basePrice: 10999000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Konsol Gim Pro",
      slug: "gaming-console-pro",
      description:
        "Konsol gim generasi terbaru dengan grafis 4K dan ray tracing",
      basePrice: 8999000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: "Drone Kamera 4K",
      slug: "drone-camera-4k",
      description: "Drone profesional dengan kamera 4K dan stabilisasi GPS",
      basePrice: 12499000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Kamera Aksi Hero",
      slug: "action-camera-hero",
      description:
        "Kamera aksi tahan air dengan perekaman 4K dan stabilisasi gambar",
      basePrice: 4299000,
      categories: [electronicsCategory.id, sportsCategory.id],
    },
    {
      name: "Speaker Pintar Hub",
      slug: "smart-speaker-hub",
      description:
        "Speaker pintar dengan kontrol suara dan fitur otomasi rumah",
      basePrice: 2299000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: "Pengisi Daya Nirkabel Premium",
      slug: "wireless-charger-premium",
      description:
        "Pengisi daya nirkabel cepat dengan dukungan banyak perangkat",
      basePrice: 899000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Gelang Pelacak Kebugaran",
      slug: "fitness-tracker-band",
      description: "Pelacak kebugaran canggih dengan pemantauan detak jantung",
      basePrice: 1999000,
      categories: [electronicsCategory.id, smartCategory.id, sportsCategory.id],
    },
    {
      name: "Headset Gaming RGB",
      slug: "gaming-headset-rgb",
      description: "Headset gaming profesional dengan surround 7.1",
      basePrice: 1899000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Smart TV 55" OLED',
      slug: "smart-tv-55-oled",
      description: "Smart TV OLED premium dengan resolusi 4K dan HDR",
      basePrice: 18999000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Speaker Bluetooth Portabel",
      slug: "bluetooth-speaker-portable",
      description: "Speaker portabel tahan air dengan suara 360 derajat",
      basePrice: 1599000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Headset VR Pro",
      slug: "vr-headset-pro",
      description:
        "Headset realitas virtual dengan hand-tracking dan umpan balik haptik",
      basePrice: 9999000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: "Power Bank 20000mAh",
      slug: "power-bank-20000mah",
      description:
        "Power bank berkapasitas besar dengan dukungan pengisian cepat",
      basePrice: 699000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Hub Rumah Pintar",
      slug: "smart-home-hub",
      description: "Pusat kendali untuk perangkat rumah pintar dan otomasi",
      basePrice: 2799000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: "Kamera Mirrorless Digital",
      slug: "digital-camera-mirrorless",
      description: "Kamera mirrorless profesional dengan perekaman video 4K",
      basePrice: 22999000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Keyboard Gaming Mekanis",
      slug: "gaming-keyboard-mechanical",
      description:
        "Keyboard gaming mekanis RGB dengan tombol yang dapat diprogram",
      basePrice: 1799000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Mouse Gaming Nirkabel",
      slug: "gaming-mouse-wireless",
      description:
        "Mouse gaming nirkabel presisi tinggi dengan DPI yang dapat disetel",
      basePrice: 1499000,
      categories: [electronicsCategory.id],
    },
    {
      name: 'Monitor Gaming 27"',
      slug: "monitor-gaming-27",
      description: "Monitor gaming 27 inci 144Hz dengan respons 1ms",
      basePrice: 6999000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Kunci Pintu Pintar",
      slug: "smart-door-lock",
      description:
        "Kunci pintu pintar tanpa kunci fisik dengan aplikasi & biometrik",
      basePrice: 3299000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: "Kamera Keamanan WiFi",
      slug: "security-camera-wifi",
      description: "Kamera keamanan WiFi dengan night vision dan deteksi gerak",
      basePrice: 1299000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Set Bohlam Pintar",
      slug: "smart-light-bulbs-set",
      description: "Bohlam pintar RGB dengan kontrol aplikasi dan penjadwalan",
      basePrice: 899000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: "Termostat Pintar",
      slug: "smart-thermostat",
      description: "Termostat hemat energi dengan algoritme pembelajaran",
      basePrice: 2499000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: "Router Mesh Nirkabel",
      slug: "wireless-router-mesh",
      description: "Sistem router WiFi mesh untuk cakupan seluruh rumah",
      basePrice: 3499000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Jam Tangan Pintar Sport",
      slug: "smart-watch-sport",
      description: "Smartwatch ber-GPS untuk kebugaran dan aktivitas outdoor",
      basePrice: 4499000,
      categories: [
        electronicsCategory.id,
        smartCategory.id,
        watchesCategory.id,
        sportsCategory.id,
      ],
    },
    {
      name: "Casing Keyboard Tablet",
      slug: "tablet-keyboard-case",
      description: "Casing pelindung dengan keyboard bawaan untuk tablet",
      basePrice: 1299000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Webcam HD Pro",
      slug: "webcam-hd-pro",
      description: "Webcam 1080p dengan auto-focus dan peredam noise",
      basePrice: 899000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Hub USB-C Multiport",
      slug: "usb-c-hub-multiport",
      description:
        "Hub USB-C multiport dengan HDMI, USB 3.0, dan pembaca kartu SD",
      basePrice: 699000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Timbangan Pintar Digital",
      slug: "smart-scale-digital",
      description:
        "Timbangan digital dengan analisis komposisi tubuh & sinkronisasi aplikasi",
      basePrice: 999000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: "Lensa Kamera Ponsel",
      slug: "phone-camera-lens-kit",
      description: "Paket lensa profesional untuk fotografi smartphone",
      basePrice: 799000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Botol Air Pintar",
      slug: "smart-water-bottle",
      description: "Botol air dengan pelacak hidrasi dan pengatur suhu",
      basePrice: 1299000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: "Stand Laptop Adjustable",
      slug: "laptop-stand-adjustable",
      description:
        "Stand laptop ergonomis dengan tinggi & sudut yang dapat diatur",
      basePrice: 499000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Jam Alarm Pintar",
      slug: "smart-alarm-clock",
      description:
        "Jam alarm WiFi dengan pelacak tidur dan simulasi matahari terbit",
      basePrice: 899000,
      categories: [electronicsCategory.id, smartCategory.id],
    },
    {
      name: "SSD Eksternal 1TB",
      slug: "external-ssd-1tb",
      description: "SSD eksternal portabel dengan kecepatan transfer tinggi",
      basePrice: 1999000,
      categories: [electronicsCategory.id],
    },
    {
      name: "Stopkontak Pintar",
      slug: "smart-plug-outlet",
      description: "Stopkontak pintar ber-WiFi dengan pemantauan energi",
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

    // Hubungkan kategori
    await prisma.productCategory.createMany({
      data: categories.map((categoryId) => ({
        productId: createdProduct.id,
        categoryId,
      })),
    });

    createdTechProducts.push(createdProduct);
  }

  console.log("📦 Produk berhasil dibuat");

  // Tambahkan gambar produk
  for (const product of [...createdFashionProducts, ...createdTechProducts]) {
    await prisma.productImage.createMany({
      data: [
        {
          productId: product.id,
          url: `https://picsum.photos/400/300?random=${product.id}&1`,
          alt: `${product.name} - Gambar 1`,
          order: 0,
        },
        {
          productId: product.id,
          url: `https://picsum.photos/400/300?random=${product.id}&2`,
          alt: `${product.name} - Gambar 2`,
          order: 1,
        },
      ],
    });
  }

  console.log("🖼️ Gambar produk ditambahkan");

  // Buat opsi varian untuk produk fashion
  for (const product of createdFashionProducts) {
    // Tipe opsi Warna
    const colorOptionType = await prisma.variantOptionType.create({
      data: {
        productId: product.id,
        name: "Warna",
      },
    });

    // Tipe opsi Ukuran
    const sizeOptionType = await prisma.variantOptionType.create({
      data: {
        productId: product.id,
        name: "Ukuran",
      },
    });

    // Nilai warna
    await prisma.variantOptionValue.createMany({
      data: [
        { typeId: colorOptionType.id, name: "Biru" },
        { typeId: colorOptionType.id, name: "Hitam" },
        { typeId: colorOptionType.id, name: "Putih" },
      ],
    });

    // Nilai ukuran
    await prisma.variantOptionValue.createMany({
      data: [
        { typeId: sizeOptionType.id, name: "M" },
        { typeId: sizeOptionType.id, name: "L" },
        { typeId: sizeOptionType.id, name: "XL" },
      ],
    });

    // Ambil nilai yang dibuat untuk pembuatan varian
    const createdColorValues = await prisma.variantOptionValue.findMany({
      where: { typeId: colorOptionType.id },
    });
    const createdSizeValues = await prisma.variantOptionValue.findMany({
      where: { typeId: sizeOptionType.id },
    });

    // Buat varian (kombinasi warna & ukuran)
    const variantCombinations: Array<[string, string]> = [];
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
          stock: Math.floor(Math.random() * 20) + 5, // Stok acak 5–25
        },
      });

      // Tautkan nilai opsi ke varian
      await prisma.variantOptionValue.updateMany({
        where: { id: { in: [colorId, sizeId] } },
        data: { variantId: variant.id },
      });
    }
  }

  console.log("🎨 Varian untuk produk fashion berhasil dibuat");

  // Buat opsi varian untuk produk teknologi (yang relevan)
  for (const product of createdTechProducts) {
    if (
      product.slug.includes("smartphone") ||
      product.slug.includes("laptop") ||
      product.slug.includes("tablet")
    ) {
      // Tipe opsi Penyimpanan
      const storageOptionType = await prisma.variantOptionType.create({
        data: {
          productId: product.id,
          name: "Penyimpanan",
        },
      });

      // Tipe opsi Warna
      const colorOptionType = await prisma.variantOptionType.create({
        data: {
          productId: product.id,
          name: "Warna",
        },
      });

      // Nilai penyimpanan
      await prisma.variantOptionValue.createMany({
        data: product.slug.includes("smartphone")
          ? [
              { typeId: storageOptionType.id, name: "128GB" },
              { typeId: storageOptionType.id, name: "256GB" },
              { typeId: storageOptionType.id, name: "512GB" },
            ]
          : [
              { typeId: storageOptionType.id, name: "256GB" },
              { typeId: storageOptionType.id, name: "512GB" },
              { typeId: storageOptionType.id, name: "1TB" },
            ],
      });

      // Nilai warna
      await prisma.variantOptionValue.createMany({
        data: [
          { typeId: colorOptionType.id, name: "Abu-abu Space" }, // Space Gray
          { typeId: colorOptionType.id, name: "Perak" }, // Silver
          { typeId: colorOptionType.id, name: "Biru Tua" }, // Midnight Blue
        ],
      });

      // Ambil nilai yang dibuat
      const createdStorageValues = await prisma.variantOptionValue.findMany({
        where: { typeId: storageOptionType.id },
      });
      const createdColorValues = await prisma.variantOptionValue.findMany({
        where: { typeId: colorOptionType.id },
      });

      // Buat varian (kombinasi penyimpanan & warna)
      const variantCombinations: Array<[string, string]> = [];
      for (const storage of createdStorageValues) {
        for (const color of createdColorValues) {
          variantCombinations.push([storage.id, color.id]);
        }
      }

      for (const [storageId, colorId] of variantCombinations) {
        // Hitung selisih harga berdasarkan penyimpanan
        let priceDelta = 0;
        const storage = createdStorageValues.find((s) => s.id === storageId);
        if (storage?.name.includes("512")) priceDelta = 2000000;
        else if (storage?.name.includes("1TB")) priceDelta = 5000000;
        else if (storage?.name.includes("256")) priceDelta = 1000000;

        const variant = await prisma.variant.create({
          data: {
            productId: product.id,
            sku: `${product.slug}-${storageId}-${colorId}`,
            priceAbsolute: product.basePrice,
            priceDelta: priceDelta,
            stock: Math.floor(Math.random() * 15) + 3, // Stok acak 3–18
          },
        });

        // Tautkan nilai opsi ke varian
        await prisma.variantOptionValue.updateMany({
          where: { id: { in: [storageId, colorId] } },
          data: { variantId: variant.id },
        });
      }
    }
  }

  console.log("💻 Varian untuk produk teknologi berhasil dibuat");

  // Buat Diskon
  // Diskon lingkup toko untuk fashion
  await prisma.discount.create({
    data: {
      scope: DiscountScope.STORE,
      type: DiscountType.PERCENT,
      value: 10,
      priority: 100,
      stackable: false,
      startAt: new Date(),
      endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 hari dari sekarang
      storeId: clothingStore.id,
    },
  });

  // Diskon lingkup produk untuk produk tertentu
  await prisma.discount.create({
    data: {
      scope: DiscountScope.PRODUCT,
      type: DiscountType.FIXED,
      value: 200000,
      priority: 50,
      stackable: false,
      startAt: new Date(),
      endAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 hari dari sekarang
      productId: createdTechProducts[0].id,
    },
  });

  // Diskon global
  await prisma.discount.create({
    data: {
      scope: DiscountScope.GLOBAL,
      type: DiscountType.PERCENT,
      value: 5,
      priority: 200,
      stackable: true,
      startAt: new Date(),
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari dari sekarang
    },
  });

  console.log("💰 Diskon berhasil dibuat");

  console.log("✅ Seed selesai tanpa kendala!");
  console.log("\n📊 Ringkasan:");
  console.log(`- Pengguna: 3`);
  console.log(`- Toko: 2`);
  console.log(`- Kategori: 20`);
  console.log(
    `- Produk: ${createdFashionProducts.length + createdTechProducts.length}`
  );
  console.log(`- Produk Toko Fashion: ${createdFashionProducts.length}`);
  console.log(`- Produk Pusat Teknologi: ${createdTechProducts.length}`);
  console.log(
    `- Varian: ${
      createdFashionProducts.length * 9 +
      createdTechProducts.filter(
        (p) =>
          p.slug.includes("smartphone") ||
          p.slug.includes("laptop") ||
          p.slug.includes("tablet")
      ).length *
        9
    }`
  );
  console.log(`- Diskon: 3`);
  console.log("\n🏪 Toko:");
  console.log(`- Toko Fashion (fashion-store): Produk fashion & apparel`);
  console.log(`- Pusat Teknologi (tech-hub): Elektronik & gawai`);
  console.log("\n🔑 Kredensial login:");
  console.log(`- Owner: owner@example.com / password123`);
  console.log(`- Editor: editor@example.com / password123`);
  console.log(`- Viewer: viewer@example.com / password123`);
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
