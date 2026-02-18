# Project Context for AI Assistants

This file helps AI assistants understand the project structure and rules.

## Quick Reference

**Project:** Ganesh Egg Centre - Mobile PWA for egg distribution  
**Stack:** TanStack Start + Convex + shadcn/ui + Tailwind  
**Package Manager:** bun (ALWAYS)  
**Style:** Mobile-first, touch-optimized

## Critical Rules

1. **ALWAYS use `bun`** - Never npm/yarn
2. **Mobile-first** - max-w-md, touch targets 44px+
3. **NO min-h-screen** on pages (causes scrolling issues)
4. **API layer required** - No direct Convex calls in components
5. **Use shadcn/ui** - Dialog, Sheet, Form, Select (not custom)
6. **TypeScript strict** - No `any` types

## Architecture

```
src/
├── api/              # Convex queries/mutations (centralized)
├── components/
│   ├── [feature]/   # Feature components
│   ├── shared/      # Reusable components
│   ├── layout/      # Layout components
│   └── ui/          # shadcn components
├── hooks/           # Custom hooks
├── lib/             # Business logic
├── types/           # TypeScript interfaces
└── routes/          # Pages (thin, use api/ and components/)
```

## Import Aliases

```tsx
@/components  → src/components
@/api         → src/api
@/types       → src/types
@/lib         → src/lib
@/hooks       → src/hooks
```

## Common Patterns

### Page Component
```tsx
<PageContainer title="Title" backTo="/">
  <FeatureComponent />
</PageContainer>
```

### API Usage
```tsx
const { data } = useContacts();  // From src/api/contacts.ts
```

### Forms
```tsx
const form = useForm<FormData>();
<Form {...form}>...</Form>
```

### Modals
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>...</DialogContent>
</Dialog>
```

## See Full Rules

Read `.kiro/RULES.md` for complete guidelines.
