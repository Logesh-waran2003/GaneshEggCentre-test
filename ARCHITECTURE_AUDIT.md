# Architecture Audit - Ganesh Egg Centre

**Date:** 2026-02-17  
**Auditor:** Senior Developer Review  
**Scope:** Full codebase architecture, patterns, and best practices

---

## Executive Summary

The codebase is **functional but lacks proper architectural patterns**. Major issues:
- ❌ No separation of concerns (API logic mixed in components)
- ❌ Massive code duplication across pages
- ❌ No reusable data fetching layer
- ❌ No shared business logic extraction
- ❌ Poor component composition
- ✅ Backend (Convex) is well-organized

**Severity:** MEDIUM-HIGH  
**Recommended Action:** Incremental refactoring (not a rewrite)

---

## Critical Issues

### 1. **NO API/DATA LAYER** ⚠️ CRITICAL

**Problem:** Every page directly calls Convex queries/mutations inline.

**Current Pattern (BAD):**
```tsx
// In EVERY page component:
const { data: contacts } = useSuspenseQuery(
  convexQuery(api.contacts.getContacts, {})
);
const createContact = useMutation(api.contacts.createContact);
```

**Impact:**
- Can't change API structure without touching 15+ files
- No caching strategy
- No error handling consistency
- Can't mock for testing
- Violates Single Responsibility Principle

**Solution:** Create `src/api/` layer:
```
src/api/
  ├── contacts.ts      # All contact-related queries/mutations
  ├── expenses.ts      # All expense operations
  ├── inventory.ts     # All inventory operations
  ├── transactions.ts  # All transaction operations
  └── index.ts         # Re-export all
```

**Example Fix:**
```tsx
// src/api/contacts.ts
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useContacts = (type?: "customer" | "vendor") => {
  return useSuspenseQuery(
    convexQuery(api.contacts.getContacts, type ? { type } : {})
  );
};

export const useCreateContact = () => {
  return useMutation(api.contacts.createContact);
};

export const useContact = (contactId: string) => {
  return useSuspenseQuery(
    convexQuery(api.contacts.getContact, { contactId })
  );
};
```

**Then in components:**
```tsx
// Clean, testable, maintainable
import { useContacts, useCreateContact } from "@/api/contacts";

function Contacts() {
  const { data: contacts } = useContacts();
  const createContact = useCreateContact();
  // ...
}
```

---

### 2. **MASSIVE CODE DUPLICATION** ⚠️ HIGH

**Problem:** Same patterns repeated in every page.

**Duplicated Patterns:**

#### A. Page Layout Structure (100% duplicated)
```tsx
// EVERY page has this:
<div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto min-h-screen pb-32">
  <header className="flex items-center gap-4 py-4">
    <Button variant="ghost" size="icon" asChild>
      <Link to="/"><ArrowLeft /></Link>
    </Button>
    <h1>Page Title</h1>
  </header>
  {/* content */}
</div>
```

**Solution:** Create `<PageContainer>` component:
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
    <div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto min-h-screen pb-32">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={backTo}><ArrowLeft /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-indigo-950">{title}</h1>
            {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}
```

#### B. Form State Management (duplicated 8+ times)
Every form has:
```tsx
const [field1, setField1] = useState("");
const [field2, setField2] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    await mutation({ field1, field2 });
    // reset
  } catch (err) {
    alert(err.message);
  } finally {
    setIsSubmitting(false);
  }
};
```

**Solution:** Use `react-hook-form` or create custom hook:
```tsx
// src/hooks/useFormSubmit.ts
export function useFormSubmit<T>(
  onSubmit: (data: T) => Promise<void>,
  onSuccess?: () => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: T) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(data);
      onSuccess?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting, error };
}
```

#### C. Modal Pattern (duplicated 5+ times)
```tsx
{showModal && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl max-w-sm w-full p-6">
      {/* content */}
    </div>
  </div>
)}
```

**Solution:** Create `<Modal>` component with proper accessibility.

---

### 3. **NO COMPONENT COMPOSITION** ⚠️ MEDIUM

**Problem:** Giant monolithic page components (300-800 lines each).

**Examples:**
- `sales/new.tsx`: 600+ lines
- `inventory.tsx`: 400+ lines with nested modal component
- `contacts.index.tsx`: 200+ lines

**Solution:** Break into smaller components:

```
src/components/
  ├── contacts/
  │   ├── ContactCard.tsx
  │   ├── ContactForm.tsx
  │   └── ContactList.tsx
  ├── sales/
  │   ├── CustomerSelector.tsx
  │   ├── SaleItemCard.tsx
  │   ├── SaleSummary.tsx
  │   └── SaleForm.tsx
  ├── inventory/
  │   ├── StockCard.tsx
  │   ├── StockCheckModal.tsx
  │   └── VarianceDisplay.tsx
