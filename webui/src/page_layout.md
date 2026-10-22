# Page Layout Guidelines

This document outlines the standard layout architecture for our application, ensuring visual consistency, accessibility (a11y), and responsiveness across all devices.

---

## 1. The Ideal Layout (Standard Application Layout)

For 90% of our pages, we follow a traditional, semantic **Holy Grail Layout** using a CSS Grid or Flexbox backbone. This structure optimizes user experience by keeping navigation predictable.

### Semantic Architecture
```text
+-------------------------------------------------------+
|                       Header                          |
+-------------------------------------------------------+
|  Sidebar (Optional) |          Main Content           |
|                     |  +---------------------------+  |
|                     |  |       Breadcrumbs         |  |
|                     |  +---------------------------+  |
|                     |  |       Page Header         |  |
|                     |  +---------------------------+  |
|                     |  |       Body / Cards        |  |
|                     |  +---------------------------+  |
+---------------------+---------------------------------+
|                       Footer                          |
+-------------------------------------------------------+

```


---

## 2. Form Sidebar & 2-Column Split Layout

When a page requires simultaneous data entry and live content preview (or context viewing), use the **2-Column Split Layout**.

### Layout Blueprint

```text
+-------------------------------------------------------------------+
|  [Left Sidebar] Form/Inputs Area    | [Right Side] Main Content   |
|                                     | (Markdown Preview/Render)   |
|  - Inputs, Toggles, Selects         |                             |
|  - Sticky Form Actions              | - Uses <MarkdownContent />  |
+-------------------------------------+-----------------------------+

```

### Core Implementation Rules

1. **Markdown Rendering:** For the right-hand main content panel, **always** render the content using our shared markdown UI component:

```tsx
import { MarkdownContent } from 'src/components/ui/markdown-content';

```



> ⚠️ **Design Decision Note (Form Behavior):** > Before implementing this layout, **always clarify with the product owner/user** whether the Left Form Sidebar should be **Fixed** (persistently open on wide screens) or **Collapsible** (can be toggled closed to give the Markdown view full width).

---

## 3. Alternative Layout Paradigms

Depending on the specific user flow or route, the ideal layout might not fit. Use these alternative patterns when appropriate:

### A. The "Focused" / Minimal Layout

Used for login, signup, checkout, or onboarding flows where you want to eliminate distractions.

* **Structure:** No sidebar, minimal header (logo only), centered card layout.
* **When to use:** `/login`, `/checkout`, `/welcome-onboarding`.

### B. The "Dashboard / Infinite Canvas" Layout

Used for complex data-heavy applications, maps, or design tools (like Figma or Notion).

* **Structure:** Full viewport bounds (`100vh`/`100vw`), overflow hidden on the body, scrollable independent panels.
* **When to use:** Analytics builders, administrative tables, interactive maps.

---

## 4. Responsive & Breakpoint Rules

Layouts must fluidly adapt to different screen dimensions. Do not design purely for "Mobile" and "Desktop"—design for the breakpoints in between.

| Breakpoint | Range | Layout Shift Behavior |
| --- | --- | --- |
| **Mobile** | `< 640px` | Sidebars collapse into mobile drawers. Layout stacks into 1 column. Form panel goes *above* or *below* markdown preview based on user priority. |
| **Tablet** | `640px` to `1024px` | Sidebars convert to slim icon-only rails. Grids drop to a tighter layout. |
| **Desktop** | `1024px` to `1536px` | Full 2-column or ideal layout active. Max-content restrictions apply. |
| **Ultra-Wide** | `> 1536px` | Margin auto-centers the layout container; content does not stretch endlessly. |

---


