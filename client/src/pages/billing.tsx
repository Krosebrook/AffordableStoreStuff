import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, Zap, Loader2 } from "lucide-react";

interface Plan {
  id?: string;
  name: string;
  price: number;
  interval: string;
  productLimit: number | null;
  aiCreditsLimit: number | null;
  teamMembersLimit: number | null;
  storageLimit: number | null;
  features: Record<string, boolean>;
}

interface Usage {
  aiCredits: { used: number; limit: number | null };
  products: { used: number; limit: number | null };
  teamMembers: { used: number; limit: number | null };
  storage: { usedMb: number; limitMb: number | null };
}

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const percentage = limit ? Math.min((used / limit) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {used} / {limit ?? "Unlimited"}
        </span>
      </div>
      {limit && <Progress value={percentage} className="h-2" />}
    </div>
  );
}

export default function BillingPage() {
  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["/api/billing/plans"],
  });

  const { data: subscription } = useQuery<{ planName: string; status: string } | null>({
    queryKey: ["/api/billing/subscription"],
  });

  const { data: usage } = useQuery<Usage>({
    queryKey: ["/api/billing/usage"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await apiRequest("POST", "/api/billing/checkout", { planId });
      return res.json();
    },
    onSuccess: (data: { url: string }) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/billing/portal");
      return res.json();
    },
    onSuccess: (data: { url: string }) => {
      if (data.url) window.location.href = data.url;
    },
  });

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="w-8 h-8" />
          Billing
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and usage
        </p>
      </div>

      {usage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Usage</CardTitle>
            <CardDescription>Your usage for the current billing period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <UsageMeter label="AI Credits" used={usage.aiCredits.used} limit={usage.aiCredits.limit} />
            <UsageMeter label="Products" used={usage.products.used} limit={usage.products.limit} />
            <UsageMeter label="Team Members" used={usage.teamMembers.used} limit={usage.teamMembers.limit} />
            <UsageMeter
              label="Storage"
              used={Math.round(usage.storage.usedMb)}
              limit={usage.storage.limitMb}
            />
          </CardContent>
          {subscription && (
            <CardFooter>
              <Button variant="outline" onClick={() => portalMutation.mutate()} disabled={portalMutation.isPending}>
                {portalMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Manage Subscription
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <Card key={plan.name} className={i === 1 ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {i === 1 && <Badge>Popular</Badge>}
                </div>
                <CardDescription>
                  <span className="text-2xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    {plan.productLimit ?? "Unlimited"} products
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    {plan.aiCreditsLimit ?? "Unlimited"} AI credits/mo
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    {plan.teamMembersLimit ?? "Unlimited"} team members
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    {plan.storageLimit ? `${Math.round(plan.storageLimit / 1024)}GB` : "Unlimited"} storage
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={i === 1 ? "default" : "outline"}
                  onClick={() => plan.id && checkoutMutation.mutate(plan.id)}
                  disabled={checkoutMutation.isPending || !plan.id}
                >
                  {checkoutMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  {subscription ? "Switch Plan" : "Get Started"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
