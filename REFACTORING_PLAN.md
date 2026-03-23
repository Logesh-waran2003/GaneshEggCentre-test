# Comprehensive Refactoring Plan
**Ganesh Egg Centre PWA - Complete Architecture Overhaul**

**Date:** 2026-02-17  
**Skills Applied:** 6 Agent Skills (mobile-pwa, refactoring, frontend-design, code-simplifier, react-best-practices, composition-patterns)  
**Status:** Ready to Execute

---

## Executive Summary

### Current State
- ❌ **117 inline API calls** across 15 route files
- ❌ **No API layer** - direct Convex calls everywhere
- ❌ **No type definitions** - `any` types throughout
- ❌ **Monolithic components** - 530 lines (sales), 371 lines (inventory)
- ❌ **Code duplication** - page layout repeated 15+ times
- ❌ **Custom modals** - not using shadcn Dialog/Sheet
- ❌ **Manual form state** - no react-hook-form
- ❌ **Performance issues** - waterfalls, no memoization
- ❌ **Boolean prop proliferation** - poor composition

### Target State
- ✅ **Centralized API layer** in `src/api/`
- ✅ **Type-safe** with interfaces in `src/types/`
- ✅ **Small components** (<200 lines each)
- ✅ **Reusable PageContainer** component
- ✅ **shadcn Dialog/Sheet** for all modals
- ✅ **react-hook-form** for all forms
- ✅ **Optimized performance** (Vercel best practices)
- ✅ **Proper composition** (compound components)

---

## Critical Metrics

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Inline API calls | 117 | 0 | CRITICAL |
| `any` types | 50+ | 0 | HIGH |
| Avg component size | 350 lines | <200 lines | HIGH |
| Code duplication | 15x layout | 1x PageContainer | HIGH |
| Custom modals | 5 | 0 (use shadcn) | MEDIUM |
| Manual forms | 8 | 0 (use react-hook-form) | MEDIUM |
| Waterfalls | Multiple | 0 (Promise.all) | CRITICAL |
| Boolean props | Many | 0 (composition) | MEDIUM |

---

## 12-Phase Refactoring Plan

### Phase 1: Create API Layer Foundation ⚡ CRITICAL
**Priority:** 1 (CRITICAL)  
**Effort:** 4 hours  
**Impact:** Eliminates 117 inline API calls

**Files to Create:**
```
src/api/
├── contacts.ts      # 6 hooks (useContacts, useCreateContact, etc.)
├── expenses.ts      # 4 hooks
├── inventory.ts     # 3 hooks
├── transactions.ts  # 5 hooks
├── trips.ts         # 6 hooks
├── products.ts      # 3 hooks
├── users.ts         # 4 hooks
├── rates.ts         # 2 hooks
└── index.ts         # Re-export all
```

**Example Pattern:**
```tsx
// src/api/contacts.ts
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useContacts(type?: "customer" | "vendor") {
  return useSuspenseQuery(
    convexQuery(api.contacts.getContacts, type ? { type } : {})
  );
}

export function useCreateContact() {
  return useMutation(api.contacts.createContact);
}

export function useContact(contactId: string) {
  return useSuspenseQuery(
    convexQuery(api.contacts.getContact, { contactId })
  );
}
```

**Files to Modify:** 15 route files  
**Vercel Rule:** `async-parallel` - Enable Promise.all() for independent fetches

---

### Phase 2: Create TypeScript Types ⚡ HIGH
**Priority:** 2 (HIGH)  
**Effort:** 3 hours  
**Impact:** Eliminates 50+ `any` types

**Files to Create:**
```
src/types/
├── contact.ts       # Contact, ContactType
├── sale.ts          # Sale, SaleItem
├── expense.ts       # Expense
├── trip.ts          # Trip, TripStatus
├── product.ts       # Product
├── user.ts          # User, UserRole
├── transaction.ts   # Transaction, TransactionType
├── rate.ts          # Rate
└── index.ts         # Re-export all
```

**Example:**
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

// src/types/sale.ts
export interface SaleItem {
  product: Product;
  qtyTrays: number;
  qtyLoose: number;
  ratePerEgg: number;
  ratePerTray: number;
  breakage: number;
}
```

**Files to Modify:** All route files  
**Code Simplifier:** Automatically replaces `any` with proper types

---

### Phase 3: Create PageContainer Component ⚡ HIGH
**Priority:** 3 (HIGH)  
**Effort:** 2 hours  
**Impact:** Eliminates 15x layout duplication

**File to Create:**
```tsx
// src/components/layout/PageContainer.tsx
interface PageContainerProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

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
            <h1 className="text-2xl font-bold text-indigo-950">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}
