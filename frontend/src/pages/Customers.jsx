import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Search, Plus, Trash2, AlertCircle } from "lucide-react";

import { getCustomers, createCustomer, deleteCustomer } from "../services/customerService";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";

// Zod Validation Schema
const customerSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(255),
  email: z.string().min(1, "Email address is required").email("Invalid email address format"),
  phone: z.string().max(50).optional().or(z.literal("")),
});

const Customers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // 1. Fetch Customers
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  // 2. React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
    },
  });

  // Open modal for Create
  const handleCreateOpen = () => {
    reset({
      full_name: "",
      email: "",
      phone: "",
    });
    setIsFormModalOpen(true);
  };

  // Open delete confirmation
  const handleDeleteOpen = (customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  // 3. Mutations
  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      toast.success("Customer registered successfully!");
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to register customer.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      toast.success("Customer account removed successfully!");
      setIsDeleteModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove customer. Active orders may be linked to this account.");
    },
  });

  // Form Submit Handler
  const onSubmit = (data) => {
    // Standardize phone payload if empty
    const payload = {
      ...data,
      phone: data.phone || null
    };
    createMutation.mutate(payload);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteMutation.mutate(customerToDelete.id);
    }
  };

  // Filter customers by search term
  const filteredCustomers = customers.filter((customer) => {
    const term = searchTerm.toLowerCase();
    return (
      customer.full_name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      (customer.phone && customer.phone.toLowerCase().includes(term))
    );
  });

  // Table Headers
  const tableHeaders = [
    { label: "Customer Name", style: { width: "35%" } },
    { label: "Email Address", style: { width: "30%" } },
    { label: "Phone Number", style: { width: "20%" } },
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
            placeholder="Search customers by name or email..."
            className="form-input"
            style={{ paddingLeft: "42px", width: "100%" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button onClick={handleCreateOpen}>
          <Plus size={18} />
          Add Customer
        </Button>
      </div>

      {/* Main Customers Table Card */}
      <Card>
        {error ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--danger)", padding: "20px" }}>
            <AlertCircle size={24} />
            <div>
              <h4 style={{ fontWeight: 700 }}>Error loading customer registry</h4>
              <p style={{ fontSize: "0.875rem", marginTop: "2px" }}>{error.message}</p>
            </div>
          </div>
        ) : (
          <Table
            headers={tableHeaders}
            isLoading={isLoading}
            isEmpty={filteredCustomers.length === 0}
            emptyMessage={searchTerm ? "No customers match your search criteria." : "No customers registered. Get started by registering a customer."}
          >
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="table-row">
                <td className="td" style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                  {customer.full_name}
                </td>
                <td className="td">
                  <a 
                    href={`mailto:${customer.email}`} 
                    style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}
                  >
                    {customer.email}
                  </a>
                </td>
                <td className="td" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                  {customer.phone || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Not provided</span>}
                </td>
                <td className="td" style={{ textAlign: "right" }}>
                  <button
                    title="Remove Customer"
                    onClick={() => handleDeleteOpen(customer)}
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
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Add Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Register New Customer"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit(onSubmit)} 
              isLoading={createMutation.isPending}
            >
              Register Customer
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            error={errors.full_name?.message}
            {...register("full_name")}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. john.doe@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Phone Number (Optional)"
            placeholder="e.g. +1 (555) 019-2834"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Customer Account"
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
              Remove Account
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Are you sure you want to remove the customer account for <strong>{customerToDelete?.full_name}</strong>?
          </p>
          <p style={{ color: "var(--danger)", fontSize: "0.8125rem", fontWeight: 600 }}>
            ⚠️ This will fail if the customer has placed active orders in the system.
          </p>
        </div>
      </Modal>

    </div>
  );
};

export default Customers;
