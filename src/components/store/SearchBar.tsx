
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <div className="relative mb-6">
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
    <Input
      placeholder="Search for products, snacks, beverages..."
      value={value}
      onChange={e => onChange(e.target.value)}
      className="pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 bg-white shadow-sm"
    />
  </div>
);
