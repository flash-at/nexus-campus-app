
import { ProviderLoginHeader } from "@/components/provider/ProviderLoginHeader";
import { ProviderLoginForm } from "@/components/provider/ProviderLoginForm";

const ProviderLogin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-gray-950 dark:via-green-950 dark:to-teal-950">
      <ProviderLoginHeader />
      <ProviderLoginForm />
    </div>
  );
};

export default ProviderLogin;
