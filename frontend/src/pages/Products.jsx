import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Search, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";

import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/productService";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";

// Zod Validation Schema
const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  sku: z.string().min(1, "SKU code is required").max(100),
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Price must be a number" }).min(0, "Price cannot be negative")
  ),
  stock_quantity: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Stock must be an integer" }).int().min(0, "Stock cannot be negative")
  ),
});

const Products = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // 1. Fetch Products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  // 2. React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
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

  // Open modal for Create
  const handleCreateOpen = () => {
    setEditingProduct(null);
    reset({
      name: "",
      sku: "",
      price: "",
      stock_quantity: "",
    });
    setIsFormModalOpen(true);
  };

  // Open modal for Edit
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

  // Open delete confirmation
  const handleDeleteOpen = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // 3. Mutations
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Product created successfully!");
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create product.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Product updated successfully!");
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update product.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Product deleted successfully!");
      setIsDeleteModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete product. It may be referenced in active orders.");
    },
  });

  // Form Submit Handler
  const onSubmit = (data) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  // Filter products by search term
  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term)
    );
  });

  // Table Headers
  const tableHeaders = [
    { label: "Product Name", style: { width: "35%" } },
    { label: "SKU / Code", style: { width: "20%" } },
    { label: "Price", style: { width: "15%" } },
    { label: "Stock Qty", style: { width: "15%" } },
    { label: "Actions", style: { width: "15%", textAlign: "right" } },
  ];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header and Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        {/* Search bar */}
        <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
          <Search 
            size={18} 
            style={{ 
              position: "absolute", 
              left: "14px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "var(--text-muted)" 
            }} 
          />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            className="form-input"
            style={{ paddingLeft: "42px", width: "100%" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button onClick={handleCreateOpen}>
          <Plus size={18} />
          Add Product
        </Button>
      </div>

      {/* Main Inventory Card */}
      <Card>
        {error ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--danger)", padding: "20px" }}>
            <AlertCircle size={24} />
            <div>
              <h4 style={{ fontWeight: 700 }}>Error loading inventory</h4>
              <p style={{ fontSize: "0.875rem", marginTop: "2px" }}>{error.message}</p>
            </div>
          </div>
        ) : (
          <Table
            headers={tableHeaders}
            isLoading={isLoading}
            isEmpty={filteredProducts.length === 0}
            emptyMessage={searchTerm ? "No products match your search criteria." : "No products available. Get started by adding a product."}
          >
            {filteredProducts.map((product) => {
              const isLowStock = product.stock_quantity <= 10;
              return (
                <tr key={product.id} className="table-row">
                  <td className="td" style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {product.name}
                  </td>
                  <td className="td">
                    <code style={{ fontSize: "0.8125rem", padding: "4px 8px", backgroundColor: "#f1f5f9", borderRadius: "4px" }}>
                      {product.sku}
                    </code>
                  </td>
                  <td className="td" style={{ fontWeight: 600 }}>
                    ${Number(product.price).toFixed(2)}
                  </td>
                  <td className="td">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 700 }}>{product.stock_quantity}</span>
                      {isLowStock && (
                        <span className="badge badge-warning" style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
                          Low Stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="td" style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button
                        title="Edit Product"
                        onClick={() => handleEditOpen(product)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--text-secondary)",
                          padding: "6px",
                          borderRadius: "6px",
                          transition: "all 0.15s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#e2e8f0"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        title="Delete Product"
                        onClick={() => handleDeleteOpen(product)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--danger)",
                          padding: "6px",
                          borderRadius: "6px",
                          transition: "all 0.15s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "var(--danger-light)"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      >
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

      {/* Create / Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? "Edit Product Details" : "Register New Product"}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit(onSubmit)} 
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            label="Product Name"
            placeholder="e.g. Mechanical Keyboard"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="SKU Code"
            placeholder="e.g. KEYBOARD-MECH-01"
            error={errors.sku?.message}
            {...register("sku")}
            disabled={!!editingProduct} // SKU shouldn't be editable typically
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.price?.message}
              {...register("price")}
            />
            <Input
              label="Stock Quantity"
              type="number"
              placeholder="0"
              error={errors.stock_quantity?.message}
              {...register("stock_quantity")}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Product"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete Product
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Are you sure you want to delete the product <strong>{productToDelete?.name}</strong>?
          </p>
          <p style={{ color: "var(--danger)", fontSize: "0.8125rem", fontWeight: 600 }}>
            ⚠️ This action is permanent. If this product is referenced in active orders, deletion will fail.
          </p>
        </div>
      </Modal>

    </div>
  );
};

export default Products;
