---
name: mobile-pwa-development
description: Build mobile-first PWA features using TanStack Start, Convex, shadcn/ui, and Tailwind CSS. Use when creating new pages, components, or mobile UI features for the Ganesh Egg Centre app.
license: MIT
metadata:
  author: Ganesh Egg Centre Team
  version: 1.0.0
  stack: TanStack Start + Convex + shadcn/ui + Tailwind
---

# Mobile PWA Development Skill

## Project Context

**App:** Ganesh Egg Centre - Egg distribution management PWA  
**Stack:** TanStack Start + Convex + shadcn/ui + Tailwind CSS  
**Package Manager:** bun (ALWAYS)  
**Design:** Mobile-first, touch-optimized

## Architecture Rules

### Directory Structure
```
src/
├── api/              # Convex queries/mutations (centralized)
├── components/
│   ├── [feature]/   # Feature-specific components
│   ├── shared/      # Reusable components
│   ├── layout/      # Layout components
│   └── ui/          # shadcn components
├── hooks/           # Custom React hooks
├── lib/             # Business logic, utilities
├── types/           # TypeScript interfaces
└── routes/          # Page components (thin)
```

### Import Aliases
```tsx
@/components  → src/components
@/api         → src/api
@/types       → src/types
@/lib         → src/lib
@/hooks       → src/hooks
```

## Critical Rules

1. **Package Manager:** ALWAYS use `bun` (never npm/yarn)
2. **Mobile-First:** Design for mobile (max-w-md), touch targets 44px+
3. **NO min-h-screen:** On page content (causes unwanted scrolling)
4. **API Layer:** All Convex calls in `src/api/`, never in components
5. **shadcn/ui:** Use Dialog, Sheet, Form, Select (not custom)
6. **TypeScript:** No `any` types, use proper interfaces from `src/types/`

## Component Patterns

### Page Component (Thin)
```tsx
import { PageContainer } from "@/components/layout/PageContainer";
import { useContacts } from "@/api/contacts";
import { ContactList } from "@/components/contacts/ContactList";

function ContactsPage() {
  const { data: contacts } = useContacts();
  
  return (
    <PageContainer title="Contacts" backTo="/">
      <ContactList contacts={contacts} />
    </PageContainer>
  );
}
```

### API Layer (src/api/contacts.ts)
```tsx
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "../../convex/_generated/api";

export const useContacts = (type?: "customer" | "vendor") => {
  return useSuspenseQuery(
    convexQuery(api.contacts.getContacts, type ? { type } : {})
  );
};
```

### Form with react-hook-form
```tsx
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";

const form = useForm<ContactFormData>();

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  </form>
</Form>
```

### Modal with shadcn Dialog
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
    </DialogHeader>
    <p>Content here</p>
  </DialogContent>
</Dialog>
```

### Mobile Drawer with shadcn Sheet
```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Menu</SheetTitle>
    </SheetHeader>
    <nav>...</nav>
  </SheetContent>
</Sheet>
```

## Styling Guidelines

### Mobile-First Container
```tsx
<div className="p-4 safe-area-inset max-w-md mx-auto pb-20">
  {/* Content */}
</div>
```

### Touch-Friendly Button
```tsx
<Button className="h-12 rounded-2xl">
  {/* 48px minimum touch target */}
</Button>
```

### Scrollable Content
```tsx
<div className="overflow-y-auto">
  {/* Only scrolls when content exceeds viewport */}
</div>
```

## Common Commands

```bash
# Add shadcn component
bunx shadcn@latest add [component]

# Install package
bun add [package]

# Start dev server
bun run dev
```

## Anti-Patterns to Avoid

❌ Direct Convex calls in components  
❌ Custom modals instead of shadcn Dialog  
❌ `any` types  
❌ `min-h-screen` on pages  
❌ Manual form state (use react-hook-form)  
❌ npm/yarn commands

## When to Use This Skill

- Creating new pages or routes
- Building mobile UI components
- Implementing forms or modals
- Adding touch interactions
- Refactoring existing components
- Setting up API calls

## Related Files

- `.kiro/RULES.md` - Complete development rules
- `ARCHITECTURE_AUDIT.md` - Refactoring roadmap
- `SETUP_COMPLETE.md` - shadcn/ui setup guide
