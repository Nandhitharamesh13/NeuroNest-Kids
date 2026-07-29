# NeuroNest Project Documentation

## Overview
NeuroNest is an autism-friendly educational game platform for children ages 3-18, featuring 12 learning games with adaptive AI support.

---

## Data Flow Diagram (DFD)

```
┌─────────────┐     Login/Signup      ┌──────────────┐
│   Parent    │ ──────────────────►   │  Supabase    │
│   User      │                       │  Auth        │
└─────────────┘                       └──────────────┘
      │                                      │
      │ Create Child Profile                 │ User Session
      ▼                                      ▼
┌─────────────┐                       ┌──────────────┐
│   Child     │ ◄──────────────────── │  Database    │
│  Dashboard  │     Load Profiles     │  Tables      │
└─────────────┘                       └──────────────┘
      │                                      ▲
      │ Play Games                           │
      ▼                                      │ Save Sessions
┌─────────────┐     Analyze           ┌──────────────┐
│   Games     │ ──────────────────►   │  Adaptive    │
│  (12 types) │                       │  AI Helper   │
└─────────────┘                       └──────────────┘
      │                                      │
      │ Generate Reports                     │ AI Insights
      ▼                                      ▼
┌─────────────┐                       ┌──────────────┐
│   Parent    │ ◄──────────────────── │  AI Student  │
│  Dashboard  │     Display Stats     │  Analysis    │
└─────────────┘                       └──────────────┘
```

---

## Entity Relationship Diagram (ER Diagram)

```
┌──────────────────┐       ┌──────────────────┐
│   auth.users     │       │    profiles      │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │◄──────│ user_id (FK)     │
│ email            │   1:1 │ id (PK)          │
│ created_at       │       │ display_name     │
└──────────────────┘       │ email            │
         │                 └──────────────────┘
         │ 1:N
         ▼
┌──────────────────┐       ┌──────────────────────────┐
│  child_profiles  │       │ child_behavior_profiles  │
├──────────────────┤       ├──────────────────────────┤
│ id (PK)          │◄──────│ child_id (FK)            │
│ parent_id (FK)   │   1:1 │ id (PK)                  │
│ name             │       │ attention_span_minutes   │
│ age              │       │ preferred_pace           │
│ avatar           │       │ frustration_threshold    │
│ created_at       │       │ strong_categories        │
└──────────────────┘       │ challenging_categories   │
         │                 │ current_difficulty_level │
         │ 1:N             │ ai_insights              │
         ▼                 └──────────────────────────┘
┌──────────────────┐
│  game_sessions   │
├──────────────────┤
│ id (PK)          │
│ child_id (FK)    │
│ game_type        │
│ score            │
│ correct_answers  │
│ wrong_answers    │
│ total_questions  │
│ mistakes (JSON)  │
│ max_streak       │
│ duration_seconds │
│ created_at       │
└──────────────────┘
```

---

## Database Design

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Parent user profiles linked to auth.users |
| `child_profiles` | Child accounts managed by parents |
| `child_behavior_profiles` | AI learning data for adaptive difficulty |
| `game_sessions` | Game play history with scores and mistakes |
| `parental_settings` | App preferences (sound, animations, duration) |
| `user_roles` | Role-based access (parent/child) |

### All 12 Game Types
1. shapes, 2. colors, 3. fruits, 4. sorting, 5. clock, 6. weather, 7. numbers, 8. letters, 9. emotions, 10. memory, 11. counting, 12. comparing

---

## AI System Architecture

See `AI_SYSTEM_README.md` for complete AI documentation including:
- Gemini 2.5-flash model integration
- Adaptive difficulty algorithms
- Real-time behavioral analysis
- Edge function implementations

---

## Testing Plan

### Unit Tests
- Game logic validation
- Score calculation accuracy
- Timer functionality

### Integration Tests
- Database operations (CRUD)
- AI edge function calls
- Authentication flow

### E2E Tests
- Complete game playthrough
- Parent dashboard reporting
- Child profile management

---

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, GSAP
- **Backend**: Node.js Express, PostgreSQL
- **AI**: Custom adaptive difficulty algorithm
- **State**: React Query, localStorage for rewards/alerts
