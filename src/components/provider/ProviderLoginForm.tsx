import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { getPartnerAuthErrorMessage } from "@/utils/partnerSupabaseAuth";
import { usePartnerAuth } from "@/hooks/usePartnerAuth";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export const ProviderLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn, loading } = usePartnerAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await signIn(values.email, values.password);
      navigate("/partner-dashboard");
    } catch (error: any) {
      console.error("Authentication error:", error);
      const errorMessage = getPartnerAuthErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Partner Sign In</CardTitle>
          <CardDescription>Manage your store and services</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Mail className="h-4 w-4" />
                      Business Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="manager@business.com"
                        className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500"
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
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Lock className="h-4 w-4" />
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500 pr-12"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-center pt-0 pb-6 md:pb-8">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Not a partner yet?{" "}
            <Link to="/provider/register" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
              Register Here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
