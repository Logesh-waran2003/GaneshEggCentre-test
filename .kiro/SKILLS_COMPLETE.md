# Complete Agent Skills Collection

**Total Skills:** 6  
**Last Updated:** 2026-02-17

---

## Skills Overview

### Custom Project Skills (2)

#### 1. mobile-pwa-development
**Source:** Custom  
**Focus:** Mobile-first PWA patterns for this project

**Activates When:**
- Creating pages/routes
- Building mobile UI
- Implementing forms/modals
- Touch interactions

**Key Teachings:**
- TanStack Start + Convex architecture
- shadcn/ui components
- Mobile-first Tailwind patterns
- Project structure and imports

---

#### 2. refactoring-architecture
**Source:** Custom  
**Focus:** Project-specific refactoring patterns

**Activates When:**
- Refactoring components
- Extracting API layers
- Improving architecture
- Reducing duplication

**Key Teachings:**
- 4-phase refactoring plan
- API layer extraction
- Component composition
- Type safety improvements

---

### Anthropic Official Skills (2)

#### 3. frontend-design
**Source:** [Anthropic Claude Plugins](https://github.com/anthropics/claude-plugins-official)  
**Focus:** Distinctive, production-grade UI design

**Activates When:**
- Building new UI components
- Creating unique interfaces
- Designing pages with bold aesthetics

**Key Teachings:**
- Bold aesthetic directions (minimalist, maximalist, brutalist, etc.)
- Distinctive typography (avoid Inter, Arial, generic fonts)
- Creative color schemes and motion
- Spatial composition and layouts
- Avoiding generic AI aesthetics

---

#### 4. code-simplifier
**Source:** [Anthropic Claude Plugins](https://github.com/anthropics/claude-plugins-official)  
**Focus:** Automatic code refinement

**Activates When:**
- Code is recently modified
- Need clarity improvements
- Applying standards

**Key Teachings:**
- Preserve functionality while improving clarity
- Reduce complexity and nesting
- Avoid nested ternaries
- Balance brevity vs readability
- Apply project standards automatically

---

### Vercel Official Skills (2)

#### 5. react-best-practices
**Source:** [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills)  
**Focus:** React/Next.js performance optimization

**Activates When:**
- Writing React components
- Implementing data fetching
- Optimizing performance
- Reviewing React code

**Key Teachings:**
- **57 rules across 8 categories:**
  1. Eliminating Waterfalls (CRITICAL)
  2. Bundle Size Optimization (CRITICAL)
  3. Server-Side Performance (HIGH)
  4. Client-Side Data Fetching (MEDIUM-HIGH)
  5. Re-render Optimization (MEDIUM)
  6. Rendering Performance (MEDIUM)
  7. JavaScript Performance (LOW-MEDIUM)
  8. Advanced Patterns (LOW)

**Critical Rules:**
- Use Promise.all() for parallel operations
- Import directly, avoid barrel files
- Use next/dynamic for heavy components
- React.cache() for deduplication
- SWR for client-side fetching
- Memo for expensive components
- startTransition for non-urgent updates

---

#### 6. composition-patterns
**Source:** [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills)  
**Focus:** React composition patterns that scale

**Activates When:**
- Refactoring components with many boolean props
- Building component libraries
- Designing flexible APIs
- Working with compound components

**Key Teachings:**
- **Avoid boolean prop proliferation**
- **Compound components** with shared context
- **Lift state** into providers
- **Explicit variants** instead of boolean modes
- **Children over render props**
- **Context interface patterns**
- **React 19 APIs** (use() instead of useContext)

---

## Skill Directory Structure

```
.kiro/skills/
├── mobile-pwa-development/      # Custom: Mobile PWA patterns
├── refactoring-architecture/    # Custom: Refactoring guide
├── frontend-design/             # Anthropic: UI design
├── code-simplifier/             # Anthropic: Code refinement
├── react-best-practices/        # Vercel: React performance
└── composition-patterns/        # Vercel: Component composition
```

---

## How They Work Together

### Example Workflow 1: New Feature
```
1. mobile-pwa-development → Guides architecture
2. react-best-practices → Ensures performance
3. composition-patterns → Structures components
4. frontend-design → Creates distinctive UI
5. code-simplifier → Refines the code automatically
```

### Example Workflow 2: Refactoring
```
1. refactoring-architecture → Extraction strategy
2. composition-patterns → Component structure
3. react-best-practices → Performance patterns
4. code-simplifier → Final cleanup
```

---

## Skill Activation Examples

```bash
# Activates: mobile-pwa-development + react-best-practices
"Create a new contacts page with mobile-first design"

# Activates: composition-patterns + react-best-practices
"Refactor this component to avoid boolean props"

# Activates: frontend-design
"Design a unique dashboard with a brutalist aesthetic"

# Activates: code-simplifier (automatic)
# Runs after any code modification

# Activates: refactoring-architecture
"Extract API calls from this component"
```

---

## Key Benefits

### Performance
- ✅ Vercel's 57 React optimization rules
- ✅ Automatic waterfall elimination
- ✅ Bundle size optimization
- ✅ Re-render prevention

### Architecture
- ✅ Proper component composition
- ✅ API layer separation
- ✅ Type safety enforcement
- ✅ Mobile-first patterns

### Design
- ✅ Distinctive UI aesthetics
- ✅ Avoids generic AI look
- ✅ Bold creative direction
- ✅ Production-grade polish

### Code Quality
- ✅ Automatic refinement
- ✅ Consistent standards
- ✅ Reduced complexity
- ✅ Better maintainability

---

## Priority Matrix

| Skill | Priority | Impact | Auto-Activates |
|-------|----------|--------|----------------|
| react-best-practices | CRITICAL | Performance | Yes |
| composition-patterns | HIGH | Architecture | Yes |
| mobile-pwa-development | HIGH | Mobile UX | Yes |
| refactoring-architecture | MEDIUM | Maintainability | Yes |
| frontend-design | MEDIUM | Aesthetics | Yes |
| code-simplifier | MEDIUM | Code Quality | Always |

---

## Vercel React Best Practices - Quick Reference

### CRITICAL Priority
- **Async Patterns:** Promise.all(), defer await, Suspense boundaries
- **Bundle Size:** Direct imports, dynamic imports, defer 3rd party

### HIGH Priority
- **Server Performance:** React.cache(), LRU cache, parallel fetching
- **Client Fetching:** SWR deduplication, passive listeners

### MEDIUM Priority
- **Re-renders:** Memo, functional setState, derived state, transitions
- **Rendering:** Content-visibility, hoist JSX, Activity component

---

## Composition Patterns - Quick Reference

### HIGH Priority
- **Avoid Boolean Props:** Use composition instead
- **Compound Components:** Shared context structure

### MEDIUM Priority
- **State Management:** Lift state, context interface, decouple implementation
- **Patterns:** Explicit variants, children over render props
- **React 19:** No forwardRef, use use() hook

---

## Related Documentation

- `.kiro/RULES.md` - Project rules
- `.kiro/SKILLS_SETUP.md` - Skills documentation
- `ARCHITECTURE_AUDIT.md` - Refactoring roadmap
- `SETUP_COMPLETE.md` - shadcn/ui setup

---

**Status:** ✅ 6 Skills Active - Complete coverage for React PWA development!
