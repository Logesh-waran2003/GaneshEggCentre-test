import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Phone,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
} from "lucide-react";
import { format } from "date-fns";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/contacts/$contactId")({
  component: ContactDetail,
});

function ContactDetail() {
  const { contactId } = Route.useParams();
  const { data: contact } = useSuspenseQuery(
    convexQuery(api.contacts.getContactById, {
      id: contactId as Id<"contacts">,
    })
  );
  const { data: transactions } = useSuspenseQuery(
    convexQuery(api.transactions.getContactTransactions, {
      contactId: contactId as Id<"contacts">,
    })
  );

  if (!contact)
    return (
      <div className="p-8 text-center font-bold text-red-500">
        Contact not found
      </div>
    );

  return (
    <div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto">
      <header className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" asChild className="rounded-2xl">
          <Link to="/contacts">
            <ArrowLeft className="size-6 text-gray-600" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-indigo-950">Profile</h1>
      </header>

      <Card className="border-none bg-indigo-600 text-white shadow-xl shadow-indigo-100 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1 opacity-80">
                {contact.type}
              </p>
              <h2 className="text-3xl font-black tracking-tight">
                {contact.name}
              </h2>
              {contact.phone && (
                <div className="flex items-center gap-1.5 text-indigo-100 mt-2 font-semibold">
                  <Phone className="size-4" />
                  <span className="text-sm">{contact.phone}</span>
                </div>
              )}
            </div>
            <div className="bg-white/20 p-4 rounded-[1.5rem] backdrop-blur-md">
              <Wallet className="size-6 text-white" />
            </div>
          </div>

          <div className="bg-white/10 rounded-3xl p-6 backdrop-blur-sm border border-white/10">
            <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">
              Current Balance
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black">
                ₹{Math.abs(contact.currentBalance).toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-indigo-200 mt-2 font-bold uppercase tracking-tight">
              {contact.currentBalance > 0
                ? "Outstanding to collect"
                : "Payment / Advance due"}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2 px-1">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider">
              Rate Adj: {contact.priceAdjustment > 0 ? "+" : ""}
              {contact.priceAdjustment}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-black text-indigo-950">History</h3>
          <Badge
            variant="outline"
            className="border-indigo-100 text-indigo-900 font-bold uppercase text-[10px]"
          >
            {transactions.length} Records
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          {transactions.map((tx: any) => (
            <Card
              key={tx._id}
              className="border-none shadow-sm bg-white rounded-3xl hover:shadow-md transition-all active:scale-[0.98]"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-4 rounded-[1.25rem] ${
                        tx.type === "SALE" || tx.type === "PAYMENT_OUT"
                          ? "bg-orange-50"
                          : "bg-emerald-50"
                      }`}
                    >
                      {tx.type === "SALE" ? (
                        <ArrowUpRight className="size-6 text-orange-600" />
                      ) : (
                        <ArrowDownLeft className="size-6 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg leading-tight uppercase tracking-tight">
                        {tx.type}
                      </p>
                      <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        {format(new Date(tx.date), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-black text-xl tracking-tight ${
                        tx.type === "SALE" || tx.type === "PAYMENT_OUT"
                          ? "text-orange-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {tx.type === "SALE" || tx.type === "PAYMENT_OUT"
                        ? "+"
                        : "-"}
                      ₹{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                      {tx.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
              <Calendar className="size-8 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 font-bold text-sm">
                No transactions yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
