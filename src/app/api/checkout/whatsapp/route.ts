import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CheckoutItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  postalCode: string;
  paymentMethod: "bank_transfer" | "dana" | "gopay";
}

interface CheckoutData {
  storeId: string;
  storeName: string;
  items: CheckoutItem[];
  subtotal: number;
  customer: CustomerData;
}

export async function POST(request: NextRequest) {
  try {
    const data: CheckoutData = await request.json();

    // Validate required fields
    if (!data.storeId || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid checkout data' },
        { status: 400 }
      );
    }

    // Get store information including WhatsApp number
    const store = await prisma.store.findUnique({
      where: { id: data.storeId },
      select: { waNumber: true, name: true }
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Format WhatsApp message
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(price);
    };

    const getPaymentMethodLabel = (method: string) => {
      switch (method) {
        case 'bank_transfer': return 'Bank Transfer';
        case 'dana': return 'DANA';
        case 'gopay': return 'GoPay';
        default: return method;
      }
    };

    let message = `🛒 *NEW ORDER - ${store.name.toUpperCase()}*\n\n`;

    // Customer Information
    message += `👤 *Customer Information:*\n`;
    message += `• Name: ${data.customer.name}\n`;
    message += `• Email: ${data.customer.email}\n`;
    message += `• Phone: ${data.customer.phone}\n\n`;

    // Shipping Address
    message += `📍 *Shipping Address:*\n`;
    message += `${data.customer.village}, ${data.customer.district}\n`;
    message += `${data.customer.regency}, ${data.customer.province}\n`;
    message += `Postal Code: ${data.customer.postalCode}\n\n`;

    // Payment Method
    message += `💳 *Payment Method:* ${getPaymentMethodLabel(data.customer.paymentMethod)}\n\n`;

    // Order Details
    message += `📦 *Order Details:*\n`;

    data.items.forEach((item, index) => {
      message += `\n${index + 1}. *${item.name}*\n`;
      message += `   • SKU: ${item.sku}\n`;
      message += `   • Quantity: ${item.quantity}\n`;
      message += `   • Price: ${formatPrice(item.price)}\n`;
      message += `   • Subtotal: ${formatPrice(item.price * item.quantity)}\n`;
    });

    message += `\n💰 *Total Amount:* ${formatPrice(data.subtotal)}\n\n`;
    message += `📅 *Order Date:* ${new Date().toLocaleString('id-ID')}\n\n`;
    message += `Please confirm this order and provide payment instructions.\n`;
    message += `Thank you! 🙏`;

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${store.waNumber}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({
      success: true,
      whatsappUrl,
      storeName: store.name,
      orderTotal: data.subtotal
    });

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}