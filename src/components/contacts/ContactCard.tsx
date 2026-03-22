import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Phone, UserCircle } from "lucide-react";
import { memo } from "react";
import { Contact } from "../../types/contact";
import { cn } from "../../lib/utils";

export const ContactCard = memo(function ContactCard({ contact, showBalance = true }: { contact: Contact; showBalance?: boolean }) {
  return (
    <Link to="/contacts/$contactId" params={{ contactId: contact._id }}>
      <Card className="border-gray-50 shadow-sm overflow-visible hover:border-indigo-200 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("size-12 rounded-2xl flex items-center justify-center", contact.type === "vendor" ? "bg-amber-100" : "bg-indigo-100")}>
              <UserCircle className={cn("size-7", contact.type === "vendor" ? "text-amber-600" : "text-indigo-600")} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">{contact.name}</h3>
                <Badge variant={contact.type === "vendor" ? "warning" : "secondary"}>{contact.type}</Badge>
              </div>
              {contact.phone && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone className="size-3" /> {contact.phone}
                </p>
              )}
            </div>
          </div>
          {showBalance && (
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 tracking-tighter uppercase mb-0.5">Balance</p>
              <p className={cn("font-black text-lg leading-none", contact.currentBalance > 0 ? "text-red-500" : "text-emerald-500")}>
                ₹{Math.abs(contact.currentBalance).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">{contact.currentBalance > 0 ? "You're Owed" : "You Owe"}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
});
