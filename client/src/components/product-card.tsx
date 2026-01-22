import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
}: ProductCardProps) {
  const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : 0;

  return (
    <Card
      className="group glass border-white/10 overflow-hidden card-glow hover:border-white/20 transition-all duration-300"
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/50" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {hasDiscount && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-red-500 border-0">
            -{discountPercent}%
          </Badge>
        )}
        
        {product.featured && (
          <Badge className="absolute top-3 right-12 bg-gradient-to-r from-purple-500 to-blue-500 border-0">
            <Star className="w-3 h-3 mr-1" /> Featured
          </Badge>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 h-8 w-8 rounded-full glass ${
            isInWishlist ? "text-pink-500" : "text-white/70"
          }`}
          onClick={() => onToggleWishlist?.(product.id)}
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`} />
        </Button>

        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            className="w-full btn-gradient-sm"
            onClick={() => onAddToCart(product.id)}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {product.tags && product.tags.length > 0 && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {product.tags[0]}
            </p>
          )}
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-white transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold gradient-text">
              ${Number(product.price).toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${Number(product.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>
          {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
            <p className="text-xs text-orange-400">Only {product.stock} left in stock</p>
          )}
          {product.stock === 0 && (
            <p className="text-xs text-red-400">Out of stock</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
