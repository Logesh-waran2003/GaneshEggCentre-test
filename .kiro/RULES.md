# Ganesh Egg Centre - Development Rules

**Project:** Mobile-First PWA for Egg Distribution Management  
**Stack:** TanStack Start + Convex + shadcn/ui + Tailwind CSS  
**Package Manager:** bun (ALWAYS)

---

## 🚨 CRITICAL RULES - NEVER VIOLATE

### 0. Documentation
- ❌ NO unnecessary summary documents or .md files
- ❌ NO progress reports, quick start guides, or status files
- ✅ Only update existing docs: `.kiro/RULES.md`, `README.md`, `ARCHITECTURE_AUDIT.md`
- ✅ Use TODO list for tracking progress

### 1. Package Manager
- ✅ ALWAYS use `bun` for all package operations
- ❌ NEVER use `npm` or `yarn`
- Commands: `bun add`, `bun install`, `bun run`, `bunx`

### 2. Mobile-First PWA Design
- ✅ Design for mobile screens first (max-w-md)
- ✅ Touch-friendly targets (min 44px)
- ✅ Use safe-area-inset for notched phones
- ❌ NO `min-h-screen` on pages (causes unwanted scrolling)
- ✅ Bottom navigation fixed at bottom
- ✅ Content should scroll ONLY when it exceeds viewport

### 3. Component Library
- ✅ Use shadcn/ui components (Dialog, Sheet, Form, Select, etc.)
- ✅ Add components via: `bunx shadcn@latest add [component]`
- ❌ NO custom modals - use shadcn Dialog or Sheet
- ❌ NO custom dropdowns - use shadcn Select
- ✅ Keep existing custom components: EggLoader

### 4. Architecture Patterns
- ✅ API calls MUST be in `src/api/` directory
- ✅ TypeScript types MUST be in `src/types/` directory
- ✅ Business logic MUST be in `src/lib/` directory
- ✅ Reusable components in `src/components/[feature]/`
- ❌ NO direct Convex calls in page components
- ❌ NO `any` types - use proper TypeScript interfaces

**🚨 CRITICAL: Before Creating API Hooks**
1. **ALWAYS read `convex/schema.ts` first** to see actual table names
2. **ALWAYS read `convex/[module].ts`** to see exported function names
3. **Match function names EXACTLY** - don't assume generic names
4. **Use correct table names** in types (e.g., `Id<"saleTrips">` not `Id<"trips">`)

**Common Mistakes:**
- ❌ `api.contacts.getContact` → ✅ `api.contacts.getContactById`
- ❌ `api.trips.getTrips` → ✅ `api.saleTrips.getTodayTrips`
- ❌ `Id<"trips">` → ✅ `Id<"saleTrips">`
- ❌ `Id<"rates">` → ✅ `Id<"dailyBoardRates">`

### 5. Code Organization
```
src/
├── api/              # All Convex queries/mutations
├── components/
│   ├── [feature]/   # Feature-specific components
│   ├── shared/      # Reusable components
│   ├── layout/      # Layout components
│   └── ui/          # shadcn components
├── hooks/           # Custom React hooks
├── lib/             # Business logic, utils
├── types/           # TypeScript interfaces
└── routes/          # Page components (thin, use api/ and components/)
```

### 6. Import Aliases
```tsx
import { Button } from "@/components/ui/button";
import { useContacts } from "@/api/contacts";
import { Contact } from "@/types/contact";
import { cn } from "@/lib/utils";
import { useFormSubmit } from "@/hooks/useFormSubmit";
```

---

## 📋 CODING STANDARDS

### Component Structure
```tsx
// ✅ GOOD: Thin page component
function ContactsPage() {
  const { data: contacts } = useContacts();  // From api/
  const createContact = useCreateContact();  // From api/
  
  return (
    <PageContainer title="Contacts">
      <ContactList contacts={contacts} />
      <ContactForm onSubmit={createContact} />
    </PageContainer>
  );
}

// ❌ BAD: Fat component with inline queries
function ContactsPage() {
  const { data: contacts } = useSuspenseQuery(
    convexQuery(api.contacts.getContacts, {})  // NO!
  );
  // 200 lines of JSX...
}
```

### Form Handling
```tsx
// ✅ GOOD: Use react-hook-form + shadcn Form
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";

const form = useForm<ContactFormData>();

// ❌ BAD: Manual state for each field
const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
```

### Modal/Dialog Pattern
```tsx
// ✅ GOOD: Use shadcn Dialog
import { Dialog, DialogContent } from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>...</DialogContent>
</Dialog>

// ❌ BAD: Custom modal div
<div className="fixed inset-0 bg-black/50">
  <div className="bg-white rounded-3xl">...</div>
</div>
```

### Mobile Drawer Pattern
```tsx
// ✅ GOOD: Use shadcn Sheet for mobile menus
import { Sheet, SheetContent } from "@/components/ui/sheet";

<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent side="right">...</SheetContent>
</Sheet>
```

---

## 🎨 STYLING RULES

### Tailwind Classes
- ✅ Use `max-w-md mx-auto` for mobile-first containers
- ✅ Use `safe-area-inset` for notched phones
- ✅ Use `pb-20` or `pb-24` for bottom nav clearance
- ❌ NO `min-h-screen` on page content
- ✅ Use `overflow-y-auto` on scrollable containers
- ✅ Touch targets: `h-12` minimum (48px)

