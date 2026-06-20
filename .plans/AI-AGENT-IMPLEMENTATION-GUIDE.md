# AI-Agent Implementation Guide

## Overview
This document defines the standards and patterns used to make our plans AI-agent-friendly. These improvements make the plans more actionable, specific, and easier for AI agents to execute.

## Key Principles

### Human-in-the-Loop Testing Confirmation

**Always wait for user feedback before continuing after testing!** When you ask the user to verify something (like checking services are running, test results, etc.), **do NOT proceed with next steps** until the user confirms the result or gives you feedback.

### Git Commits on Completion

**Always commit after each phase/feature is complete!** Before moving to next task, check git status. If changes aren't committed yet:
1. `git add -A`
2. `git commit -m "Helpful message describing the completed work"`

### Docker-First Testing

**Always use Docker Compose for testing!** Never run services directly on the host. The AI agent will execute the clean build workflow automatically.

**Clean Build Workflow (AI executes this!):**
```bash
# 1. Stop and clean up all containers/volumes
docker-compose down --volumes --remove-orphans
# OR
docker compose down --volumes --remove-orphans

# 2. Build and start all services
docker-compose up --build
# OR
docker compose up --build
```

**Why this workflow?**
- Ensures no leftover containers/volumes interfere
- Forces fresh build with all changes
- Clean slate for testing
- Eliminates "it was working before" issues

**Why Docker-First?**
- Consistent environment across dev/prod
- All services isolated
- No "it works on my machine" issues
- Matches production deployment

---

## Key Improvements Applied

### 1. Explicit Task Order
Every phase plan now includes a **"Task Order"** section that specifies the exact order to execute tasks. This helps AI agents understand dependencies.

**Example:**
```markdown
## Task Order
Execute tasks in this exact order:
1. Task 2.1: Flight Entity
2. Task 2.2: Booking Entity & Passenger Value Object
3. Task 2.3: DTOs
4. Task 2.4: Flight ID Generator Service
5. Task 2.5: Flight Deduplicator Service
```

### 2. Prerequisites Section
All phase plans start with **"Prerequisites"** that clearly state what needs to be completed first. This prevents AI agents from starting work out of order.

**Example:**
```markdown
## Prerequisites
- [x] Phase 1 completed: NestJS project initialized with TypeScript
- [x] Project structure exists
```

### 3. Complete File Paths
Every task includes **full, explicit file paths** starting from the project root. No more ambiguous paths like "src/file.ts".

**Example:**
```
**File Path**: `flight-search/src/domain/entities/flight.entity.ts`
```

### 4. Expected Code Examples
Every implementation task includes **full, ready-to-use code examples** in fenced code blocks. This gives AI agents a concrete reference.

**Example:**
```typescript
import { Entity, PrimaryColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Flight {
  @PrimaryColumn()
  @ApiProperty()
  id: string;
  
  // ... more properties and methods
}
```

### 5. Implementation Steps
Each task is broken down into **numbered, step-by-step instructions** that leave no ambiguity about what to do.

**Example:**
```markdown
### Implementation Steps
1. [ ] Create the file with TypeScript class
2. [ ] Add properties with TypeScript types
3. [ ] Add TypeORM decorators for persistence
4. [ ] Add Swagger decorators for API docs
5. [ ] Add business methods
```

### 6. Validation Criteria
After each major task, there's a **"Validation"** section that lists exactly what to check to confirm the task was completed correctly.

**Example:**
```markdown
### Validation
- No dependencies on outer layers (controllers, services, etc.)
- All TypeScript types are explicit
- All decorators added
```

### 7. Links to Constitution/Standards
Relevant sections link to the **constitution document** so AI agents understand the rules and constraints they must follow.

**Example:**
```markdown
* Reference: [Clean Architecture Constitution](constitutions/clean_architecture.md)
```

### 8. Smaller, Atomic Tasks
Tasks are split into **subtasks** when appropriate, making them smaller and easier to execute.

### 9. Clear Success Criteria
All phase plans end with **checkbox-based success criteria** that make it easy to verify when the phase is complete.

### 10. Plan Completion Validation
Always check for existing completed work, update checkboxes, and move fully implemented plans to the completed plans section.

---

## How to Apply These Improvements

Use the enhanced Phase 2 plan as a template and apply these patterns to all other phase plans:

1. **Start with Prerequisites**: List what needs to be done first
2. **Define Task Order**: Specify exact execution order
3. **For each task**:
   - Provide full file path
   - Give numbered implementation steps
   - Include expected code example
   - Add validation criteria
4. **End with checkbox-based success criteria**

---

## Example: Before vs After

### Before (Less AI-Friendly)
```markdown
### Task 2.1: Define Flight Entity
- [ ] Create `src/domain/entities/flight.entity.ts`:
  - Properties: id, carrier, flightNo, etc.
  - Methods: getDuration(), isSameFlight()
- [ ] Create TypeORM decorators
- [ ] Add Swagger decorators
```

### After (AI-Friendly)
```markdown
## Task 2.1: Define Flight Entity (Domain Model)
### Details
**File Path**: `flight-search/src/domain/entities/flight.entity.ts`

### Implementation Steps
1. [ ] Create the file with TypeScript class
2. [ ] Add properties with TypeScript types
3. [ ] Add TypeORM decorators for persistence
4. [ ] Add Swagger decorators for API docs
5. [ ] Add business methods

### Expected Code Structure
```typescript
import { Entity, PrimaryColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Flight {
  @PrimaryColumn()
  @ApiProperty()
  id: string;
  
  // ... complete code example
}
```

### Validation
- No dependencies on outer layers
- All TypeScript types are explicit
- All decorators added
```

---

### 10. Plan Completion Validation
**Always check for completed work and update plans accordingly!** When starting work:

- First, explore the codebase and directory structure to identify what's already implemented
- Compare existing code with the tasks listed in all plan files
- If a task is fully implemented but not marked as completed in the plan, mark it as completed (change `[ ]` to `[x]`)
- If an entire plan file is fully implemented but not listed in the completed plans section, move it to the completed plans

**How to do this:**
1. Use `Glob` and `Read` tools to explore codebase and check implemented files
2. Compare with the checklist items in each plan file
3. Update the plan files' checkboxes for completed tasks
4. Update `plan_index.md` to move fully implemented plans to the "Completed Plans" section

---

## Benefits
These improvements ensure that:
- AI agents know exactly what to do and in what order
- No ambiguity about file locations or implementation details
- Clear verification steps confirm when tasks are complete
- All work follows constitutional standards
- Plans stay up to date with the actual progress of the project