```

---

### 4. **POOR STATE MANAGEMENT** ⚠️ MEDIUM

**Problem:** Local state for everything, even shared data.

**Examples:**
- User auth state duplicated (AuthContext + localStorage)
- No global state for app-wide settings
- Form state not properly managed

**Solution:**
- Keep using React Query for server state ✅
- Add Zustand for client state (user preferences, UI state)
- Use TanStack Router's search params for URL state

---

### 5. **MISSING BUSINESS LOGIC LAYER** ⚠️ MEDIUM

**Problem:** Business logic scattered in components.

**Example from `sales/new.tsx`:**
```tsx
// This calculation logic is in the component:
const totalAmount = items.reduce((acc, item) => {
  const trayAmount = item.qtyTrays * item.ratePerTray;
  const looseAmount = item.qtyLoose * item.ratePerEgg;
  return acc + trayAmount + looseAmount;
}, 0);
```

**Solution:** Extract to `src/lib/calculations.ts`:
```tsx
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
```

---

### 6. **TYPE SAFETY ISSUES** ⚠️ LOW-MEDIUM

**Problem:** Using `any` types everywhere.

**Examples:**
```tsx
const [selectedContact, setSelectedContact] = useState<any>(null);
const [items, setItems] = useState<any[]>([]);
```

**Solution:** Create proper types in `src/types/`:
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

---

## Scrolling Issue Root Cause

**The REAL problem:** Every page has `min-h-screen` which forces full viewport height even when content is small.

```tsx
// This FORCES scrolling:
<div className="... min-h-screen pb-32">
```

**Fix:** Remove `min-h-screen`, let content determine height:
```tsx
<div className="... pb-32">  {/* No min-h-screen */}
```

---

## Recommended Refactoring Plan

### Phase 1: Foundation (Week 1)
1. Create `src/api/` layer for all Convex calls
2. Create `src/types/` for TypeScript interfaces
3. Create `<PageContainer>` component
4. Create `<Modal>` component

### Phase 2: Component Extraction (Week 2)
1. Extract form components
2. Extract card components
3. Extract list components
4. Create shared hooks (`useFormSubmit`, `useModal`)

### Phase 3: Business Logic (Week 3)
1. Create `src/lib/calculations.ts`
2. Create `src/lib/validation.ts`
3. Create `src/lib/formatting.ts`

### Phase 4: State Management (Week 4)
1. Add Zustand for client state
2. Consolidate auth state
3. Add proper error boundaries

---

## Proposed New Structure

```
src/
├── api/                    # NEW: Data fetching layer
│   ├── contacts.ts
│   ├── expenses.ts
│   ├── inventory.ts
│   ├── transactions.ts
│   └── index.ts
├── components/
│   ├── contacts/          # NEW: Feature-specific components
│   │   ├── ContactCard.tsx
│   │   ├── ContactForm.tsx
│   │   └── ContactList.tsx
│   ├── sales/             # NEW
│   │   ├── CustomerSelector.tsx
│   │   ├── SaleItemCard.tsx
│   │   └── SaleSummary.tsx
│   ├── shared/            # NEW: Reusable components
│   │   ├── Modal.tsx
│   │   ├── EmptyState.tsx
│   │   └── StatCard.tsx
│   ├── layout/
│   │   ├── MobileAppShell.tsx
│   │   └── PageContainer.tsx  # NEW
│   └── ui/                # Existing shadcn components
├── hooks/                 # NEW: Custom hooks
│   ├── useFormSubmit.ts
│   ├── useModal.ts
│   └── useDebounce.ts
├── lib/                   # NEW: Business logic
│   ├── calculations.ts
│   ├── validation.ts
│   ├── formatting.ts
│   ├── auth.ts           # Existing
│   └── utils.ts          # Existing
├── types/                 # NEW: TypeScript types
│   ├── contact.ts
│   ├── sale.ts
│   ├── expense.ts
│   └── index.ts
├── routes/                # Existing (but much cleaner)
└── contexts/              # Existing
```

---

## Best Practices Violations

### Current Issues:
- ❌ No DRY (Don't Repeat Yourself)
- ❌ No SRP (Single Responsibility Principle)
- ❌ No separation of concerns
- ❌ Poor component composition
- ❌ Tight coupling between UI and data
- ❌ No proper error boundaries
- ❌ Inconsistent error handling
- ❌ No loading states standardization

### What's Good:
- ✅ Convex backend is well-structured
- ✅ Using TanStack Router properly
- ✅ Using React Query for server state
- ✅ Tailwind CSS usage is consistent
- ✅ Mobile-first approach

---

## Immediate Action Items

### Quick Wins (Can do today):
1. Remove `min-h-screen` from pages → fixes scrolling
2. Create `<PageContainer>` → reduces 200 lines of duplication
3. Create `src/api/contacts.ts` → centralizes contact operations
4. Add proper TypeScript types for Contact

### This Week:
1. Create full `src/api/` layer
2. Extract 3-4 major components (ContactCard, SaleItemCard, etc.)
3. Create `src/types/` directory with all interfaces

### This Month:
1. Complete component extraction
2. Add business logic layer
3. Improve error handling
4. Add loading states

---

## Conclusion

The app **works** but is **not maintainable** at scale. The main issues are:

1. **No API layer** - biggest problem
2. **Massive duplication** - wastes time
3. **Poor component composition** - hard to test
4. **Mixed concerns** - hard to change

**Good news:** These are all fixable with incremental refactoring. You don't need a rewrite.

**Priority:** Start with API layer and PageContainer component. These give the biggest ROI.