```

**Files to Modify:** 15 route files  
**Mobile PWA:** Remove `min-h-screen`, use proper spacing

---

### Phase 4: Replace Custom Modals ⚡ MEDIUM
**Priority:** 4 (MEDIUM)  
**Effort:** 3 hours  
**Impact:** Consistent modal UX, accessibility

**Files to Modify:**
- `src/routes/inventory.tsx` - StockCheckModal → Dialog
- `src/routes/sales/new.tsx` - Confirmation/Error → Dialog
- `src/routes/expenses.tsx` - Form modal → Sheet

**Pattern:**
```tsx
// Before (BAD)
{showModal && (
  <div className="fixed inset-0 bg-black/50">
    <div className="bg-white rounded-3xl p-6">...</div>
  </div>
)}

// After (GOOD)
<Dialog open={showModal} onOpenChange={setShowModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

---

### Phase 5: Extract Contacts Components ⚡ MEDIUM
**Priority:** 5 (MEDIUM)  
**Effort:** 3 hours  
**Impact:** 231 lines → 4 components (<100 lines each)

**Files to Create:**
```
src/components/contacts/
├── ContactList.tsx      # List rendering
├── ContactCard.tsx      # Individual card
├── ContactForm.tsx      # Add/edit form
└── ContactSearch.tsx    # Search input
```

**Composition Pattern:** Avoid boolean props, use explicit components  
**Vercel Rule:** `rerender-memo` - Memo ContactCard for performance

---

### Phase 6: Extract Sales Components ⚡ HIGH
**Priority:** 6 (HIGH)  
**Effort:** 6 hours  
**Impact:** 530 lines → 6 components (<150 lines each)

**Files to Create:**
```
src/components/sales/
├── CustomerSelector.tsx    # Search & select customer
├── SaleItemCard.tsx        # Individual item
├── SaleItemList.tsx        # List of items
├── SaleSummary.tsx         # Total, cash, credit
├── SaleForm.tsx            # Main form wrapper
└── SaleConfirmDialog.tsx   # Confirmation modal
```

**Composition Pattern:** Compound components with context  
**Vercel Rules:**
- `async-parallel` - Fetch contacts, rates, products in parallel
- `rerender-memo` - Memo SaleItemCard
- `rerender-derived-state` - Derive totalAmount during render

---

### Phase 7: Extract Inventory Components ⚡ MEDIUM
**Priority:** 7 (MEDIUM)  
**Effort:** 4 hours  
**Impact:** 371 lines → 4 components (<150 lines each)

**Files to Create:**
```
src/components/inventory/
├── StockCard.tsx           # Product stock display
├── StockCheckModal.tsx     # Modal component
├── StockCheckForm.tsx      # Form inside modal
└── VarianceDisplay.tsx     # Variance indicator
```

**Composition Pattern:** Lift state to modal provider  
**Vercel Rule:** `rerender-memo` - Memo StockCard

---

### Phase 8: Refactor Forms ⚡ MEDIUM
**Priority:** 8 (MEDIUM)  
**Effort:** 5 hours  
**Impact:** 8 forms → react-hook-form + shadcn Form

**Files to Modify:**
- contacts.index.tsx
- expenses.tsx
- products.tsx
- sales/new.tsx
- intake/new.tsx
- trips/new.tsx
- users.tsx
- setup.tsx

**Pattern:**
```tsx
// Before (BAD)
const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const handleSubmit = async (e) => {
  e.preventDefault();
  // manual validation
};

// After (GOOD)
const form = useForm<ContactFormData>({
  resolver: zodResolver(contactSchema)
});

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
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

---

### Phase 9: Apply React Performance Patterns ⚡ CRITICAL
**Priority:** 9 (CRITICAL)  
**Effort:** 4 hours  
**Impact:** Eliminate waterfalls, optimize re-renders

**Vercel Rules to Apply:**

1. **async-parallel** - Use Promise.all()
```tsx
// Before (BAD) - Waterfall
const { data: contacts } = useSuspenseQuery(...);
const { data: rates } = useSuspenseQuery(...);
const { data: products } = useSuspenseQuery(...);

// After (GOOD) - Parallel
const [contacts, rates, products] = await Promise.all([
  queryClient.ensureQueryData(contactsQuery),
  queryClient.ensureQueryData(ratesQuery),
  queryClient.ensureQueryData(productsQuery)
]);
```

2. **rerender-memo** - Memo expensive components
```tsx
export const ContactCard = memo(function ContactCard({ contact }: Props) {
  // expensive rendering
});
```

3. **rerender-derived-state** - Derive during render
```tsx
// Before (BAD)
const [totalAmount, setTotalAmount] = useState(0);
useEffect(() => {
  setTotalAmount(calculateTotal(items));
}, [items]);

// After (GOOD)
const totalAmount = useMemo(() => calculateTotal(items), [items]);
```

4. **rerender-transitions** - Use startTransition
```tsx
import { useTransition } from "react";

const [isPending, startTransition] = useTransition();

function handleSearch(value: string) {
  startTransition(() => {
    setSearch(value); // Non-urgent update
  });
}
```

---

### Phase 10: Apply Composition Patterns ⚡ MEDIUM
**Priority:** 10 (MEDIUM)  
**Effort:** 4 hours  
**Impact:** Eliminate boolean props, improve flexibility

**Patterns to Apply:**

1. **Avoid Boolean Props**
```tsx
// Before (BAD)
<ContactCard contact={contact} isVendor={true} showBalance={true} />

// After (GOOD)
<VendorCard contact={contact}>
  <ContactBalance amount={contact.balance} />
</VendorCard>
```

2. **Compound Components**
```tsx
// Before (BAD)
<SaleForm 
  showCustomer={true} 
  showItems={true} 
  showSummary={true}
/>

// After (GOOD)
<SaleForm>
  <SaleForm.Customer />
  <SaleForm.Items />
  <SaleForm.Summary />
</SaleForm>
```

3. **Lift State to Provider**
```tsx
// src/components/sales/SaleFormContext.tsx
const SaleFormContext = createContext<SaleFormState | null>(null);

export function SaleFormProvider({ children }: Props) {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [customer, setCustomer] = useState<Contact | null>(null);
  
  return (
    <SaleFormContext.Provider value={{ items, setItems, customer, setCustomer }}>
      {children}
    </SaleFormContext.Provider>
  );
}
```

---

### Phase 11: Create Business Logic Layer ⚡ MEDIUM
**Priority:** 11 (MEDIUM)  
**Effort:** 3 hours  
**Impact:** Extract calculations, validation

**Files to Create:**
```
src/lib/
├── calculations.ts    # Sale totals, credit amounts
├── validation.ts      # Form validation schemas
└── formatting.ts      # Date, currency formatting
```

**Example:**
```tsx
// src/lib/calculations.ts
export function calculateSaleTotal(items: SaleItem[]): number {
  return items.reduce((acc, item) => {
    return acc + 
      (item.qtyTrays * item.ratePerTray) + 
      (item.qtyLoose * item.ratePerEgg);
  }, 0);
}

export function calculateCreditAmount(
  total: number, 
  cashCollected: number
): number {
  return total - cashCollected;
}

// src/lib/validation.ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["customer", "vendor"]),
  phone: z.string().optional(),
  priceAdjustment: z.number().default(0)
});
```

---

### Phase 12: Add Mobile Enhancements ⚡ LOW
**Priority:** 12 (LOW)  
**Effort:** 4 hours  
**Impact:** Native-feeling mobile UX

**Features to Add:**

1. **Swipe Gestures**
```tsx
import { useGesture } from "@use-gesture/react";

