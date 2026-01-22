import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { SplashScreen } from "@/components/splash-screen";
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
  Shield,
  Clock,
  Cpu,
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const skipped = sessionStorage.getItem("flashfusion_splash_skipped");
      return !skipped;
    } catch {
      return false;
    }
  });
  const featuresReveal = useScrollReveal<HTMLDivElement>();
  const pricingReveal = useScrollReveal<HTMLDivElement>();
  const ctaReveal = useScrollReveal<HTMLDivElement>();
  const trustReveal = useScrollReveal<HTMLDivElement>();

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden animate-fade-in">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" data-testid="link-logo">
              <div className="flex items-center gap-2 hover-lift">
                <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl gradient-text">FlashFusion</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                Features
              </a>
              <a href="#trust" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                Security
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                Pricing
              </a>
              <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                Shop
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/auth" className="hidden sm:block">
                <Button variant="ghost" className="focus-glow" data-testid="button-login">
                  Log in
                </Button>
              </Link>
              <Link href="/dashboard" className="hidden sm:block">
                <Button variant="gradient" className="focus-glow" data-testid="button-get-started">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-white/10 animate-fade-in">
            <nav className="flex flex-col p-4 space-y-1">
              <a 
                href="#features" 
                className="text-sm text-foreground py-2 px-3 rounded-lg hover-elevate"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-features"
              >
                Features
              </a>
              <a 
                href="#trust" 
                className="text-sm text-foreground py-2 px-3 rounded-lg hover-elevate"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-security"
              >
                Security
              </a>
              <a 
                href="#pricing" 
                className="text-sm text-foreground py-2 px-3 rounded-lg hover-elevate"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-pricing"
              >
                Pricing
              </a>
              <Link 
                href="/products" 
                className="text-sm text-foreground py-2 px-3 rounded-lg hover-elevate"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-shop"
              >
                Shop
              </Link>
              <div className="pt-3 border-t border-white/10 space-y-2">
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full glass border-white/20" data-testid="mobile-button-login">
                    Log in
                  </Button>
                </Link>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="gradient" className="w-full" data-testid="mobile-button-get-started">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-hero-radial" />
          <div className="absolute inset-0 bg-hero-gradient" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
          
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
                    <Button variant="gradient" size="lg" className="focus-glow" data-testid="button-hero-cta">
                      Start Creating
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline" size="lg" className="glass border-white/20 focus-glow hover-lift" data-testid="button-view-demo">
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

        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute inset-0 bg-surface-gradient-subtle" />
          <div 
            ref={featuresReveal.ref}
            className={`max-w-7xl mx-auto relative reveal ${featuresReveal.isRevealed ? 'revealed' : ''}`}
          >
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
                  className="glass border-white/10 card-glow hover-lift transition-transform duration-200"
                  style={{ 
                    opacity: featuresReveal.isRevealed ? 1 : 0,
                    transform: featuresReveal.isRevealed ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`
                  }}
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

        <section id="trust" className="py-24 px-4 sm:px-6 lg:px-8">
          <div 
            ref={trustReveal.ref}
            className={`max-w-7xl mx-auto reveal ${trustReveal.isRevealed ? 'revealed' : ''}`}
          >
            <div className="text-center mb-16">
              <Badge variant="secondary" className="glass border-white/20 px-4 py-1.5 mb-4">
                Trust & Security
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                Built for <span className="gradient-text">Enterprise</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Security and reliability at the core of everything we build.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Secure by Design</h3>
                <p className="text-muted-foreground text-sm">End-to-end encryption and secure data handling</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">99.9% Uptime</h3>
                <p className="text-muted-foreground text-sm">Reliable infrastructure you can count on</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
                <p className="text-muted-foreground text-sm">Cutting-edge AI with multiple provider support</p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
          <div 
            ref={pricingReveal.ref}
            className={`max-w-7xl mx-auto relative reveal ${pricingReveal.isRevealed ? 'revealed' : ''}`}
          >
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
                  className={`relative overflow-visible hover-lift transition-transform duration-200 ${
                    plan.highlighted
                      ? "glass border-purple-500/50 scale-105 z-10"
                      : "glass border-white/10"
                  } card-glow`}
                  style={{ 
                    opacity: pricingReveal.isRevealed ? 1 : 0,
                    transform: pricingReveal.isRevealed 
                      ? (plan.highlighted ? 'scale(1.05)' : 'scale(1)') 
                      : 'translateY(20px)',
                    transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`
                  }}
                  data-testid={`pricing-card-${plan.name.toLowerCase()}`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-accent-gradient rounded-t-xl" />
                  )}
                  <CardContent className="p-6">
                    {plan.highlighted && (
                      <Badge className="absolute top-4 right-4 bg-accent-gradient border-0">
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
                      className={`w-full focus-glow ${plan.highlighted ? "btn-gradient" : ""}`}
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
          <div 
            ref={ctaReveal.ref}
            className={`max-w-4xl mx-auto text-center reveal ${ctaReveal.isRevealed ? 'revealed' : ''}`}
          >
            <div className="gradient-border rounded-2xl p-8 sm:p-12 relative overflow-visible">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
              <div className="relative">
                <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                  Ready to Transform Your Business?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of businesses already using FlashFusion to power their ecommerce success.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/dashboard">
                    <Button className="btn-gradient focus-glow press-effect" data-testid="button-cta-final">
                      Start Your Free Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline" className="glass border-white/20 focus-glow hover-lift" data-testid="button-explore-products">
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
