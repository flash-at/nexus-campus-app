
import React from "react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryFilterBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelect: (catId: string) => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelect,
}) => (
  <div className="flex gap-2 overflow-x-auto pb-2">
    <Button
      variant={selectedCategory === "" ? "default" : "outline"}
      size="sm"
      onClick={() => onSelect("")}
    >
      All
    </Button>
    {categories.map((c) => (
      <Button
        key={c.id}
        variant={selectedCategory === c.id ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect(c.id)}
        className="whitespace-nowrap"
      >
        <span className="mr-1">{c.icon}</span>
        {c.name}
      </Button>
    ))}
  </div>
);
