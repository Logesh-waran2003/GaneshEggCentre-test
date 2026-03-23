import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { SaleItemCard } from "./SaleItemCard";

interface Product {
  _id: string;
  name: string;
  eggsPerTray: number;
}

interface SaleItem {
  product: Product;
  qtyTrays: number;
  qtyLoose: number;
  ratePerEgg: number;
  ratePerTray: number;
  breakage: number;
}

interface SaleItemListProps {
  items: SaleItem[];
  products: Product[];
  onUpdate: (index: number, field: string, value: number) => void;
  onRemove: (index: number) => void;
  onAdd: (product: Product) => void;
}

export function SaleItemList({ items, products, onUpdate, onRemove, onAdd }: SaleItemListProps) {
  const availableProducts = products.filter((p) => !items.some((i) => i.product._id === p._id));

  return (
    <section className="mb-6 mt-4">
      {items.length > 0 && (
        <>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Items</label>
          <div className="space-y-3">
            {items.map((item, index) => (
              <SaleItemCard key={index} item={item} index={index} onUpdate={onUpdate} onRemove={onRemove} />
            ))}
          </div>
        </>
      )}

      {availableProducts.length > 0 && (
        <div className={items.length > 0 ? "mt-4" : ""}>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Add Product</label>
          <div className="grid grid-cols-2 gap-3">
            {availableProducts.map((product) => (
              <Button
                key={product._id}
                variant="outline"
                className="h-16 rounded-2xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                onClick={() => onAdd(product)}
              >
                <Plus className="size-4 mr-2" />
                {product.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