### Color Scheme
- Primary: `indigo-600`, `violet-600`
- Success: `emerald-600`, `green-600`
- Error: `red-600`, `rose-600`
- Warning: `amber-600`, `orange-600`
- Neutral: `gray-*` scale

### Spacing
- Page padding: `p-4`
- Card padding: `p-4` to `p-6`
- Gap between elements: `gap-4` to `gap-6`
- Bottom nav height: `h-16` (64px)

---

## 🔧 REFACTORING PRIORITIES

### Phase 1: Foundation (Current)
1. ✅ shadcn/ui setup complete
2. ⏭️ Create `src/api/` layer
3. ⏭️ Create `src/types/` directory
4. ⏭️ Create `<PageContainer>` component
5. ⏭️ Replace custom modals with Dialog/Sheet

### Phase 2: Component Extraction
1. Extract ContactCard, ContactForm, ContactList
2. Extract SaleItemCard, SaleSummary, CustomerSelector
3. Extract StockCard, StockCheckModal
4. Create shared components (Modal, EmptyState, StatCard)

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

---

## 🚫 ANTI-PATTERNS TO AVOID

### 1. Code Duplication
```tsx
// ❌ BAD: Repeated page structure
<div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto">
  <header className="flex items-center gap-4 py-4">
    <Button variant="ghost" size="icon" asChild>
      <Link to="/"><ArrowLeft /></Link>
    </Button>
    <h1>Page Title</h1>
  </header>
  {/* content */}
</div>

// ✅ GOOD: Use PageContainer
<PageContainer title="Page Title" backTo="/">
  {/* content */}
</PageContainer>
```

### 2. Inline API Calls
```tsx
// ❌ BAD: Direct Convex calls in components
const { data } = useSuspenseQuery(
  convexQuery(api.contacts.getContacts, {})
);

// ✅ GOOD: Use API layer
const { data } = useContacts();
```

### 3. Any Types
```tsx
// ❌ BAD
const [contact, setContact] = useState<any>(null);
const [items, setItems] = useState<any[]>([]);

// ✅ GOOD
const [contact, setContact] = useState<Contact | null>(null);
const [items, setItems] = useState<SaleItem[]>([]);
```

### 4. Manual Form State
```tsx
// ❌ BAD: Individual useState for each field
const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);

// ✅ GOOD: Use react-hook-form
const form = useForm<ContactFormData>();
```

### 5. Monolithic Components
```tsx
// ❌ BAD: 500+ line component with everything
function SalesPage() {
  // 50 lines of state
  // 100 lines of handlers
  // 350 lines of JSX
}

// ✅ GOOD: Composed components
function SalesPage() {
  return (
    <PageContainer title="Sales">
      <CustomerSelector />
      <SaleItemList />
      <SaleSummary />
    </PageContainer>
  );
}
```

---

## 📦 DEPENDENCIES

### Core Stack
- `@tanstack/react-router` - Routing
- `@tanstack/react-query` - Server state
- `convex` - Backend
- `react` - UI library
- `tailwindcss` - Styling

### UI Components
- `shadcn-ui` - Component library
- `@radix-ui/*` - Primitives
- `lucide-react` - Icons
- `framer-motion` - Animations

### Mobile Enhancements
- `@use-gesture/react` - Touch gestures
- `react-hook-form` - Form handling
- `zustand` - Client state

### Utilities
- `class-variance-authority` - Component variants
- `tailwind-merge` - Class merging
- `clsx` - Conditional classes
- `date-fns` - Date formatting
- `zod` - Validation

---

## 🎯 QUALITY CHECKLIST

Before committing code, verify:

- [ ] Used `bun` for all package operations
- [ ] No `min-h-screen` on page content
- [ ] API calls are in `src/api/`
- [ ] Types are in `src/types/`
- [ ] No `any` types used
- [ ] Used shadcn components (Dialog, Sheet, Form, Select)
- [ ] Mobile-first design (max-w-md)
- [ ] Touch targets are 44px+ minimum
- [ ] No code duplication
- [ ] Components are small and focused
- [ ] Proper TypeScript interfaces
- [ ] Import aliases used (@/components, @/api, etc.)

---

## 🔍 DEBUGGING TIPS

### Scrolling Issues
- Check for `min-h-screen` on page containers
- Verify `overflow-y-auto` is on correct element
- Ensure content height doesn't force scrolling

### Layout Issues
- Use `max-w-md mx-auto` for mobile centering
- Add `safe-area-inset` for notched phones
- Use `pb-20` for bottom nav clearance

### Performance Issues
- Check React Query caching strategy
- Verify no unnecessary re-renders
- Use React DevTools Profiler

---

## 📚 REFERENCE DOCS

- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Router](https://tanstack.com/router)
- [React Query](https://tanstack.com/query)
- [Convex Docs](https://docs.convex.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [react-hook-form](https://react-hook-form.com)
- [@use-gesture](https://use-gesture.netlify.app)

---

**Last Updated:** 2026-02-17  
**Status:** Active Development - Phase 1 (Foundation)
