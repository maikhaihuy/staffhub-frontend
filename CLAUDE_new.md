# StaffHub — CLAUDE.md

## Project Overview

StaffHub is a workforce management system for a small milk tea shop.
**This repository (`staffhub-frontend`) is the web dashboard, used by Admin, Manager, and Staff.**

The employee-facing **Zalo Mini App** (on-shift check-in/check-out, mobile experience) lives in a
**separate repository** and is out of scope for this codebase. Nothing here should be built as a
Zalo Mini App screen or use the Zalo Mini App SDK — this repo is a standard responsive web app.

---

## Shared Domain Context

StaffHub manages:
- Employees
- Branches
- Schedules
- Shift check-in / check-out
- Mandatory shift tasks
- Todo items
- Delivery receipt submission
- Earnings
- Payroll
- Overtime approval
- Manager approval workflows

### User Roles

| Role | Scope | Uses this web dashboard for |
|---|---|---|
| Owner / Admin | Full system access | Full management: users, roles, permissions, branches, schedules, audit log |
| Manager | Branch-level management | Branch-scoped scheduling, employee, and approval screens |
| Staff (Employee) | This app + the separate Zalo Mini App | Self-service screens below (schedule, tasks, income, profile) via web; on-shift actions (check-in/check-out on the go) via the separate Zalo Mini App |

### Core Business Rules
- `User` is for authentication. `Employee` is for business/domain data.
- `Employee` belongs to a `Branch`.
- Check-in / check-out logs must be preserved. Employees can check out multiple times.
- End-of-day job selects the **final checkout** as the official one.
- **Mandatory tasks** must be completed before checkout is allowed.
- **Todo tasks** can remain pending but must trigger a warning.
- Delivery receipt OCR is a suggestion only; manager must approve the final amount.
- Backend JWT is the source of truth for API calls. Zalo identity (used by the separate Mini App)
  only helps authenticate/link the employee account — it never grants access on its own.

---

## App Responsibility

This repo is the **web dashboard** — Admin, Manager, and Staff all use it.

✅ Implement:
- Login / backend auth (web session)
- Admin & Manager management screens: users, roles & permissions, branches, employees, schedules,
  rosters, shifts, audit log
- Staff self-service screens (see Screen Specifications below): viewing assigned shifts,
  completing mandatory tasks, viewing/acknowledging todo items, submitting delivery receipts,
  viewing estimated earnings, viewing approval status
- Desktop-appropriate, responsive web UI/layouts

❌ Do not implement:
- Zalo Mini App screens or SDK integration — that build lives in the separate Mini App repo
- Native-mobile-only interaction patterns (e.g. bottom tab bars, swipe gestures) where a
  standard web navigation pattern (sidebar/top nav) fits better

---

## UX Direction

- **Responsive web-first.** Built for desktop and tablet browsers; not a Zalo Mini App.
- Simple, friendly, and clear. No enterprise HR wording.
- One clear primary action per screen state.
- Vietnamese user-facing copy throughout.

### Staff's Core Questions (answered at a glance, on the self-service screens)
> Am I working today? · What time is my shift? · Can I check in? · What tasks must I complete? · Can I check out? · How much have I earned? · What is pending approval?

---

## App Structure — Primary Navigation (4 sections)

Same feature set as before; rendered as standard web navigation (sidebar/top nav) rather than a
mobile bottom tab bar, since this is a web dashboard, not the Zalo Mini App.

```
[ Lịch ca ]  [ Nhiệm vụ ]  [ Thu nhập ]  [ Cá nhân ]
```

| Section | Label (VI) | Label (EN) |
|---|---|---|
| 1 | Lịch ca | Schedule |
| 2 | Nhiệm vụ | Task |
| 3 | Thu nhập | Income |
| 4 | Cá nhân | Profile |

Admin/Manager management screens (users, roles, permissions, branches, audit log, etc.) sit
alongside these as their own navigation section — see App Responsibility above.

---

## Screen Specifications

*(Feature scope unchanged from the original spec — only the platform/navigation framing above changed.)*

### 1. Lịch ca (Schedule)

Three top tabs, all sharing a **weekly shift layout**:

