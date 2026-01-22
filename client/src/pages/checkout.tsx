import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  ShieldCheck,
  Lock,
  Package,
  CheckCircle2,
} from "lucide-react";
import { addressSchema, type CartItemWithProduct } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
  paymentMethod: z.enum(["card", "paypal"]),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const steps = [
  { id: 1, name: "Shipping", icon: Truck },
  { id: 2, name: "Payment", icon: CreditCard },
  { id: 3, name: "Confirm", icon: CheckCircle2 },
];

export default function Checkout() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: cartItems, isLoading: cartLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
      phone: "",
      paymentMethod: "card",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const shippingAddress = {
        firstName: data.firstName,
        lastName: data.lastName,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
      };

      return apiRequest("POST", "/api/orders", {
        shippingAddress,
        billingAddress: shippingAddress,
        paymentMethod: data.paymentMethod,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase. You will receive a confirmation email shortly.",
      });
      setLocation("/orders");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const subtotal = cartItems?.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  ) || 0;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const onSubmit = (data: CheckoutFormData) => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      createOrderMutation.mutate(data);
    }
  };

  if (cartLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <div className="glass rounded-2xl p-12">
          <div className="w-20 h-20 mx-auto rounded-full glass flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some products to your cart before checking out.
          </p>
          <Link href="/products">
            <Button className="btn-gradient" data-testid="button-browse-products">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Link href="/products">
        <Button variant="ghost" className="mb-6" data-testid="button-back-to-products">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Button>
      </Link>

      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                currentStep >= step.id
                  ? "glass border border-purple-500/50"
                  : "text-muted-foreground"
              }`}
            >
              <step.icon
                className={`w-5 h-5 ${
                  currentStep >= step.id ? "text-purple-400" : ""
                }`}
              />
              <span className="font-medium">{step.name}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  currentStep > step.id ? "bg-purple-500" : "bg-white/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-purple-400" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="firstName">First Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                id="firstName"
                                className="glass border-white/10"
                                data-testid="input-first-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="lastName">Last Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                id="lastName"
                                className="glass border-white/10"
                                data-testid="input-last-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="email">Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id="email"
                              type="email"
                              className="glass border-white/10"
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="address1">Address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id="address1"
                              className="glass border-white/10"
                              data-testid="input-address1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="address2">Apartment, suite, etc. (optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id="address2"
                              className="glass border-white/10"
                              data-testid="input-address2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="city">City</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                id="city"
                                className="glass border-white/10"
                                data-testid="input-city"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="state">State</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                id="state"
                                className="glass border-white/10"
                                data-testid="input-state"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="postalCode">Postal Code</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                id="postalCode"
                                className="glass border-white/10"
                                data-testid="input-postal-code"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="phone">Phone (optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id="phone"
                              type="tel"
                              className="glass border-white/10"
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-purple-400" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              <div
                                className={`flex items-center gap-4 p-4 rounded-lg glass border cursor-pointer ${
                                  field.value === "card"
                                    ? "border-purple-500/50"
                                    : "border-white/10"
                                }`}
                              >
                                <RadioGroupItem value="card" id="card" />
                                <Label htmlFor="card" className="flex-1 cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5" />
                                    <div>
                                      <p className="font-medium">Credit / Debit Card</p>
                                      <p className="text-sm text-muted-foreground">
                                        Pay securely with your card
                                      </p>
                                    </div>
                                  </div>
                                </Label>
                              </div>
                              <div
                                className={`flex items-center gap-4 p-4 rounded-lg glass border cursor-pointer ${
                                  field.value === "paypal"
                                    ? "border-purple-500/50"
                                    : "border-white/10"
                                }`}
                              >
                                <RadioGroupItem value="paypal" id="paypal" />
                                <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 bg-blue-500 rounded text-xs flex items-center justify-center font-bold">
                                      P
                                    </div>
                                    <div>
                                      <p className="font-medium">PayPal</p>
                                      <p className="text-sm text-muted-foreground">
                                        Pay with your PayPal account
                                      </p>
                                    </div>
                                  </div>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                      <Lock className="w-4 h-4" />
                      <span>Your payment information is encrypted and secure</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-400" />
                      Order Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Shipping Address</h4>
                      <div className="p-4 rounded-lg glass text-sm">
                        <p>
                          {form.getValues("firstName")} {form.getValues("lastName")}
                        </p>
                        <p>{form.getValues("address1")}</p>
                        {form.getValues("address2") && <p>{form.getValues("address2")}</p>}
                        <p>
                          {form.getValues("city")}, {form.getValues("state")}{" "}
                          {form.getValues("postalCode")}
                        </p>
                        <p>{form.getValues("email")}</p>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-4">
                      <h4 className="font-medium">Order Items</h4>
                      <div className="space-y-3">
                        {cartItems?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-3 rounded-lg glass"
                          >
                            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                              {item.product.images?.[0] ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium">
                              ${(Number(item.product.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    data-testid="button-back"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className="btn-gradient ml-auto"
                  disabled={createOrderMutation.isPending}
                  data-testid="button-continue"
                >
                  {currentStep === 3
                    ? createOrderMutation.isPending
                      ? "Placing Order..."
                      : "Place Order"
                    : "Continue"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="lg:sticky lg:top-6 h-fit">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cartItems?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="bg-white/10" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shipping === 0 ? "text-green-400" : ""}>
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="gradient-text">${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Secure checkout with SSL encryption</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
