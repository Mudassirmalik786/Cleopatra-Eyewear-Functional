import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth-context";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSuccess: () => void;
}

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({ onSwitchToRegister, onSuccess }: LoginFormProps) {
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await apiRequest("POST", "/api/auth/login", {
        email: data.email,
        password: data.password,
      });
      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: "Login successful",
        description: "Welcome back to Cleopatra Eyewear!",
      });
      await refreshUser();
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
      });
    },
  });

  function onSubmit(data: LoginFormValues) {
    loginMutation.mutate(data);
  }

  return (
    <div className="px-6 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-poppins mb-2">Welcome Back</h2>
        <p className="text-neutral-600 dark:text-neutral-400">Sign in to your account</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      {...field} 
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-neutral-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Icons.eye className="h-5 w-5" />
                      ) : (
                        <Icons.eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
              )}
            />
            <a 
              href="#" 
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              Forgot password?
            </a>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary text-white hover:bg-primary-dark"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300 dark:border-neutral-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-neutral-900 text-neutral-500">Or continue with</span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" className="flex items-center justify-center">
            <Icons.google className="h-5 w-5 mr-2 text-red-500" />
            <span>Google</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center">
            <Icons.facebook className="h-5 w-5 mr-2 text-blue-600" />
            <span>Facebook</span>
          </Button>
        </div>
      </div>
      
      <p className="text-center mt-6 text-sm text-neutral-600 dark:text-neutral-400">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-primary hover:text-primary-dark"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
