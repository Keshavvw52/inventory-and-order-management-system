import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Package, Plus, Search, Trash2, PencilLine, SlidersHorizontal } from "lucide-react";

import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/productService";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import ErrorState from "../components/ui/ErrorState";
import PageHeader from "../components/ui/PageHeader";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getInventoryBadge } from "../utils/status";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  sku: z.string().min(1, "SKU code is required").max(100),
  price: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number({ invalid_type_error: "Price must be a number" }).min(0, "Price cannot be negative"),
  ),
  stock_quantity: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number({ invalid_type_error: "Stock must be an integer" }).int().min(0, "Stock cannot be negative"),
  ),
});

const Products = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: "",
      stock_quantity: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      queryClient.invalidateQueries(["dashboardStats"]);
      toast.success("Product created successfully.");
      setIsFormModalOpen(false);
    },
    onError: (requestError) => {
      toast.error(requestError.message || "Failed to create product.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      queryClient.invalidateQueries(["dashboardStats"]);
      toast.success("Product updated successfully.");
      setIsFormModalOpen(false);
    },
    onError: (requestError) => {
      toast.error(requestError.message || "Failed to update product.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      queryClient.invalidateQueries(["dashboardStats"]);
      toast.success("Product deleted successfully.");
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    },
    onError: (requestError) => {
      toast.error(requestError.message || "Failed to delete product.");
    },
  });

  const inventorySummary = useMemo(() => {
    const outOfStock = products.filter((product) => product.stock_quantity === 0).length;
    const lowStock = products.filter((product) => product.stock_quantity > 0 && product.stock_quantity <= 10).length;

    return {
      total: products.length,
      outOfStock,
      lowStock,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const matchesFilter = (product) => {
      if (stockFilter === "all") return true;
      if (stockFilter === "healthy") return product.stock_quantity > 10;
      if (stockFilter === "low") return product.stock_quantity > 0 && product.stock_quantity <= 10;
      if (stockFilter === "out") return product.stock_quantity === 0;
      return true;
    };

    const filtered = products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.sku.toLowerCase().includes(normalizedSearch);

      return matchesSearch && matchesFilter(product);
    });

    const sorters = {
      name: (first, second) => first.name.localeCompare(second.name),
      price: (first, second) => Number(second.price) - Number(first.price),
      stock: (first, second) => second.stock_quantity - first.stock_quantity,
      created: (first, second) => new Date(second.created_at) - new Date(first.created_at),
    };

    return filtered.sort(sorters[sortBy]);
  }, [products, searchTerm, stockFilter, sortBy]);

  const handleCreateOpen = () => {
    setEditingProduct(null);
    reset({ name: "", sku: "", price: "", stock_quantity: "" });
    setIsFormModalOpen(true);
  };

  const handleEditOpen = (product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      sku: product.sku,
      price: Number(product.price),
      stock_quantity: product.stock_quantity,
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteOpen = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
      return;
    }

    createMutation.mutate(data);
  };

  const tableHeaders = [
    { label: "Product Name", style: { width: "24%" } },
    { label: "SKU", style: { width: "14%" } },
    { label: "Price", style: { width: "14%" } },
    { label: "Stock", style: { width: "14%" } },
    { label: "Created Date", style: { width: "18%" } },
    { label: "Actions", style: { width: "16%", textAlign: "right" } },
  ];

  return (
    <div className="page-stack animate-fade-in">
      <PageHeader
        eyebrow="Inventory / Catalog"
        title="Products Management"
        description="Track product catalog health, keep stock levels accurate, and maintain clean SKU governance."
        meta={
          <div className="summary-inline">
            <span>{inventorySummary.total} products</span>
            <span>{inventorySummary.lowStock} low stock</span>
            <span>{inventorySummary.outOfStock} out of stock</span>
          </div>
        }
        action={
          <Button onClick={handleCreateOpen}>
            <Plus size={16} />
            Add Product
          </Button>
        }
      />

      <Card title="Inventory Catalog" subtitle="Use filters to isolate stock risks and keep your product data clean.">
        <div className="toolbar">
          <div className="search-shell">
            <Search size={16} />
            <input
              type="text"
              className="toolbar-input"
              placeholder="Search products"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="toolbar-group">
            <div className="toolbar-select-shell">
              <SlidersHorizontal size={16} />
              <select className="toolbar-select" value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
                <option value="all">All stock status</option>
                <option value="healthy">In stock</option>
                <option value="low">Low stock</option>
                <option value="out">Out of stock</option>
              </select>
            </div>

            <div className="toolbar-select-shell">
              <select className="toolbar-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="name">Sort by name</option>
                <option value="price">Sort by price</option>
                <option value="stock">Sort by stock</option>
                <option value="created">Sort by created date</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <ErrorState title="Unable to load products" message={error.message} />
        ) : (
          <Table
            headers={tableHeaders}
            isLoading={isLoading}
            isEmpty={filteredProducts.length === 0}
            emptyTitle="No matching products"
            emptyMessage="Try a different search or filter, or add a new product to populate the catalog."
            emptyIcon={Package}
            emptyAction={<Button onClick={handleCreateOpen}>Add Product</Button>}
          >
            {filteredProducts.map((product) => {
              const stockBadge = getInventoryBadge(product.stock_quantity);

              return (
                <tr key={product.id} className="table-row">
                  <td className="td">
                    <div className="entity-cell">
                      <span className="entity-title">{product.name}</span>
                      <span className="entity-meta">ID #{product.id}</span>
                    </div>
                  </td>
                  <td className="td">
                    <code className="code-pill">{product.sku}</code>
                  </td>
                  <td className="td" style={{ fontWeight: 700 }}>
                    {formatCurrency(product.price)}
                  </td>
                  <td className="td">
                    <div className="stack-inline">
                      <span style={{ fontWeight: 700 }}>{product.stock_quantity}</span>
                      <Badge variant={stockBadge.variant}>{stockBadge.label}</Badge>
                    </div>
                  </td>
                  <td className="td">{formatDate(product.created_at)}</td>
                  <td className="td" style={{ textAlign: "right" }}>
                    <div className="row-actions">
                      <button className="table-icon-button" onClick={() => handleEditOpen(product)} title="Edit product">
                        <PencilLine size={16} />
                      </button>
                      <button className="table-icon-button danger" onClick={() => handleDeleteOpen(product)} title="Delete product">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? "Edit product" : "Add product"}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
          <Input label="Product Name" placeholder="Mechanical Keyboard" error={errors.name?.message} {...register("name")} />
          <Input
            label="SKU"
            placeholder="KEYBOARD-MECH-01"
            error={errors.sku?.message}
            disabled={Boolean(editingProduct)}
            {...register("sku")}
          />
          <Input label="Price" type="number" step="0.01" placeholder="0.00" error={errors.price?.message} {...register("price")} />
          <Input
            label="Stock Quantity"
            type="number"
            placeholder="0"
            error={errors.stock_quantity?.message}
            {...register("stock_quantity")}
          />
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete product"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => productToDelete && deleteMutation.mutate(productToDelete.id)}
              isLoading={deleteMutation.isPending}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <div className="dialog-copy">
          <p>
            You are about to permanently remove <strong>{productToDelete?.name}</strong> from the catalog.
          </p>
          <p className="dialog-warning">Deletion fails if the product is referenced by existing orders.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