const bind = useGesture({
  onSwipe: ({ direction: [dx] }) => {
    if (dx > 0) handleSwipeRight();
    if (dx < 0) handleSwipeLeft();
  }
});

<div {...bind()}>Swipeable card</div>
```

2. **Pull-to-Refresh**
```bash
bun add react-simple-pull-to-refresh
```

3. **Haptic Feedback**
```tsx
function handleAction() {
  if (navigator.vibrate) {
    navigator.vibrate(10); // 10ms vibration
  }
  // action logic
}
```

---

## Implementation Order

### Week 1: Foundation (Phases 1-3)
- Day 1-2: API Layer
- Day 3: TypeScript Types
- Day 4: PageContainer Component
- Day 5: Testing & Integration

### Week 2: Components (Phases 4-7)
- Day 1: Replace Custom Modals
- Day 2: Extract Contacts Components
- Day 3-4: Extract Sales Components
- Day 5: Extract Inventory Components

### Week 3: Forms & Performance (Phases 8-9)
- Day 1-3: Refactor Forms
- Day 4-5: Apply Performance Patterns

### Week 4: Polish (Phases 10-12)
- Day 1-2: Apply Composition Patterns
- Day 3: Business Logic Layer
- Day 4-5: Mobile Enhancements

---

## Success Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Inline API calls | 117 | 0 | 100% |
| `any` types | 50+ | 0 | 100% |
| Largest component | 530 lines | <200 lines | 62% |
| Code duplication | 15x | 1x | 93% |
| Custom modals | 5 | 0 | 100% |
| Manual forms | 8 | 0 | 100% |
| Bundle size | Baseline | -20% | 20% |
| Load time | Baseline | -30% | 30% |

---

## Risk Mitigation

1. **Test After Each Phase** - Don't move to next phase until current is stable
2. **Feature Flags** - Use for gradual rollout
3. **Backup Branch** - Keep working version
4. **Incremental Deployment** - Deploy one feature at a time
5. **User Testing** - Test mobile UX on real devices

---

## Tools & Resources

- **Agent Skills:** 6 skills active (mobile-pwa, refactoring, frontend-design, code-simplifier, react-best-practices, composition-patterns)
- **Documentation:** `.kiro/RULES.md`, `ARCHITECTURE_AUDIT.md`, `SETUP_COMPLETE.md`
- **Package Manager:** bun (ALWAYS)
- **Testing:** Manual testing + Vitest
- **Deployment:** Progressive rollout

---

**Status:** ✅ Plan Complete - Ready to Execute Phase 1
