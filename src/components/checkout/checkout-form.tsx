"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  User,
  CreditCard,
  Smartphone,
  Building2,
  Phone
} from "lucide-react";
import type { CartStore } from "@/lib/cart";

interface CustomerFormData {
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

interface CheckoutFormProps {
  store: CartStore;
  onSubmit: (customerData: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function CheckoutForm({ store, onSubmit, onCancel, isSubmitting }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    province: "",
    regency: "",
    district: "",
    village: "",
    postalCode: "",
    paymentMethod: "bank_transfer"
  });

  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const validateForm = () => {
    const newErrors: Partial<CustomerFormData> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.province.trim()) newErrors.province = "Province is required";
    if (!formData.regency.trim()) newErrors.regency = "Regency is required";
    if (!formData.district.trim()) newErrors.district = "District is required";
    if (!formData.village.trim()) newErrors.village = "Village is required";
    if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required";
    if (!formData.paymentMethod) newErrors.paymentMethod = "Payment method is required";

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone validation (Indonesia format)
    if (formData.phone && !/^08\d{8,12}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = "Invalid phone number format (should start with 08)";
    }

    // Postal code validation
    if (formData.postalCode && !/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = "Invalid postal code format (5 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const paymentMethods = [
    {
      value: "bank_transfer",
      label: "Bank Transfer",
      icon: Building2,
      description: "Transfer via ATM/M-Banking"
    },
    {
      value: "dana",
      label: "DANA",
      icon: CreditCard,
      description: "Pay with DANA e-wallet"
    },
    {
      value: "gopay",
      label: "GoPay",
      icon: Smartphone,
      description: "Pay with GoPay e-wallet"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Customer Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="John Doe"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john@example.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="08123456789"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Shipping Address</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">Province *</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => handleInputChange("province", e.target.value)}
                  placeholder="DKI Jakarta"
                  className={errors.province ? "border-red-500" : ""}
                />
                {errors.province && <p className="text-sm text-red-500">{errors.province}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="regency">Regency/City *</Label>
                <Input
                  id="regency"
                  value={formData.regency}
                  onChange={(e) => handleInputChange("regency", e.target.value)}
                  placeholder="Jakarta Selatan"
                  className={errors.regency ? "border-red-500" : ""}
                />
                {errors.regency && <p className="text-sm text-red-500">{errors.regency}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  placeholder="Kebayoran Baru"
                  className={errors.district ? "border-red-500" : ""}
                />
                {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="village">Village *</Label>
                <Input
                  id="village"
                  value={formData.village}
                  onChange={(e) => handleInputChange("village", e.target.value)}
                  placeholder="Senayan"
                  className={errors.village ? "border-red-500" : ""}
                />
                {errors.village && <p className="text-sm text-red-500">{errors.village}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                placeholder="12190"
                maxLength={5}
                className={errors.postalCode ? "border-red-500" : ""}
              />
              {errors.postalCode && <p className="text-sm text-red-500">{errors.postalCode}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Method</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    key={method.value}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      formData.paymentMethod === method.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleInputChange("paymentMethod", method.value as CustomerFormData["paymentMethod"])}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-medium">{method.label}</h3>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </div>
                    {formData.paymentMethod === method.value && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="default" className="text-xs">
                          Selected
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {errors.paymentMethod && (
              <p className="text-sm text-red-500 mt-2">{errors.paymentMethod}</p>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Store</span>
                <span className="font-medium">{store.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Items ({store.items.length})</span>
                <span className="font-medium">{formatPrice(store.subtotal)}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(store.subtotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Checkout via WhatsApp
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}