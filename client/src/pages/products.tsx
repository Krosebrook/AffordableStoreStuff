import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  X,
} from "lucide-react";
import type { Product, Category } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const { toast } = useToast();

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest("POST", "/api/cart", { productId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice =
      Number(product.price) >= priceRange[0] && Number(product.price) <= priceRange[1];
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(product.categoryId || "");
    return matchesSearch && matchesPrice && matchesCategory;
  });

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Products</h1>
          <p className="text-muted-foreground">
            Browse our collection of {products?.length || 0} products
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 w-64 glass border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-products"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="glass border-white/10"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
          <div className="flex border rounded-lg glass border-white/10 overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-none"
              onClick={() => setViewMode("grid")}
              data-testid="button-view-grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-none"
              onClick={() => setViewMode("list")}
              data-testid="button-view-list"
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {showFilters && (
          <Card className="w-64 shrink-0 glass border-white/10 h-fit sticky top-6">
            <CardContent className="p-4 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Filters</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 md:hidden"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Categories</h4>
                {categories?.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                      data-testid={`checkbox-category-${category.id}`}
                    />
                    <label
                      htmlFor={category.id}
                      className="text-sm cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
                {!categories?.length && (
                  <p className="text-sm text-muted-foreground">No categories available</p>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Price Range</h4>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={1000}
                  step={10}
                  className="w-full"
                  data-testid="slider-price-range"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">${priceRange[0]}</span>
                  <span className="text-muted-foreground">${priceRange[1]}</span>
                </div>
              </div>

              {(selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedCategories([]);
                    setPriceRange([0, 1000]);
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex-1">
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategories.map((catId) => {
                const category = categories?.find((c) => c.id === catId);
                return (
                  <Badge key={catId} variant="secondary" className="glass">
                    {category?.name}
                    <button
                      className="ml-2 hover:text-destructive"
                      onClick={() => toggleCategory(catId)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {productsLoading ? (
            <div
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="glass border-white/10 overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts?.length === 0 ? (
            <Card className="glass border-white/10 p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full glass flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategories([]);
                  setPriceRange([0, 1000]);
                }}
                data-testid="button-reset-search"
              >
                Reset Search
              </Button>
            </Card>
          ) : (
            <div
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {filteredProducts?.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(id) => addToCartMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
