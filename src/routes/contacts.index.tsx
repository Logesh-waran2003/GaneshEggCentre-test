import { createFileRoute } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Search, UserCircle, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { useContacts } from "../api/contacts";
import { Contact } from "../types/contact";
import { ContactCard } from "../components/contacts/ContactCard";
import { ContactForm } from "../components/contacts/ContactForm";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";

export const Route = createFileRoute("/contacts/")({
  component: Contacts,
});

function Contacts() {
  const { data: contacts } = useContacts();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");

  const filteredContacts = useMemo(
    () => contacts.filter((c: Contact) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone && c.phone.includes(search))),
    [contacts, search],
  );

  return (
    <div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto pb-32">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-2xl">
            <Link to="/"><ArrowLeft className="size-6 text-gray-600" /></Link>
          </Button>
          <h1 className="text-2xl font-bold text-indigo-950">Contacts</h1>
        </div>
        <Button size="icon" variant="premium" className="rounded-2xl shadow-indigo-100" onClick={() => setIsAdding(!isAdding)}>
          <Plus className={cn("size-6 transition-transform", isAdding ? "rotate-45" : "")} />
        </Button>
      </header>

      {isAdding && <ContactForm onClose={() => setIsAdding(false)} />}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
        <Input
          placeholder="Search contacts..."
          className="pl-12 bg-white border-gray-100 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredContacts.map((contact: Contact) => (
          <ContactCard key={contact._id} contact={contact} showBalance={isAdmin} />
        ))}
        {filteredContacts.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
            <UserCircle className="size-12 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 font-medium">No contacts found</p>
          </div>
        )}
      </div>
    </div>
  );
}