| Tab | Label (VI) | Purpose |
|---|---|---|
| 1 | Bản biểu | View assigned / current shifts |
| 2 | Đăng ban | Register available shifts |
| 3 | Bản ký | View completed shift history |

#### Weekly Layout Rules
- Displays days of the week with dates.
- Highlights **today** visually.
- Shows shift periods (e.g., morning / afternoon / evening bands).
- Renders **shift blocks** within the correct period slots.
- Shift blocks support **spanning multiple shift periods**.

#### ShiftBlock Component
- Supports a `title` prop.
- Supports a `children` slot for custom content inside the block.
- Must be reusable across all three tabs (Bản biểu, Đăng ban, Bản ký).

---

### 2. Nhiệm vụ (Task)

The task screen is state-driven. Layout slots must remain **positionally consistent** across all states.

#### Time Contexts
- Before shift
- During shift
- Outside shift (no shift today / shift ended)

#### Attendance States
- Not checked in
- Checked in
- Checked out

#### Fixed Layout Slots (consistent across all states)
1. **Greeting** — e.g., "Chào buổi sáng, [Tên]!"
2. **Current time / clock** — live clock display
3. **Shift status** — e.g., "Ca sáng · 07:00 – 15:00"
4. **Primary action** — e.g., Check-in button / Check-out button / disabled state
5. **Task summary** — summary of mandatory + todo task progress

#### Task Types

**Mandatory Tasks**
- Must be completed before checkout is allowed.
- Show completion status clearly.
- Block checkout if any mandatory task is incomplete.

**Todo Tasks**
- Can remain pending.
- Show a warning if any todo task is still pending at checkout time.

#### Evidence Zone
- Allows employee to attach photos and/or notes as evidence for tasks.
- Displayed within the task screen, accessible per task or per shift.

---

### 3. Thu nhập (Income)

Three top tabs:

| Tab | Label (VI) | Purpose |
|---|---|---|
| 1 | Tổng quan | Overview |
| 2 | Tiền ca | Shift Earnings |
| 3 | Tiền ship | Delivery Earnings |

#### Tổng quan (Overview)
- Estimated earning from the **beginning of the current month to now**.
- Earnings breakdown:
  - Shift pay (lương ca)
  - Approved overtime (OT được duyệt)
  - Delivery income (tiền ship)
  - Bonus (thưởng)
- Latest paid amount from the **previous payroll period**.
- Pending approval summary (OT / receipts awaiting manager action).
- Entry points to: Payroll detail screen · Previous payroll screen.

#### Tiền ca (Shift Earnings)
- List of completed shifts with earning info per shift.

#### Tiền ship (Delivery Earnings)
- List of delivery orders / submitted receipts.
- Status of each receipt (pending OCR, pending approval, approved, rejected).

---

### 4. Cá nhân (Profile)

- View and update personal information.
- Change password.
- Log out.

---

## Zalo Integration (context only — implemented in the separate Mini App repo, not here)

- Zalo identity is used to help **authenticate and link** the employee account, in the separate
  Zalo Mini App.
- **Backend remains the source of truth**, regardless of which frontend is calling it.
- All API calls use the **backend-issued JWT**.
- This repo does not implement any Zalo-specific auth logic — it uses standard web/backend auth.

---

## Important Screens (Full List)

**Admin / Manager (this repo):**
- Users, roles & permissions management
- Branches, employees management
- Schedules, rosters, shift templates
- Audit log

**Staff self-service (this repo):**
- Home / Today shift
- Schedule (Bản biểu · Đăng ban · Bản ký)
- Shift detail
- Check-in / Check-out
- Mandatory tasks
- Todo list
- Earnings overview (Tổng quan)
- Shift earnings (Tiền ca)
- Delivery earnings (Tiền ship)
- Delivery receipt upload
- Payroll detail
- Previous payroll
- Profile

**Not in this repo (separate Zalo Mini App):**
- On-shift mobile check-in/check-out and task flows for Staff

---

## Copy & Tone Guidelines

- Language: **Vietnamese** for all user-facing text.
- Tone: Simple, warm, approachable. Like a friendly team lead, not an HR system.
- Avoid: "Submit attendance", "Log timekeeping entry", "Compensation period".
- Prefer: "Chấm công", "Vào ca", "Kết ca", "Ca hôm nay", "Tiền của bạn".