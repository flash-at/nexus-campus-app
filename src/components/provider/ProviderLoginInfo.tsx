
import React from 'react';
import Logo from '@/components/Logo';
import { Package, BarChart3, Users } from 'lucide-react';

const features = [
  { icon: Package, title: "Manage Your Store", description: "Easily add, update, and manage your products or services." },
  { icon: BarChart3, title: "Track Your Growth", description: "Access analytics to monitor your sales and performance." },
  { icon: Users, title: "Reach More Students", description: "Connect with the entire campus community in one place." }
];

export const ProviderLoginInfo = () => {
  return (
    <div className="hidden lg:flex flex-col justify-center space-y-8 text-white">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Logo className="text-white" width={28} height={28} />
          </div>
          <h1 className="text-3xl font-bold">
            CampusConnect
          </h1>
        </div>
        <h2 className="text-4xl font-bold mb-4">
          Partner Portal
        </h2>
        <p className="text-xl text-white/80 leading-relaxed">
          Grow your business by connecting with students on campus.
        </p>
      </div>

      <div className="space-y-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <feature.icon className="w-6 h-6 text-green-900" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-white/80 text-sm leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
