
import { ProviderLoginForm } from "@/components/provider/ProviderLoginForm";
import { ProviderLoginInfo } from "@/components/provider/ProviderLoginInfo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";

const ProviderLogin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-700 to-gray-900 dark:from-gray-900 dark:via-teal-950 dark:to-black">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild className="group text-white hover:bg-white/10 hover:text-white">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          <ProviderLoginInfo />

          <div className="flex flex-col items-center justify-center">
             <div className="text-center mb-8 lg:hidden">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Logo className="text-white" width={28} height={28} />
                  </div>
                  <h1 className="text-3xl font-bold text-white">
                    Partner Portal
                  </h1>
                </div>
            </div>
            <ProviderLoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;
