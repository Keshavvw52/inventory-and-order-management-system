import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Plus, Search, Trash2, Users } from "lucide-react";

import { getCustomers, createCustomer, deleteCustomer } from "../services/customerService";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import ErrorState from "../components/ui/ErrorState";
import PageHeader from "../components/ui/PageHeader";
import { formatDate } from "../utils/formatters";

const customerSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(255),
  email: z.string().min(1, "Email address is required").email("Invalid email address format"),
  phone: z.string().max(50).optional().or(z.literal("")),
});

const Customers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

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

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      queryClient.invalidateQueries(["dashboardStats"]);
      toast.success("Customer registered successfully.");
      setIsFormModalOpen(false);
    },
    onError: (requestError) => {
      toast.error(requestError.message || "Failed to register customer.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      queryClient.invalidateQueries(["dashboardStats"]);
      toast.success("Customer removed successfully.");
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
    },
    onError: (requestError) => {
      toast.error(requestError.message || "Failed to remove customer.");
    },
  });

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return customers.filter((customer) => {
      if (!normalizedSearch) return true;

      return (
        customer.full_name.toLowerCase().includes(normalizedSearch) ||
        customer.email.toLowerCase().includes(normalizedSearch) ||
        (customer.phone || "").toLowerCase().includes(normalizedSearch)
      );
    });
  }, [customers, searchTerm]);

  const handleCreateOpen = () => {
    reset({ full_name: "", email: "", phone: "" });
    setIsFormModalOpen(true);
  };

  const onSubmit = (data) => {
    createMutation.mutate({
      ...data,
      phone: data.phone || null,
    });
  };

  const tableHeaders = [
    { label: "Customer Name", style: { width: "28%" } },
    { label: "Email", style: { width: "28%" } },
    { label: "Phone", style: { width: "18%" } },
    { label: "Created", style: { width: "16%" } },
    { label: "Actions", style: { width: "10%", textAlign: "right" } },
  ];

  return (
    <div className="page-stack animate-fade-in">
      <PageHeader
        eyebrow="CRM / Directory"
        title="Customer Directory"
        description="Maintain a clean customer registry and verify contact information before orders are created."
        meta={<div className="summary-inline"><span>{customers.length} total customers</span></div>}
        action={
          <Button onClick={handleCreateOpen}>
            <Plus size={16} />
            Add Customer
          </Button>
        }
      />

      <Card title="Customer Records" subtitle="Search and review every registered customer profile.">
        <div className="toolbar">
          <div className="search-shell">
            <Search size={16} />
            <input
              type="text"
              className="toolbar-input"
              placeholder="Search customers"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        {error ? (
          <ErrorState title="Unable to load customers" message={error.message} />
        ) : (
          <Table
            headers={tableHeaders}
            isLoading={isLoading}
            isEmpty={filteredCustomers.length === 0}
            emptyTitle="No customers found"
            emptyMessage="Register your first customer to start placing orders and building your CRM history."
            emptyIcon={Users}
            emptyAction={<Button onClick={handleCreateOpen}>Register Customer</Button>}
          >
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="table-row">
                <td className="td">
                  <div className="entity-cell">
                    <span className="entity-title">{customer.full_name}</span>
                    <span className="entity-meta">Customer #{customer.id}</span>
                  </div>
                </td>
                <td className="td">
                  <a href={`mailto:${customer.email}`} className="inline-action-link">
                    {customer.email}
                  </a>
                </td>
                <td className="td">{customer.phone || "Not provided"}</td>
                <td className="td">{formatDate(customer.created_at)}</td>
                <td className="td" style={{ textAlign: "right" }}>
                  <button className="table-icon-button danger" onClick={() => { setCustomerToDelete(customer); setIsDeleteModalOpen(true); }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Register customer"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={createMutation.isPending}>
              Save Customer
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
          <Input label="Full Name" placeholder="John Doe" error={errors.full_name?.message} {...register("full_name")} />
          <Input label="Email" type="email" placeholder="john@example.com" error={errors.email?.message} {...register("email")} />
          <Input label="Phone" placeholder="+1 555 0100" error={errors.phone?.message} {...register("phone")} />
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove customer"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => customerToDelete && deleteMutation.mutate(customerToDelete.id)}
              isLoading={deleteMutation.isPending}
            >
              Remove Customer
            </Button>
          </>
        }
      >
        <div className="dialog-copy">
          <p>
            Remove <strong>{customerToDelete?.full_name}</strong> from the customer directory?
          </p>
          <p className="dialog-warning">This action fails if the customer is referenced by existing orders.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Customers;
