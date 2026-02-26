import { CustomerForm } from "@/components/customer-form";

export default function NewCustomerPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Neuer Kunde</h1>
      <CustomerForm />
    </div>
  );
}
