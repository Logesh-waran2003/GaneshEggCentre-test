import { createFileRoute, Link } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/products")({
  component: Products,
});

function Products() {
  const { data: products } = useSuspenseQuery(
    convexQuery(api.products.getProducts, {})
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);

  return (
    <div className="min-h-[100dvh] bg-gray-50 p-4 safe-area-inset">
      <div className="max-w-md mx-auto">
        <header className="flex items-center gap-4 py-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-indigo-950">Products</h1>
            <p className="text-gray-500 text-sm">Manage egg types</p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setShowForm(true);
            }}
            size="icon"
            className="bg-indigo-600 hover:bg-indigo-700 rounded-full"
          >
            <Plus className="size-5" />
          </Button>
        </header>

        {showForm && (
          <ProductForm
            productId={editingId}
            onClose={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          />
        )}

        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product._id} className="border-gray-100 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {product.eggsPerTray} eggs per tray
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingId(product._id);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="size-4 text-indigo-600" />
                  </Button>
                  <DeleteButton productId={product._id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductForm({
  productId,
  onClose,
}: {
  productId: Id<"products"> | null;
  onClose: () => void;
}) {
  const { data: products } = useSuspenseQuery(
    convexQuery(api.products.getProducts, {})
  );
  const product = productId
    ? products.find((p) => p._id === productId)
    : null;

  const [name, setName] = useState(product?.name || "");
  const [eggsPerTray, setEggsPerTray] = useState(
    product?.eggsPerTray?.toString() || "30"
  );

  const createProduct = useMutation(api.products.createProduct);
  const updateProduct = useMutation(api.products.updateProduct);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productId) {
      await updateProduct({
        id: productId,
        name,
        eggsPerTray: Number(eggsPerTray),
      });
    } else {
      await createProduct({
        name,
        eggsPerTray: Number(eggsPerTray),
      });
    }
    onClose();
  };

  return (
    <Card className="border-indigo-200 shadow-lg mb-6">
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Product Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Brown Large"
              required
              className="border-gray-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Eggs Per Tray
            </label>
            <Input
              type="number"
              value={eggsPerTray}
              onChange={(e) => setEggsPerTray(e.target.value)}
              placeholder="30"
              required
              className="border-gray-200"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {productId ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function DeleteButton({ productId }: { productId: Id<"products"> }) {
  const deleteProduct = useMutation(api.products.deleteProduct);
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            await deleteProduct({ id: productId });
            setConfirming(false);
          }}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setConfirming(false)}
          className="text-gray-600"
        >
          ✕
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setConfirming(true)}
    >
      <Trash2 className="size-4 text-gray-400" />
    </Button>
  );
}
