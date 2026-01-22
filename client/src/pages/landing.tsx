import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  ShoppingCart,
  BarChart3,
  Sparkles,
  Bot,
  Layers,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";
import heroImage from "@assets/generated_images/ai_tech_hero_visualization.png";

const features = [
  {
    icon: ShoppingCart,
    title: "Smart Ecommerce",
    description: "Manage products, orders, and customers with AI-powered insights and automation.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Real-time dashboards with predictive analytics to grow your business faster.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Sparkles,
    title: "AI Content Generator",
    description: "Create product descriptions, marketing copy, and more with cutting-edge AI.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Bot,
    title: "Workflow Automation",
    description: "Automate repetitive tasks and focus on what matters most to your business.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Layers,
    title: "Multi-Platform",
    description: "Sell across multiple channels with unified inventory and order management.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed with instant page loads and real-time updates.",
    gradient: "from-violet-500 to-purple-500",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for small businesses getting started",
    features: ["Up to 100 products", "Basic analytics", "Email support", "1 team member"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
    description: "For growing businesses that need more power",
    features: [
      "Unlimited products",
      "Advanced analytics",
      "AI content generation",
      "Priority support",
      "5 team members",
      "API access",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "For large teams with advanced needs",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Dedicated account manager",
      "Unlimited team members",
      "SLA guarantee",
      "White-label options",
    ],
    highlighted: false,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" data-testid="link-logo">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl gradient-text">FlashFusion</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Shop
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/auth">
                <Button variant="ghost" data-testid="button-login">
                  Log in
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="btn-gradient-sm" data-testid="button-get-started">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
          
          <div className="max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fade-in">
                <Badge variant="secondary" className="glass border-white/20 px-4 py-1.5">
                  <Sparkles className="w-3 h-3 mr-2 text-purple-400" />
                  AI-Powered Ecommerce Platform
                </Badge>
                
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  The Future of{" "}
                  <span className="gradient-text">Ecommerce</span>{" "}
                  is Here
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-xl">
                  Transform your business with AI-powered tools, seamless product management, 
                  and intelligent automation. Everything you need to scale your online store.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link href="/dashboard">
                    <Button className="btn-gradient" data-testid="button-hero-cta">
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline" className="glass border-white/20" data-testid="button-view-demo">
                      View Demo Store
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-background flex items-center justify-center text-xs font-medium"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">Loved by 10,000+ businesses</p>
                  </div>
                </div>
              </div>

              <div className="relative lg:h-[500px] animate-fade-in stagger-2">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl blur-2xl" />
                <div className="relative glass rounded-2xl border border-white/20 overflow-hidden h-full">
                  <img
                    src={heroImage}
                    alt="FlashFusion AI Platform"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="glass border-white/20 px-4 py-1.5 mb-4">
                Features
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                Everything You Need to <span className="gradient-text">Succeed</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Powerful tools and features designed to help you manage, grow, and scale your 
                ecommerce business with the power of AI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={feature.title}
                  className="glass border-white/10 card-glow overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`feature-card-${index}`}
                >
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="glass border-white/20 px-4 py-1.5 mb-4">
                Pricing
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                Simple, Transparent <span className="gradient-text">Pricing</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that best fits your business needs. All plans include a 14-day free trial.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={plan.name}
                  className={`relative overflow-hidden ${
                    plan.highlighted
                      ? "glass border-purple-500/50 scale-105"
                      : "glass border-white/10"
                  } card-glow`}
                  data-testid={`pricing-card-${plan.name.toLowerCase()}`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                  )}
                  <CardContent className="p-6">
                    {plan.highlighted && (
                      <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 border-0">
                        Popular
                      </Badge>
                    )}
                    <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${plan.highlighted ? "btn-gradient" : ""}`}
                      variant={plan.highlighted ? "default" : "outline"}
                      data-testid={`button-select-${plan.name.toLowerCase()}`}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass rounded-2xl border border-white/10 p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
              <div className="relative">
                <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                  Ready to Transform Your Business?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of businesses already using FlashFusion to power their ecommerce success.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/dashboard">
                    <Button className="btn-gradient" data-testid="button-cta-final">
                      Start Your Free Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline" className="glass border-white/20" data-testid="button-explore-products">
                      Explore Products
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold gradient-text">FlashFusion</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 FlashFusion. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
