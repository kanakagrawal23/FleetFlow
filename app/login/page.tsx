"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Lock,
  Mail,
  Truck,
  ShieldCheck,
  IdCard,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/auth-client";
import { onboardDriver } from "@/app/login/actions";

type AuthMode = "login" | "register";
type Role =
  | "manager"
  | "dispatcher"
  | "safety"
  | "analyst"
  | "driver";

const CALLBACK_URL = "/dashboard";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<Role>("driver");
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [licenseNum, setLicenseNum] = useState("");
  const [licenseCategory, setLicenseCategory] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (mode === "login") {
      await authClient.signIn.email(
        {
          email: email.trim(),
          password,
          callbackURL: CALLBACK_URL,
        },
        {
          onSuccess: () => {
            toast.success("Signed in successfully");
            router.push(CALLBACK_URL);
          },
          onError: (ctx) => {
            toast.error(ctx.error?.message ?? "Sign in failed");
          },
        }
      );
      setIsLoading(false);
      return;
    }

    // Register
    await authClient.signUp.email(
      {
        email: email.trim(),
        password,
        name: name.trim(),
        role,
        callbackURL: CALLBACK_URL,
      },
      {
        onSuccess: async () => {
          if (role === "driver" && licenseNum.trim() && licenseCategory.trim() && licenseExpiry) {
            const result = await onboardDriver({
              licenseNum: licenseNum.trim(),
              licenseCategory: licenseCategory.trim(),
              expiresAt: licenseExpiry,
            });
            if (result.error) toast.error(result.error);
          }
          toast.success("Account created");
          router.push(CALLBACK_URL);
        },
        onError: (ctx) => {
          toast.error(ctx.error?.message ?? "Sign up failed");
        },
      }
    );
    setIsLoading(false);
  };

  const inputIconClass =
    "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none";
  const selectClass = cn(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-10 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "disabled:pointer-events-none disabled:opacity-50"
  );

  return (
    <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden border-border shadow-lg">
          {/* Header / Brand */}
          <div className="bg-primary text-primary-foreground px-6 pt-8 pb-10 sm:px-8 sm:pt-10 sm:pb-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute -top-[20%] -left-[10%] size-64 rounded-full border-white" />
              <div className="absolute -bottom-[20%] -right-[10%] size-48 rounded-full border-white" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center size-14 sm:size-16 bg-primary-foreground/20 backdrop-blur-md rounded-xl sm:rounded-2xl mb-4 border border-primary-foreground/30 shadow-xl">
                <Truck className="size-7 sm:size-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-primary-foreground tracking-tight">
                FleetOS
              </CardTitle>
              <CardDescription className="text-primary-foreground/80 text-sm mt-1">
                Enterprise Fleet Management
              </CardDescription>
            </div>
          </div>

          <CardContent className="px-6 pb-8 -mt-6 relative z-20 sm:px-8 sm:pb-10">
            {/* Tab switcher */}
            <div className="bg-muted/50 rounded-lg p-1 border border-border flex mb-6 sm:mb-8">
              <Button
                type="button"
                variant={mode === "login" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex-1 rounded-md font-medium",
                  mode === "login" && "shadow-sm"
                )}
                onClick={() => setMode("login")}
              >
                Sign In
              </Button>
              <Button
                type="button"
                variant={mode === "register" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex-1 rounded-md font-medium",
                  mode === "register" && "shadow-sm"
                )}
                onClick={() => setMode("register")}
              >
                Register
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-muted-foreground text-xs uppercase tracking-wider">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className={inputIconClass} />
                      <Input
                        id="name"
                        type="text"
                        required
                        placeholder="John Doe"
                        className="pl-10 h-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-muted-foreground text-xs uppercase tracking-wider">
                      Role Type
                    </Label>
                    <div className="relative">
                      <ShieldCheck className={inputIconClass} />
                      <select
                        id="role"
                        value={role}
                        onChange={(e) =>
                          setRole(e.target.value as Role)
                        }
                        className={selectClass}
                      >
                        <option value="driver">Driver</option>
                        <option value="dispatcher">Dispatcher</option>
                        <option value="manager">Fleet Manager</option>
                        <option value="safety">Safety Officer</option>
                        <option value="analyst">Analyst</option>
                      </select>
                    </div>
                  </div>

                  {role === "driver" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="license" className="text-muted-foreground text-xs uppercase tracking-wider">
                          License Number
                        </Label>
                        <div className="relative">
                          <IdCard className={inputIconClass} />
                          <Input
                            id="license"
                            type="text"
                            placeholder="ABC-12345"
                            className="pl-10 h-10"
                            value={licenseNum}
                            onChange={(e) => setLicenseNum(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-muted-foreground text-xs uppercase tracking-wider">
                          Category
                        </Label>
                        <Input
                          id="category"
                          type="text"
                          placeholder="Class A"
                          className="h-10"
                          onChange={(e) => setLicenseCategory(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiry" className="text-muted-foreground text-xs uppercase tracking-wider">
                          Expiry Date
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                          <Input
                            id="expiry"
                            type="date"
                            className="pr-10 h-10"
                            value={licenseExpiry}
                            onChange={(e) => setLicenseExpiry(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-wider">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className={inputIconClass} />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="pl-10 h-10"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-muted-foreground text-xs uppercase tracking-wider">
                    Password
                  </Label>
                  {mode === "login" && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="text-xs h-auto p-0 font-semibold uppercase tracking-wider"
                    >
                      Forgot?
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Lock className={inputIconClass} />
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="pl-10 h-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 font-semibold shadow-sm"
              >
                {isLoading ? (
                  <span className="size-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === "login"
                        ? "Sign In to Dashboard"
                        : "Create Fleet Account"}
                    </span>
                    <ChevronRight className="size-4 shrink-0" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 sm:mt-8 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "login"
                  ? "Don't have an account yet?"
                  : "Already have an account?"}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="ml-1.5 h-auto p-0 font-semibold"
                  onClick={toggleMode}
                >
                  {mode === "login" ? "Register Now" : "Sign In"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
