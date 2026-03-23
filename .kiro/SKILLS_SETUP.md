# Agent Skills Setup Complete

**Date:** 2026-02-17  
**Status:** Active

---

## What Are Agent Skills?

Agent Skills follow the open [agentskills.io](https://agentskills.io) standard. They are portable instruction packages that teach Kiro AI specific capabilities for your project.

**How They Work:**
1. **Discovery** - Kiro loads skill names/descriptions at startup
2. **Activation** - When your request matches a skill's description, Kiro loads full instructions
3. **Execution** - Kiro follows the instructions automatically

---

## Skills Created

### 1. mobile-pwa-development
**Location:** `.kiro/skills/mobile-pwa-development/SKILL.md`

**Activates When:**
- Creating new pages or routes
- Building mobile UI components
- Implementing forms or modals
- Adding touch interactions
- Setting up API calls

**Teaches Kiro:**
- Mobile-first PWA patterns
- TanStack Start + Convex architecture
- shadcn/ui component usage
- Tailwind CSS mobile styling
- Import aliases and project structure
- Common anti-patterns to avoid

### 2. refactoring-architecture
**Location:** `.kiro/skills/refactoring-architecture/SKILL.md`

**Activates When:**
- Refactoring monolithic components
- Extracting API layers
- Creating reusable components
- Improving type safety
- Reducing code duplication

**Teaches Kiro:**
- 4-phase refactoring plan
- Before/after code patterns
- Component extraction techniques
- API layer creation
- TypeScript type definitions
- Code quality metrics

### 3. frontend-design ⭐ NEW
**Location:** `.kiro/skills/frontend-design/SKILL.md`  
**Source:** Anthropic's official Claude plugins

**Activates When:**
- Building new UI components
- Creating distinctive interfaces
- Designing pages with unique aesthetics
- Need creative, production-grade frontend

**Teaches Kiro:**
- Bold aesthetic direction (minimalist, maximalist, brutalist, etc.)
- Distinctive typography choices (avoid generic fonts)
- Creative color schemes and themes
- Motion and micro-interactions
- Spatial composition and layouts
- Backgrounds, textures, and visual details
- Avoiding generic AI aesthetics

### 4. code-simplifier ⭐ NEW
**Location:** `.kiro/skills/code-simplifier/SKILL.md`  
**Source:** Anthropic's official Claude plugins

**Activates When:**
- Code has been recently modified
- Need to improve code clarity
- Refining code structure
- Applying project standards

**Teaches Kiro:**
- Preserve functionality while improving clarity
- Apply project-specific standards
- Reduce complexity and nesting
- Avoid nested ternaries (use if/else or switch)
- Balance between brevity and readability
- Maintain helpful abstractions
- Focus on recently modified code

---

## How to Use

Skills activate automatically when you ask Kiro to do related tasks:

```bash
# This will activate mobile-pwa-development skill
kiro-cli chat "Create a new contacts page with mobile-first design"

# This will activate refactoring-architecture skill
kiro-cli chat "Refactor the sales page to extract components"
```

You can also view/manage skills in Kiro IDE:
- Open **Agent Steering & Skills** panel
- See which skills are loaded
- Manually activate/deactivate skills

---

## Skill Structure

```
.kiro/skills/
├── mobile-pwa-development/
│   └── SKILL.md              # Instructions for mobile PWA dev
└── refactoring-architecture/
    └── SKILL.md              # Instructions for refactoring
```

Each `SKILL.md` contains:
- **Frontmatter** (YAML) - name, description, metadata
- **Instructions** (Markdown) - detailed guidance
- **Code Examples** - before/after patterns
- **Checklists** - quality checks

---

## Skill Scope

**Workspace Skills** (current setup):
- Located in `.kiro/skills/`
- Apply only to this project
- Tracked in git
- Shared with team

**Global Skills** (optional):
- Located in `~/.kiro/skills/`
- Apply to all projects
- Personal workflows

---

## Adding More Skills

### From Community
```bash
# In Kiro IDE
1. Open Agent Steering & Skills
2. Click + → Import a skill
3. Choose GitHub URL or local folder
```

### Create Custom Skill
```bash
mkdir -p .kiro/skills/my-skill
cat > .kiro/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: When to use this skill
---

# Instructions here
EOF
```

---

## Skills vs Steering vs Powers

**Skills** (what we created):
- Portable, follow open standard
- Load on-demand
- Can include scripts
- Shareable across projects

**Steering** (`.kiro/steering.md`):
- Kiro-specific context
- Always loaded
- Project conventions

**Powers**:
- MCP tools + knowledge
- Dynamic activation
- For integrations

---

## Benefits

✅ **Consistent Code** - Kiro follows project patterns  
✅ **Faster Development** - No need to explain architecture each time  
✅ **Team Alignment** - Everyone uses same patterns  
✅ **Portable** - Skills work in any Kiro-compatible tool  
✅ **On-Demand** - Only loads when relevant  

---

## Verification

Check skills are loaded:
```bash
# List skills
ls -la .kiro/skills/

# View skill content
cat .kiro/skills/mobile-pwa-development/SKILL.md
```

In Kiro IDE:
- Open **Agent Steering & Skills** panel
- Should see both skills listed
- Descriptions should match frontmatter

---

## Next Steps

1. ✅ Skills created and ready
2. ⏭️ Test by asking Kiro to create a component
3. ⏭️ Verify skill activates automatically
4. ⏭️ Add more skills as needed (testing, deployment, etc.)

---

## Related Documentation

- [Kiro Skills Docs](https://kiro.dev/docs/skills/)
- [Agent Skills Standard](https://agentskills.io)
- `.kiro/RULES.md` - Project rules
- `ARCHITECTURE_AUDIT.md` - Refactoring plan

---

**Status:** ✅ Skills Active - Kiro now understands your project architecture!
