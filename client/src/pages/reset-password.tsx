import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Zap, Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be at most 128 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<"loading" | "valid" | "invalid">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [resetComplete, setResetComplete] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const token = new URLSearchParams(window.location.search).get("token");

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenStatus("invalid");
        setErrorMessage("No reset token provided");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (response.ok && data.valid) {
          setTokenStatus("valid");
        } else {
          setTokenStatus("invalid");
          setErrorMessage(data.message || "Invalid or expired reset link");
        }
      } catch (error) {
        setTokenStatus("invalid");
        setErrorMessage("Failed to verify reset link. Please try again.");
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", {
        token,
        password: data.password,
      });
      
      setResetComplete(true);
      toast({
        title: "Password reset successful",
        description: "You can now sign in with your new password.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        <Link href="/">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl gradient-text">FlashFusion</span>
          </div>
        </Link>

        <Card className="glass border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display">
              {resetComplete ? "Password Reset Complete" : "Reset Your Password"}
            </CardTitle>
            <CardDescription>
              {resetComplete
                ? "Your password has been successfully reset."
                : tokenStatus === "loading"
                ? "Verifying your reset link..."
                : tokenStatus === "valid"
                ? "Enter your new password below."
                : "Unable to reset password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tokenStatus === "loading" && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {tokenStatus === "invalid" && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <XCircle className="w-12 h-12 text-destructive" />
                </div>
                <p className="text-muted-foreground">{errorMessage}</p>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setLocation("/auth")}
                  data-testid="button-back-to-login"
                >
                  Back to Sign In
                </Button>
              </div>
            )}

            {tokenStatus === "valid" && !resetComplete && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              className="pl-10 pr-10 glass border-white/10"
                              placeholder="Enter new password"
                              data-testid="input-new-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              data-testid="button-toggle-new-password"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type={showConfirmPassword ? "text" : "password"}
                              className="pl-10 pr-10 glass border-white/10"
                              placeholder="Confirm new password"
                              data-testid="input-confirm-new-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              data-testid="button-toggle-confirm-new-password"
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full btn-gradient"
                    disabled={isSubmitting}
                    data-testid="button-reset-password-submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {resetComplete && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <Button
                  className="w-full btn-gradient"
                  onClick={() => setLocation("/auth")}
                  data-testid="button-go-to-login"
                >
                  Go to Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Remember your password?{" "}
          <Link href="/auth" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
