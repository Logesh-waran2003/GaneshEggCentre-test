# Quick Command Reference

## Package Management (ALWAYS use bun)
```bash
bun install                    # Install dependencies
bun add [package]              # Add dependency
bun add -d [package]           # Add dev dependency
bun remove [package]           # Remove dependency
bun run dev                    # Start dev server
bun run build                  # Build for production
```

## shadcn/ui
```bash
bunx shadcn@latest add [component]     # Add component
bunx shadcn@latest add dialog          # Add dialog
bunx shadcn@latest add sheet           # Add sheet
bunx shadcn@latest add form            # Add form
bunx shadcn@latest add --overwrite     # Overwrite existing
```

## Development
```bash
bun --bun run start            # Start with bun runtime
bun run test                   # Run tests
```

## Git
```bash
git status                     # Check status
git add .                      # Stage all
git commit -m "message"        # Commit
git push                       # Push to remote
```

## Project Structure
```bash
tree src/ -L 2                 # View structure
ls -la src/components/ui/      # List UI components
cat .kiro/RULES.md             # Read rules
```

## Common Tasks

### Add a new shadcn component
```bash
bunx shadcn@latest add [component-name]
```

### Install a new package
```bash
bun add [package-name]
```

### Check what's installed
```bash
cat package.json | grep -A 5 dependencies
```

### View project rules
```bash
cat .kiro/RULES.md
```
