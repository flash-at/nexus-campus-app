
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order: number;
}

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const CategoryGrid = ({ categories, selectedCategory, onCategorySelect }: CategoryGridProps) => {
  const getIcon = (iconName?: string) => {
    if (!iconName) return Icons.ShoppingBag;
    const IconComponent = Icons[iconName as keyof typeof Icons] as LucideIcon;
    return IconComponent || Icons.ShoppingBag;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          selectedCategory === 'all' 
            ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' 
            : 'hover:shadow-lg'
        }`}
        onClick={() => onCategorySelect('all')}
      >
        <CardContent className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-2">
            <Icons.Grid3X3 className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">All</span>
        </CardContent>
      </Card>

      {categories.map((category) => {
        const IconComponent = getIcon(category.icon);
        return (
          <Card 
            key={category.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedCategory === category.id 
                ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => onCategorySelect(category.id)}
          >
            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-2">
                <IconComponent className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
