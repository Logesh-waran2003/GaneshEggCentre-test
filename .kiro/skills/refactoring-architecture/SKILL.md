---
name: refactoring-architecture
description: Refactor monolithic components, extract API layers, create reusable components, and improve code architecture following DRY and separation of concerns principles. Use when refactoring existing code or improving architecture.
license: MIT
metadata:
  author: Ganesh Egg Centre Team
  version: 1.0.0
  focus: Code quality, architecture, maintainability
---

# Refactoring & Architecture Skill

## Refactoring Priorities

### Phase 1: Foundation (Current)
1. ✅ shadcn/ui setup complete
2. ⏭️ Create `src/api/` layer for all Convex calls
3. ⏭️ Create `src/types/` for TypeScript interfaces
4. ⏭️ Create `<PageContainer>` component
5. ⏭️ Replace custom modals with Dialog/Sheet

### Phase 2: Component Extraction
1. Extract feature components (ContactCard, SaleItemCard, etc.)
2. Create shared components (Modal, EmptyState, StatCard)
3. Use react-hook-form for all forms
4. Replace `<select>` with shadcn Select

### Phase 3: Mobile Enhancements
1. Add swipe gestures with `@use-gesture/react`
2. Implement pull-to-refresh
3. Add haptic feedback
4. Optimize touch interactions

### Phase 4: State & Performance
1. Use Zustand for client state
2. Optimize React Query caching
3. Add error boundaries
4. Implement loading states

## Refactoring Patterns

### 1. Extract API Layer

**Before (BAD):**
```tsx
// In component
const { data: contacts } = useSuspenseQuery(
  convexQuery(api.contacts.getContacts, {})
);
const createContact = useMutation(api.contacts.createContact);
```

**After (GOOD):**
```tsx
// src/api/contacts.ts
export const useContacts = (type?: "customer" | "vendor") => {
  return useSuspenseQuery(
    convexQuery(api.contacts.getContacts, type ? { type } : {})
  );
};

export const useCreateContact = () => {
  return useMutation(api.contacts.createContact);
};

// In component
import { useContacts, useCreateContact } from "@/api/contacts";

const { data: contacts } = useContacts();
const createContact = useCreateContact();
```

### 2. Extract Page Layout

**Before (BAD):**
```tsx
// Duplicated in every page
<div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto pb-32">
  <header className="flex items-center gap-4 py-4">
    <Button variant="ghost" size="icon" asChild>
      <Link to="/"><ArrowLeft /></Link>
    </Button>
    <h1>Page Title</h1>
  </header>
  {/* content */}
</div>
```

**After (GOOD):**
```tsx
// src/components/layout/PageContainer.tsx
export function PageContainer({ 
  title, 
  subtitle,
  backTo = "/",
  action,
  children 
}: PageContainerProps) {
  return (
    <div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto pb-32">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={backTo}><ArrowLeft /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}

// In pages
<PageContainer title="Contacts" backTo="/">
  <ContactList />
</PageContainer>
```

### 3. Extract Feature Components

**Before (BAD):**
```tsx
// 500+ line monolithic component
function ContactsPage() {
  // 50 lines of state
  // 100 lines of handlers
  // 350 lines of JSX with inline logic
}
```

**After (GOOD):**
```tsx
// src/routes/contacts.index.tsx (thin)
function ContactsPage() {
  return (
    <PageContainer title="Contacts">
      <ContactSearch />
      <ContactList />
      <ContactForm />
    </PageContainer>
  );
}

// src/components/contacts/ContactList.tsx
export function ContactList({ contacts }: ContactListProps) {
  return (
    <div className="flex flex-col gap-3">
      {contacts.map(contact => (
        <ContactCard key={contact._id} contact={contact} />
      ))}
    </div>
  );
}

// src/components/contacts/ContactCard.tsx
export function ContactCard({ contact }: ContactCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        {/* Card content */}
      </CardContent>
    </Card>
  );
}
```

### 4. Replace Custom Modals

**Before (BAD):**
```tsx
{showModal && (
  <div className="fixed inset-0 bg-black/50 z-50">
    <div className="bg-white rounded-3xl p-6">
      {/* content */}
    </div>
  </div>
)}
```

**After (GOOD):**
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

<Dialog open={showModal} onOpenChange={setShowModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

### 5. Add TypeScript Types

**Before (BAD):**
```tsx
const [contact, setContact] = useState<any>(null);
const [items, setItems] = useState<any[]>([]);
```

**After (GOOD):**
```tsx
// src/types/contact.ts
export interface Contact {
  _id: string;
  name: string;
  type: "customer" | "vendor";
  phone?: string;
  priceAdjustment: number;
  currentBalance: number;
}

// In component
import { Contact } from "@/types/contact";

const [contact, setContact] = useState<Contact | null>(null);
```

### 6. Extract Business Logic

**Before (BAD):**
```tsx
// In component
const totalAmount = items.reduce((acc, item) => {
  const trayAmount = item.qtyTrays * item.ratePerTray;
  const looseAmount = item.qtyLoose * item.ratePerEgg;
  return acc + trayAmount + looseAmount;
}, 0);
```

**After (GOOD):**
```tsx
// src/lib/calculations.ts
export function calculateSaleTotal(items: SaleItem[]): number {
  return items.reduce((acc, item) => {
    return acc + 
      (item.qtyTrays * item.ratePerTray) + 
      (item.qtyLoose * item.ratePerEgg);
  }, 0);
}

// In component
import { calculateSaleTotal } from "@/lib/calculations";

const totalAmount = calculateSaleTotal(items);
```

## Refactoring Checklist

Before refactoring:
- [ ] Identify code duplication
- [ ] Check for inline API calls
- [ ] Look for `any` types
- [ ] Find custom modals/forms
- [ ] Identify business logic in components

After refactoring:
- [ ] API calls moved to `src/api/`
- [ ] Types defined in `src/types/`
- [ ] Components are small (<200 lines)
- [ ] No code duplication
- [ ] Using shadcn components
- [ ] Business logic in `src/lib/`
- [ ] Proper TypeScript types

## Code Quality Metrics

**Good Component:**
- < 200 lines
- Single responsibility
- Uses API layer
- Proper types
- No duplication

**Good API Module:**
- Centralized queries/mutations
- Typed return values
- Reusable hooks
- Clear naming

**Good Type Definition:**
- No `any` types
- Proper interfaces
- Exported from `src/types/`
- Used consistently

## When to Use This Skill

- Refactoring monolithic components
- Extracting API layers
- Creating reusable components
- Improving type safety
- Reducing code duplication
- Following architecture audit recommendations

## Related Files

- `ARCHITECTURE_AUDIT.md` - Detailed refactoring plan
- `.kiro/RULES.md` - Architecture rules
- `SETUP_COMPLETE.md` - Available components
