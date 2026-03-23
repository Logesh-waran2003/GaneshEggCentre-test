import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

interface PageContainerProps {
  title: string;
  backTo: string;
  action?: ReactNode;
  children: ReactNode;
}

export function PageContainer({ title, backTo, action, children }: PageContainerProps) {
  return (
    <div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto pb-32">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-2xl">
            <Link to={backTo}>
              <ArrowLeft className="size-6 text-gray-600" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-indigo-950">{title}</h1>
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}
