# AI Trainer Design System

Version 3.2. Target design language for the AI Trainer apps. Built from current global patterns: Material 3 Expressive, Apple's platform guidance, and modern AI chat products. This document is the source for the code update. Build screens to this spec. The code will be changed to match it.

Status: **Target**. Nothing here is required to match the current app.

---

## 0. Platform Scope

One design system, three surfaces. Android phones come first. Tablets and the web share the same tokens, components, features, and data. Their layout and app structure (navigation, page and pane arrangement, where secondary content sits) are designed for each form factor, not copied from the phone.

| Surface | Priority | Window class | Input | Notes |
| --- | --- | --- | --- | --- |
| Android phone | 1 (build first) | Compact | Touch, gestures, back | Base layout for every screen. Sections 5 to 13 are written for this surface. |
| Android tablet | 2 | Medium and expanded | Touch, optional keyboard and stylus | Pane-based structure: list and detail, or working view and side panel, shown together. Same features and data as the phone. |
| Web | 3 | Medium and expanded (desktop browsers); compact (narrow browsers) | Mouse, keyboard, hover, pointer | Workspace structure: persistent sidebar, working area, and a right panel. URL routing and multi-tab use. Same features and data as the phone. |
| iOS | Not in scope for this version | — | — | Not planned. Do not design for it yet. |

### 0.1 Rules for every surface

- **One set of tokens.** Color, type, shape, spacing, and motion come from the same token source on every surface. A surface may change a token value only through a documented preset, never by hard-coding a value in a component.
- **Same features, same data.** Every feature and every piece of content exists on every surface. Nothing is dropped on a larger screen, and nothing is hidden on web that is available on the phone.
- **Structure follows the form factor.** A surface may change its app structure to fit the layout: navigation type, number of panes, whether a view is a page, a pane, or a sheet, and the order of sections. Each surface's structure is chosen for that surface, not inherited from the phone.
- **Same actions, possibly placed differently.** The primary action of a task is always available on every surface. Its location can change (footer on phone, toolbar or side panel on tablet and web).
- **The phone is built first.** Build and test the compact layout first, so the core flows are proven. Tablet and web structures are then designed for their own layouts. Phone code is reused where it fits; it is not forced to fit.
- **Save and restore everywhere.** Section 9.3 applies on every surface. A web tab reload and a tablet rotation restore state the same way an Android relaunch does.
- **Resize keeps the user's place.** When a window grows or shrinks, the structure changes between the layouts in section 5.2, but the user keeps their place, selection, draft, and scroll position.

### 0.2 Tablet

Tablet is a different structure, not a stretched phone. Think in panes: the screen holds a navigation area, a list or working area, and a detail or supporting area at the same time.

- Use the medium and expanded layouts from section 5.2. List-detail (section 17.2) is the default for any list that opens a detail.
- Pages that are a stack on the phone become panes on the tablet where the user benefits from seeing two things at once. For example, a result can sit next to its form, and a chat can sit next to its thread list.
- Modal sheets that are used for short tasks on the phone can become a persistent side panel on the tablet, if the user needs to keep the context visible while acting.
- Navigation: rail at medium width, permanent drawer at expanded width. Bottom navigation is replaced, not shown alongside.
- Chat (section 8): the thread list is a docked left panel. The thread keeps a 680 reading width, and the extra width goes to the list panel.
- Forms (section 9): the form and the result can sit side by side on expanded width. On medium width, keep the two-page pattern.
- Sheets become side sheets at expanded width. Dialogs keep the same size rules as the phone.
- Support rotation and split-screen. A screen keeps its state through a size change.
- Support a hardware keyboard and a pointer. Every action has a keyboard path, and hover shows the same information as touch does on a long press.

### 0.3 Web

Web is a workspace, not a small app. Users arrive with a mouse, multiple tabs, and long sessions. Design the structure for that.

- **Structure:** a persistent sidebar holds the app's areas and recent items. The main area holds the working view. Secondary content (sources, settings for the current item, a result history) sits in a right panel that can be opened and closed. The phone's bottom bar is not used on wide web layouts.
- **Multi-tab and deep linking:** every view has its own URL, so the user can open items in new tabs, bookmark them, and use back and forward. Sidebar state and open panels are kept per tab.
- **Layout:** responsive from 360 px to 1920 px wide. Use the same window classes as Android (section 5.2). Content width is capped (680 reading, 1040 dashboards, 640 forms).
- **Navigation:** a left sidebar at expanded width, and a collapsible rail at medium width. The bottom bar is used only below 600 px. Route every page with a URL, so back, forward, and reload work.
- **Keyboard:** all actions reachable by Tab, with a visible focus ring (section 13). Shortcuts for the main actions are listed in one place (for example, `Ctrl+K` to search or open the command list). Esc closes sheets, menus, and stops generation (section 8.7).
- **Hover:** hover reveals secondary actions on list rows and message actions. Hover is never the only way to reach an action. Touch and keyboard users see the same actions without hovering.
- **Chat:** Enter sends and Shift+Enter adds a line on web. The hint text in section 8.3 is shown. The IME guard in section 8.3 applies.
- **Scrolling:** the browser scroll bar is kept. Do not replace it with a custom bar. Keep the jump-to-latest pill and the stick-to-bottom rules from section 8.6.
- **Persistence:** saved state lives in the browser's local storage or IndexedDB, with the same normalizer and the same separate keys as section 9.3. Credentials are never stored in the browser's local storage. Use a secure, HTTP-only cookie or the server session.
- **Notifications and errors:** use the inline banner and snackbar patterns (section 7.7). Do not use the browser's native alert or confirm.
- **Offline:** the banner in section 15 applies. Show it when the browser reports that it is offline, and when a request fails.
- **Text and selection:** text can be selected and copied on web. Code blocks and generated results include a copy action.
- **Links:** a result or a source can open in a new tab with a modifier key (Ctrl or Cmd click). Plain click opens inside the app.

### 0.4 Where each section applies

| Section | Phone | Tablet | Web |
| --- | --- | --- | --- |
| 2 Color, 3 Type, 4 Shape, 6 Motion | Yes | Yes | Yes |
| 5 Spacing and window classes | Compact | Medium, expanded | All |
| 7 Components | Yes | Yes, with side sheet at expanded | Yes, plus hover and focus states |
| 8 AI chat | Yes | Docked thread list | Docked list, keyboard shortcuts |
| 9 Form and result | Two pages | Side by side at expanded | Side by side at expanded |
| 13 Accessibility | Yes | Yes | Yes, plus keyboard and focus order |
| 17 Screen architecture | Yes | Yes, list-detail default | Yes, sidebar navigation |

---

## 1. Principles

1. **Clarity first.** Each screen has one job and one primary action. If a user has to search for the next step, the screen has failed.
2. **Calm, confident surfaces.** Neutral base, one accent, tonal layers for depth. No decoration that does not help the task.
3. **Expressive where it counts.** Shape, color, and motion get emphasis on hero moments and key actions only.
4. **The answer is the hero.** In AI screens the output is primary. Process (tool calls, reasoning, status) is visible but quiet.
5. **The user stays in control.** Never move the user's scroll position, draft, or focus without a reason they can see.
6. **Work survives interruption.** Every change is saved as it is made. Drafts, results, screen state, and in-flight generations persist across leaving, reloading, restarting, and reconnecting (section 9.3).
7. **Adaptive by window size.** The phone layout is the base. Larger windows add panels and columns. They do not change the task flow.
8. **Accessible by default.** Accessibility is a requirement of each component, not a later pass.

---

## 2. Color

### 2.1 Roles

Use semantic roles, never raw hex values, in components. Every role has a light and dark value. Themes are token sets, so a new preset is a new set of values.

| Role | Purpose | Light | Dark |
| --- | --- | --- | --- |
| `background` | Page base | `#FAFAFA` | `#0B0D12` |
| `surface` | Cards, sheets, composer | `#FFFFFF` | `#151821` |
| `surfaceRaised` | Menus, popovers, selected card | `#F4F4F5` | `#1C2030` |
| `surfaceSunken` | Code blocks, inputs at rest | `#F1F1F3` | `#10131B` |
| `outline` | Hairline borders | `#E4E4E7` | `#2A3040` |
| `outlineStrong` | Focused or selected borders | `#A1A1AA` | `#4B5366` |
| `onBackground` | Primary text | `#18181B` | `#F4F4F5` |
| `onSurfaceVariant` | Secondary text, metadata | `#52525B` | `#A1A1AA` |
| `primary` | Main action, focus, selected | `#4F46E5` | `#818CF8` |
| `onPrimary` | Text on `primary` | `#FFFFFF` | `#0B0D12` |
| `primaryContainer` | Tonal buttons, user bubble | `#E0E7FF` | `#2A2F6B` |
| `onPrimaryContainer` | Text on `primaryContainer` | `#1E1B4B` | `#E0E7FF` |
| `secondary` | Supporting accent (optional) | `#0D9488` | `#5EEAD4` |
| `error` | Errors, destructive actions | `#DC2626` | `#F87171` |
| `onError` | Text on `error` fills | `#FFFFFF` | `#0B0D12` |
| `success` | Confirmed, saved | `#15803D` | `#4ADE80` |
| `warning` | Limits, caution | `#B45309` | `#FBBF24` |

Rules:
- One saturated accent (`primary`). Everything else is neutral or a state color.
- Status uses color **and** an icon **and** a word. Never color alone.
- Hub, category, or feature colors are icon-only accents. They never appear as text or as button fills.
- Body text on `background` and `surface` must reach 4.5:1 in both modes. Icons and control borders must reach 3:1.

### 2.2 Themes

- Default: Indigo (above).
- Presets can change `primary`, `primaryContainer`, and `secondary`. They cannot change `error`, `success`, or `warning`.
- Light, Dark, and System modes are all supported. System is the default.
- Dark mode is not inverted light mode. Surfaces get lighter as they rise, `primary` is lightened, and shadows are removed.

### 2.3 Dynamic color (optional)

Where the platform offers wallpaper-based color, use it for `primary` and the container roles only. Keep the state colors fixed so meaning never changes with the wallpaper.

---

## 3. Typography

Font: **Inter** for UI and body (variable font, loaded with `expo-font`). Fallback: system sans-serif. Use **JetBrains Mono** (or the system monospace) for code and tool input.

Use a fixed type scale for each role. Sizes are in sp. Line heights are absolute.

| Token | Size / Line | Weight | Tracking | Use |
| --- | --- | --- | --- | --- |
| `display` | 32 / 40 | 700 | -0.6 | Hero titles on the dashboard and onboarding |
| `headline` | 24 / 32 | 650 | -0.3 | Page titles |
| `title` | 18 / 26 | 600 | -0.1 | Card and section titles |
| `bodyLarge` | 16 / 25 | 400 | 0 | Chat replies, long-form input |
| `body` | 15 / 22 | 400 | 0 | Default body, descriptions |
| `label` | 14 / 20 | 500 | 0.1 | Buttons, chips, field labels |
| `caption` | 12 / 16 | 500 | 0.2 | Metadata, timestamps, helper text |
| `overline` | 11 / 14 | 600 | 0.8 | Uppercase group labels |
| `code` | 14 / 22 | 400 | 0 | Code and structured output (mono) |

Rules:
- Use no more than three sizes on one screen.
- Use weight and color before size to create hierarchy.
- Text sizes scale with the system font setting. Containers grow with text. Never fix the height of a text container.
- Limit line length to about 70 characters for reading text (`maxWidth` 680 on large windows).
- Use sentence case everywhere. No all-caps except `overline`.

---

## 4. Shape

Shape is the most visible expressive tool. Use it to group and to signal state, not for decoration.

### 4.1 Corner scale

| Token | Radius | Use |
| --- | --- | --- |
| `xs` | 6 | Message tails, code chips, tags |
| `sm` | 10 | Inline inputs, small menus |
| `md` | 14 | Icon tiles, list rows in grouped lists |
| `lg` | 20 | Cards, text fields, the composer |
| `xl` | 28 | Sheets, dialogs, hero panels |
| `full` | 999 | Buttons, chips, icon buttons, avatars |

### 4.2 Asymmetric corners (expressive)

Use asymmetry to show direction and grouping:

- **User message:** `lg` on three corners, `xs` on the top-right (the side it comes from). Used only in the chat thread.
- **Assistant message:** no bubble. Full-width text. Avatar is `full`.
- **Grouped list:** the first item has rounded top corners, the last has rounded bottom corners, and inner items are `sm`. The group reads as one shape.
- **Sheet and dialog:** `xl` on the top corners only for bottom sheets. `xl` on all corners for dialogs.

### 4.3 Shape morph

- Buttons and icon buttons morph from `full` to `lg` when pressed, and back on release. The press is the feedback, not color alone.
- Toggle groups morph the selected segment to a wider, rounder shape.
- Loading indicators may use a soft organic shape. Keep them short-lived. Use a standard spinner for waits over 3 seconds.

---

## 5. Spacing, Layout, and Elevation

### 5.1 Spacing

Base 4. Scale: `2` 2, `4` 4, `8` 8, `12` 12, `16` 16, `20` 20, `24` 24, `32` 32, `40` 40, `56` 56.

- Screen horizontal padding: 16 (compact), 24 (medium), 32 (expanded).
- Space between sections: 32.
- Title to content: 12–16.
- Inside a card: 16 (compact), 20 (medium and above).
- Between list items: 8.
- Touch targets: 48 minimum (see section 13).

### 5.2 Window size classes

Use platform window size classes, not device names.

| Class | Width | Layout |
| --- | --- | --- |
| Compact | < 600 | One column. Bottom navigation. Forms in a bottom sheet or full page. |
| Medium | 600–839 | Two columns for card grids. Navigation rail. Side panel for secondary content. |
| Expanded | ≥ 840 | Three or four columns. Navigation rail or permanent drawer. Chat list docked on the left. Content max width 1040. |

Rules:
- Read the class once from a `useWindowSize()` hook. Do not compute widths in components.
- Grids use the same card component at every size. Only the column count changes.
- Content width is capped: forms 640, reading text 680, dashboards 1040.
- Keep the primary action reachable on every size. On expanded windows it can move to the side panel.

### 5.3 Elevation

- Depth comes from surface tone first (`background` → `surface` → `surfaceRaised`).
- Floating elements (menus, the jump-to-latest pill, sheets) get one soft shadow: `0 4 16 rgba(0,0,0,0.12)` in light mode. No shadow in dark mode; use a 1px `outline` instead.
- Never stack shadows.

---

## 6. Motion

Motion explains change. It never decorates.

### 6.1 Motion scheme

Use the **expressive** spring scheme for hero moments and key actions (sending a message, saving, opening a sheet). Use the **standard** scheme for everything else (list changes, tab switches, field focus). Both use springs, not fixed easing curves.

Fallback durations and easing, for platforms or code paths without springs:

| Transition | Duration | Easing |
| --- | --- | --- |
| Enter the screen | 300 | Emphasized decelerate |
| Exit the screen | 200 | Emphasized accelerate |
| Begin and end on screen | 250 | Standard |
| Press feedback | 100 | Standard |
| Sheet open | 400 | Emphasized decelerate |

Keep every transition under 500 ms. Above 300 ms, only use it for a hero moment.

### 6.2 Patterns

- **Press:** shape morph and a 10% `onSurface` state layer. No scale-bounce on tap.
- **Enter:** content fades up 8 px. Cards in a grid stagger by 40 ms, to 6 items at most.
- **Shared element:** a hub card expands into its page. A chat list row becomes the thread title.
- **Streaming text:** each new text chunk fades in (opacity only, 150 ms).
- **Loading:** skeleton blocks shaped like the content, not a centered spinner, for lists and cards.

### 6.3 Reduced motion

When the system reduces motion: no spatial movement, no shape morph, no stagger, no streaming fade. Use opacity and instant changes only. Scroll jumps are instant.

---

## 7. Components

### 7.1 Buttons

| Variant | Fill | Text | Use |
| --- | --- | --- | --- |
| Filled | `primary` | `onPrimary` | The one primary action on a screen |
| Tonal | `primaryContainer` | `onPrimaryContainer` | Secondary action that still matters |
| Outlined | transparent, `outline` border | `onBackground` | Cancel, alternative actions |
| Text | transparent | `primary` | Low-emphasis, inline actions |
| Destructive | `error` | `onError` | Delete, clear. Always confirmed. |

- Height: 48 (default), 56 (primary footer action). Shape `full`.
- Full width on compact windows for the primary action.
- Labels are verbs with an object: "Save draft", "Send message", "Generate posts". Not "OK", "Go", or "Submit".
- Loading: the label changes to the progress verb ("Generating…") and the button is disabled. Do not remove the button.

### 7.2 Icon buttons

- 48 touch target. Icon 24. Shape `full`. Standard variant has no fill; tonal variant has `surfaceRaised`.
- Every icon button has a content description that names the action and the object: "Delete note", "Copy reply".
- Toggle icon buttons use `selected` state and a filled icon, not color alone.

### 7.3 Navigation

- **Compact:** bottom navigation bar with 3–5 destinations. Height 80. Active destination uses a pill indicator in `primaryContainer` with the label visible.
- **Medium and expanded:** navigation rail (80 wide) or a permanent drawer (280 wide) with labels.
- **Top app bar:** 64 high. Page title left. Up or back action at the start. At most two actions at the end. Large title (headline) collapses to a small title on scroll.
- Back returns one level. It never jumps to the home page unless the user came from there.
- Predictive back gesture is supported. Pages must not block it without a confirmation.

### 7.4 Cards

- Shape `lg`. Fill `surface`. Border 1px `outline` in dark mode only. Padding 16 to 20.
- Filled (default), elevated (only for a selected or floating card), and outlined (for lists).
- The whole card is the touch target when it opens something. Its chevron or trailing icon is decoration only.
- Cards in a grid share the same height per row.

### 7.5 Text fields

- Filled container, shape `lg`, height 56 for single line. Background `surfaceSunken`.
- Floating label. Helper text below (caption, `onSurfaceVariant`). Counter at the end when there is a limit ("120 / 1000").
- Focus: 2px `primary` border. Error: 2px `error` border, with an icon and a sentence.
- Optional fields say "(optional)" in the label. Required fields have no marker.
- Multiline fields grow to 8 lines, then scroll.
- Placeholders show an example. They never hold a real value.

### 7.6 Selection controls

- **Chips** (filter and choice): shape `full`, height 36. Selected chip uses `primaryContainer` and a check icon.
- **Segmented control** (2–4 options, one choice): connected button group. Selected segment has `primaryContainer`.
- **Switch:** for settings that take effect immediately.
- **Checkbox row:** for multi-select. The whole row toggles. Minimum height 56.
- **Slider:** shows the current value next to the label.

### 7.7 Dialogs, sheets, and feedback

- **Bottom sheet** (compact) or **side sheet** (expanded): for pickers, filters, persona switching, and secondary forms. Drag handle. Dismiss on swipe or scrim tap.
- **Dialog:** only for decisions that cannot be undone (delete all, sign out). Title is a question. Two buttons: the destructive action is on the right and uses the destructive variant, and the safe action is text.
- **Snackbar:** for confirmations and undo. Bottom of the screen, above the composer. Auto-dismiss after 4 s. Undo action when the change is reversible. Use this instead of a dialog for deletes that can be undone.
- **Inline banner:** for errors and limits that affect the screen. It sits above the content, uses `error` or `warning` with icon and words, and offers one action.
- **Never** use a blocking alert for a network or validation error.

### 7.8 Empty, loading, and error states

Every list, result, and chat has all three states:

| State | Content |
| --- | --- |
| Empty | Icon (48, `onSurfaceVariant`), one-line title ("No notes yet"), one sentence about the next step, and the primary action. |
| Loading | Skeleton shaped like the content. Show after 300 ms, not before. Spinner only for actions. |
| Error | What failed in plain words, what the user can do, and a Retry button. Never a raw status code alone. |

---

## 8. AI Chat (Assistant Pattern)

Use this pattern for any multi-turn conversation with an AI assistant or character. It is the most-used surface in an AI product, so it has the most rules.

### 8.1 Layout

- **Header:** back on the left. Title is the thread name, with the persona or model as a subtitle. Actions on the right: New chat and a menu. On expanded windows the thread list is a docked left panel and the header has no list button.
- **Thread:** scrolls. Content width 680, centered.
- **Composer:** pinned to the bottom, above the keyboard and the safe area.
- **Thread list:** a side sheet (compact) or docked panel (expanded). Rows show title, last message time, and a menu for rename and delete.

### 8.2 Messages

- **User message:** right-aligned, `primaryContainer` fill, shape per section 4.2, max width 80% of the thread. Text is `bodyLarge`.
- **Assistant message:** left-aligned, no bubble, full width. Small avatar (32, `full`) and a name line (`caption`, `onSurfaceVariant`). Markdown is rendered in `bodyLarge`.
- **Message actions:** below each assistant reply, shown when the reply is done. Copy, Read aloud, Regenerate (last reply only), and Feedback (thumbs up and down). Icon size 20, touch target 48, shown at all times on compact windows and on hover on expanded.
- **Timestamps:** shown in a day separator when the thread spans days. Not on every message.

### 8.3 Composer

- Shape `lg`. Fill `surface` with a 1px `outline` border. Padding 8.
- Multiline field grows from one line to 8 lines (about 200 high), then scrolls inside.
- Inside the composer, from left to right: attach (optional, only if the assistant accepts files), input, voice input, and the **send/stop control**.
- Send is a 44 `full` button in `primary`. It is disabled (40% opacity, still visible) while the input is empty.
- While the reply streams, the send control **morphs into a Stop button** (same position and size, `onBackground` fill, square icon). Stop keeps the partial reply and marks it stopped.
- **Enter:** on a hardware keyboard, Enter sends and Shift+Enter adds a line. On touch keyboards, Enter adds a line and the send button sends.
- **IME guard:** Enter never sends while an input method is composing text (`isComposing` or `keyCode 229`). This keeps Japanese, Chinese, and Korean input safe.
- The composer clears only after the send succeeds. On failure the text returns to the field.
- Drafts are saved per thread and restored when the thread reopens.
- Hint text ("Enter to send, Shift+Enter for a new line") is shown on expanded windows and web only.

### 8.4 Streaming and states

| State | Shown as |
| --- | --- |
| `sending` | The user's message appears at once. Do not wait for the server to echo it. |
| `waiting` | Within 300 ms, a quiet "Thinking" indicator where the reply will start. After 10 s with no output, add "Still working". |
| `streaming` | Text fills in place with a caret. Send control is Stop. Thread announces nothing per token. |
| `done` | Caret removed, actions appear, code highlighting runs. |
| `stopped` | Partial reply stays with "Stopped. This answer is incomplete." and Regenerate. |
| `error` | Partial reply stays. Plain sentence on the cause and Retry. "Connection lost" and "Try again in 40 seconds" for rate limits. |
| `refused` | Shown as a normal reply in `onSurfaceVariant`, not as an error. It has no Retry. |
| `offline` | Banner above the composer. Send is disabled and says why. Drafts are kept. |

Streaming rules:
- Batch incoming chunks and apply them once per frame. Only the streaming message re-renders.
- Render partial Markdown tolerantly. Open code fences and unmatched emphasis render as their final form while streaming. Do not flash raw syntax.
- Highlight code after the block closes. Show plain monospace while it streams.
- A reply that is still running can be reopened. It shows the current text and continues, rather than starting over or duplicating.

### 8.5 Process: tool calls, reasoning, and sources

- **Tool call card:** compact, collapsed by default. Shows the tool name, a status word and icon (Running, Done, Failed), and a short summary. Expanded, it shows input and output in `code` style. Never place it above the answer.
- **Reasoning or steps:** a single-line summary ("Looked up 3 sources") that expands. Open while running, closed when done.
- **Sources:** numbered markers in the text (`[1]`) link to source chips under the reply. Show only sources the reply actually used.
- **Refusals** are normal replies, not errors.

### 8.6 Scroll behavior

This is the most common AI-chat failure. Follow these rules exactly.

- **Stick to bottom only while the reader is at the bottom.** When the reader scrolls up, stop following immediately. Do not pull them back.
- **Resume following** when the reader sends a message, or taps the jump control.
- **Send anchors the question.** Scroll so the new user message is at the top of the viewport, and let the reply fill the space below it.
- **Jump to latest:** a pill centered above the composer. It appears when the reader is more than 48 px from the bottom. It shows the count of new replies while scrolled up. Tapping it scrolls to the end (instant under reduced motion).
- **Opening a thread** lands at the latest message. Returning to a thread restores the last scroll position.
- **Loading older messages** keeps the visible content in place.

### 8.7 Accessibility for chat

- The thread is a log landmark with a label. Each message has a label that names the speaker.
- Do not announce every streamed token. Use one polite status region that announces "Reply started", "Reply ready", "Stopped", or the error.
- The streaming message carries a busy state.
- Stop, Send, and the menu change their labels with state ("Stop generating", "Send message").
- Esc stops generation on a hardware keyboard, then closes menus.

### 8.8 Resilience

- Generation runs on the server, not tied to the connection. A reload or a network drop does not lose the reply.
- Each reply has an id. The client tracks what it has received and asks for the rest on reconnect.
- While a reply is running, a new message is either **queued** (default for work-in-progress agents, shown under the running reply, editable until sent) or **interrupts** the reply (the current one is kept as stopped). Pick one per assistant and show it in the UI.
- Each send carries a client-generated id, so a retry never creates a duplicate message or reply.
- Multiple open copies of the same thread stay in sync. Only one copy owns a running reply.

---

## 9. Form and Result Pattern (Generate Pattern)

Use this for any "fill in fields, get a result" tool. It covers generators, planners, graders, and summarizers.

### 9.1 Two pages

| Page | Body | Top app bar | Bottom action |
| --- | --- | --- | --- |
| Result | The output. Empty state when none exists. | Title, overflow menu | One primary action: "New {item}" |
| Form | The fields, grouped by purpose, with an optional summary of context | Title, Reset action | Error, then "Generate {item}" |

Rules:
- Put fields in the body. The bottom area holds the error and one button only.
- The result page does not show the form. The form page does not show the result.
- Opening the form pushes a page. Returning after a successful generate pops it, so the stack holds one result page.
- A failed generate stays on the form and shows the error there.

### 9.2 Fields

- Plain labels. Optional fields say "(optional)".
- Five or fewer required fields per step. Group the rest, or split into steps.
- Choices use segmented controls or chips with one sensible default selected. Use a dropdown only for long lists.
- Offer "Custom" only when the generator accepts any text. Its text field has an example placeholder.
- Free-text instructions: label "Instructions (optional)" with a 1000-character limit and a visible counter.
- Length limits on every text field, shown as a counter near the limit.
- Empty optional values use a stated default ("Default tone"), never a silent blank.
- Values are never pre-filled with real content.

### 9.3 Persistence

**Save every change, as it happens.** The user never needs a Save button to keep their work, and nothing they typed or chose is lost to a back gesture, a crash, a call, or a restart.

- **Every field is saved on change.** Each keystroke, toggle, chip, slider step, dropdown choice, checkbox, and reorder writes to the device. Text fields use a short debounce (300–500 ms) and flush immediately when the field loses focus, the screen is left, or the app goes to the background.
- **Every screen restores its state on return.** This covers form values, the selected tab or segment, filter choices, expanded sections, the selected list item, the scroll position, and the open thread or round.
- **Restore on relaunch.** After the app is closed and reopened, the last form, last result, and last open screen come back. The user sees where they were, not a blank start.
- **Changes are never lost to a failed save.** If a write fails, keep the value in memory, show a banner ("Changes couldn't be saved. They'll try again."), and retry. Never discard the user's value silently.
- **In-progress work is kept.** A generation that is running is saved when its first part arrives, and a reply that was streaming is kept as partial text (section 8.8). When a request was cut off, show it as interrupted with a Retry, not as if it never started.
- **Not saved:** passwords and API keys (use the platform keystore, section 9.3 below), one-time confirmation prompts, and transient error messages. Large media, such as camera images, is saved as a reference to a file in app storage, not as data in the store.
- **Undo, not confirm, for reversible changes.** Because everything is saved, a delete or clear can be undone with a snackbar (section 7.7) rather than a dialog.

The form and the last result persist on the device. Leaving the app and returning restores both.
- Store the form and the result under separate keys, so they never overwrite each other.
- Restore stored data through a normalizer that keeps valid fields and falls back to defaults for the rest.
- Do not save until the stored value has loaded.
- Reset clears the form (or the result) and its saved copy. Reset is in the top app bar.
- Never save credentials in this store. Use the platform keystore.

### 9.4 Result actions

- Results are copyable, shareable, and deletable from the overflow menu.
- Editing a result, or generating a revision of one item, creates a new item beside the original. The original is never overwritten. Revisions show their parent, and each keeps the inputs it was made with.
- Selecting items to keep and generating more is a checklist. Kept items persist. Unkept items are removed when a new batch is generated. Show the count of kept items on the primary action.

---

## 10. Interactive Practice Pattern (Round Pattern)

Use this for games, quizzes, and training rounds: the app asks, the user answers, the app responds. The round stays until it is solved or the user leaves it.

- **Round page:** the prompt, attempts so far, feedback, and an optional hint. The answer field is the footer action while the round is open.
- **When solved:** the footer becomes "Next round". The result is shown with what was right, not only a score.
- **Feedback** uses a check or a cross icon with words. Color is secondary.
- **Hints** are an explicit action in the body. They never appear without a request.
- **Setup page:** the difficulty, topic, and options. Its footer is "Start". Changing setup does not change a round in progress.
- The newest attempt scrolls into view.
- Each attempt is saved, so leaving and returning shows the same round.

### 10.1 Multi-step session

For sessions with stages (decision, answer, review, next):

- A stepper or a stage label sits in the top app bar, always showing where the user is.
- Each stage has one footer action.
- Feedback that would give away the answer is shown only after the attempt is submitted.
- Undo is available for each stage where it is safe.

---

## 11. Dashboard and Navigation Hubs

- **Dashboard:** a greeting or page title, one sentence on what to do, and a grid of area cards. This is a bento-style grid: some cards are larger (featured) and others are standard. Featured cards go first. Keep at most one featured card per row.
- **Area card:** icon in a 48 tile (tinted with the area's accent at 12%), title (`title`), one-line description (`body`), and a trailing chevron. Full card is the touch target.
- **Recent or continue:** when the user has an unfinished chat, round, or draft, show it as the first card with "Continue".
- **Area page:** a list or grid of tools, grouped by purpose, with search when there are more than eight tools.
- **Accent per area:** each area has one accent for its icon tile only. Accents never color text, buttons, or status.

---

## 12. Content and Writing

- **Voice:** clear, direct, and calm. Short sentences. Name the thing being acted on.
- **Buttons:** verb plus object. "Send message", "Save draft", "Delete note".
- **Errors:** what happened, what to do. "Couldn't reach the server. Check your connection and try again." Not "Error 503".
- **Position words:** never "above" or "below" for UI placement. Name the control instead ("in the message box", "tap Save").
- **Destructive wording:** name what will be lost. "Delete 3 notes? This can't be undone."
- **AI transparency:** label generated content, and say when the answer may be wrong, once per thread, not on every message.
- **Localization:** all strings come from resource files. Text expands by up to 40%. Layouts must hold. Support right-to-left mirroring for icons with direction.

---

## 13. Accessibility

- **Touch targets:** 48 × 48 minimum. Chat action icons may draw at 20 but must hit at 48.
- **Contrast:** 4.5:1 for text, 3:1 for icons, borders of controls, and focus rings.
- **Focus:** a visible 2px `primary` focus ring on every interactive element for keyboard and switch users.
- **Labels:** every control has an accessible name that matches its visible label. Icon-only controls name the action and the object.
- **State:** selected, expanded, disabled, busy, and checked states are exposed to assistive tech, not shown by color alone.
- **Headings:** page and section titles are headings, so screen-reader users can jump between them.
- **Live regions:** status and errors announce politely. Errors that block the user announce assertively. Streaming text does not announce per token.
- **Text scale:** layouts hold at 200% text scale. No clipped text. Containers grow.
- **Reduced motion:** see section 6.3.
- **Secrets:** API keys and passwords are masked, never read aloud, and have a visible show/hide toggle with a label.
- **Color blindness:** no meaning depends on red versus green alone. Use icons and words.
- **Keyboard and switch:** every flow completes with a keyboard or switch. Shortcuts are optional and listed in one place.

---

## 14. Dark Mode and Theming

- Follow the system by default. The user can override it in settings.
- Use roles from section 2 only. Never hard-code a color in a component.
- Images and illustrations get a dark variant or a 90% opacity overlay.
- Charts use the state colors and a pattern or label, not color alone.
- Test every preset in both modes against section 13's contrast rules.

---

## 15. Offline, Performance, and Privacy

- **Offline:** show a banner, keep drafts and last results readable, and disable actions that need the network with a reason.
- **Performance:** first meaningful content in under 1 s on a mid-range device. Long lists are virtualized. Images are sized before they load.
- **Privacy:** ask for permissions when the feature is first used, in context, with a sentence on why. Show what is stored on the device and how to clear it.
- **Data:** drafts and results are stored on the device. Clear data is available in settings.

---

## 16. Implementation Handoff

This section is for the code update. It lists what to build first.

### 16.1 Tokens

Create one token source in `src/theme/` with:
- Color roles for light and dark (section 2).
- The type scale (section 3).
- The corner scale and component shape rules (section 4).
- Spacing, window size classes, and content widths (section 5).
- Motion durations and the spring scheme (section 6).

Components read tokens only. Presets replace color values, not structure.

### 16.2 Build order

1. Tokens, theme provider, and the window size hook.
2. Core components: buttons, icon buttons, cards, text fields, chips, segmented control, sheets, snackbar, banner, empty and error states.
3. Navigation: bottom bar (compact), rail (medium and expanded), top app bar with large title.
4. Dashboard bento grid and area cards.
5. Chat pattern (section 8) as a reusable component, with streaming states and scroll behavior.
6. Form and result pattern (section 9) as a template.
7. Round pattern (section 10) and dashboard continue card (section 11).
8. Screen templates for single-page (list-detail, supporting pane, docked bar) and multi-page (top-level destinations, stepper) flows (section 17).
9. Tablet layouts (section 0.2): rail, drawer, docked chat list, and side-by-side forms at expanded width.
10. Web layouts (section 0.3): responsive sidebar, URL routing, keyboard shortcuts, and hover-revealed secondary actions.

### 16.3 Definition of done for a screen

- Uses tokens only. No raw colors, sizes, or radii.
- Has empty, loading, and error states (section 7.8).
- Passes contrast and touch target rules (section 13).
- Holds at 200% text scale and in dark mode.
- Respects reduced motion.
- Has one primary action, and it is in the footer or top of the content.
- Every change is saved as it is made, and the screen restores its state on return and on relaunch (section 9.3).
- Persists its draft and last result where section 9.3 or 10 applies.

---

## 17. Screen Architecture: Single-Page and Multi-Page

Android apps are built from two kinds of screen structure. Pick the lighter one that fits the job. Escalate only when the content grows.

- **Single-page:** one screen holds several views or panes that change in place. Nothing is pushed onto the back stack.
- **Multi-page:** each destination is its own screen on the back stack, with its own top bar and back action.

### 17.1 Choosing the structure

| Situation | Use | Why |
| --- | --- | --- |
| Comparing or switching between items many times | Single-page (list-detail) | Keeps the list visible, so no context is lost |
| Two or three views of the same data | Single-page (tabs or segmented control) | No navigation cost, and state is kept |
| A quick action, filter, or short form (1–5 fields) | Single-page (bottom sheet or inline) | Keeps the reader's place |
| Distinct top-level areas (Home, Chat, Library, Profile) | Multi-page (bottom navigation, 3–5 items) | Each area keeps its own history and scroll |
| A deep drill-down (area → tool → item) | Multi-page (hierarchical) | Each step is a clear place with a clear back |
| Long input with a long result | Multi-page (form page and result page, section 9) | Each page gets the full screen |
| Setup or onboarding with ordered steps | Multi-page (stepper, one action per step) | One decision at a time |
| Focused input that must not be interrupted (camera, full composer) | Full-screen modal | Clear start and end |

Rule: if the user needs to see A while working on B, keep both in one screen (single-page). If B replaces A for the task, make B a page (multi-page).

### 17.2 Single-page patterns

**Tabs and segmented control (in-page views).** Two to four views of the same data. Switch in place. The selected view keeps its scroll position. Use tabs for equal-weight views, and a segmented control for filters that change the same list.

**List-detail.** On medium and expanded windows, the list sits in one pane and the detail in another, side by side. On compact windows, the list is one screen, and tapping an item opens the detail as a page with the same route. The selected row stays highlighted in the list. The two panes never show the same content twice.

- Medium: list 40%, detail 60%. Expanded: list 360 fixed, detail fills the rest.
- Empty detail pane: show a short prompt ("Select a note to read it"), not a blank area.

**Supporting pane.** Secondary content (sources, settings for the current item, a summary) sits beside the main content on medium and expanded. On compact, the same content is a bottom sheet with a peek state. The main content never moves when the supporting pane opens.

**Bottom sheet.** Use for short tasks that need the screen behind it.

- Snap points: peek (about 25%), half (about 50%), and full (about 90%). Use no more than three.
- Peek shows a title and one action, never a bare strip.
- Modal sheets dismiss by a visible close button, a swipe, or a tap on the scrim. Non-modal sheets do not block the content behind them.
- Never stack a sheet on another sheet. If the next step needs a sheet, replace the content in the same sheet or open a page.
- Do not put long scrolling content in a sheet. Past about 10 items or a page of text, make it a page.

**Expandable sections (progressive disclosure).** Group secondary fields or details under a labeled header with a chevron and a one-line summary. Open the section that holds the current error. Keep the summary informative so the closed state still tells the user something.

**Inline edit.** For a single short field (a title, a count, a name), edit in place: tap, type, confirm. Use a page only when the edit needs several fields or a long text area.

**Docked status bar (peek).** When something runs in the background (a generation, a timer, a playing item), show a slim bar above the bottom navigation with its title and one action. Tapping it opens the full view. The bar hides when there is nothing to show. It must not cover the composer or a primary action.

**Collapsing top bar.** A large title sits at the top of a list. It collapses to a small title as the user scrolls. Use it on list pages with no tabs. Do not combine it with tabs in the same bar.

### 17.3 Multi-page patterns

**Top-level destinations (bottom navigation).** Three to five destinations of equal weight. Each one keeps its own back stack and scroll position when the user switches away and comes back. Tapping the active destination again returns it to its top. Settings is not a bottom destination. Open it from the top bar.

**Hierarchical drill-down.** Hub → list of tools → tool → item. Each step is a page with one top bar and a back action. Use predictive back on Android. Do not skip levels on back.

**Form page and result page.** Use section 9 when the form needs the full screen. The result page is the default. The form opens as a page, and returning after success pops it.

**Stepper flow.** Ordered steps, one decision per step. Show the step count in the top bar ("2 of 4"). The primary action sits at the bottom of each step. Back returns to the previous step with the values kept.

**Full-screen modal.** For focused tasks with a clear start and end (camera capture, a full composer, a fullscreen media viewer). It has a close action at the start of the top bar and a done action at the end.

### 17.4 Using the space

Goal: no wasted space, no cramped screens. Each rule below serves that.

**Pick the lightest container.** Inline first, then a sheet, then a page. Move up a level only when the content no longer fits.

**Use every window size.**
- Compact: one column, full width, bottom navigation.
- Medium: two panes for list-detail or card grids of two columns. Keep the navigation rail.
- Expanded: three columns or a list-detail with a supporting pane. Navigation drawer or rail. Do not center a single narrow column with empty margins on lists. Use a grid or a pane instead.
- Reading text stays at about 680 wide even on expanded. The extra width goes to a supporting pane, not to longer lines.

**One top bar per screen.** Do not stack a top bar, a page title, and a toolbar. Put the title in the top bar, and put actions there too, with at most two actions.

**Compact rows, not padded rows.**
- Single-line list row: 56 high. Two-line row: 72 high. Three lines: 88 at most.
- Grid tiles for visual items: minimum 160 wide, and the grid fills the row (no leftover column).
- List spacing: 8 between cards, 0 between rows with dividers.

**Let content flow under the bars.** Edge-to-edge layout. Content scrolls under the status bar and the navigation bar, and insets keep the first and last item clear.

**Hide chrome that does not help.** The bottom bar may hide while the user scrolls down a long feed, and returns on scroll up. Never hide the composer, the primary action, or the status of a running task.

**One scroll per screen.** Do not nest a scrolling list inside a scrolling page. If a section must scroll, give it the full height of the pane. Scrolling content inside a sheet is allowed only at its full snap point.

**Replace pages with controls.** A choice of 2–4 options is a segmented control or chips, not a separate page. A choice of many options is a searchable list in a sheet.

**Compact empty states.** When a list has few items, show a short empty state at the top of the content, not a full-height illustration. Keep the primary action next to it.

**One primary action per area.** Put the primary action in one of three places: the bottom bar, an extended action button at the bottom right (above the bottom bar, not covering content), or the end of the form. Not in two places.

### 17.5 Navigation rules

- The back stack holds only pages the user chose to visit. Sheets and dialogs are not on the stack. Back closes them first.
- Top-level destinations restore their state. Going back to Home shows Home as it was.
- Every page is reachable by a deep link from its route, so it can be shared and restored.
- Predictive back shows the preview of the previous page. Do not block it, except with a confirmation for unsaved changes.
- Cross-area jumps (for example, a chat link to a tool) replace the stack for that flow. They do not stack unrelated pages under the user.

### 17.6 Checklist for a new screen

1. Is the job one thing? If not, split it into pages.
2. Does the user compare items while working? Use list-detail.
3. Does the secondary content need to stay visible? Use a supporting pane or a docked bar.
4. Is it a short task? Use a sheet or inline, not a page.
5. Does the screen use the full window at medium and expanded sizes?
6. Is there one top bar, at most two actions, and one primary action?
7. Are rows and tiles at their minimum sizes, with no wasted columns?
8. Does back behave as the user expects, and is state kept when they return?

---

## 18. Changes from Version 2

- Version 3.2: added section 0, Platform Scope. Android phone is the first priority. Tablet and web share tokens, features, and data. Their app structure (navigation, pane and page arrangement) is designed for each form factor (sections 0.2 and 0.3). iOS is out of scope for this version.
- Version 3.1: added section 17, Screen Architecture. It covers single-page and multi-page patterns, Android list-detail and supporting panes, bottom sheet rules, and the space rules.
- Removed haptics. Motion and feedback use shape, motion, and state only.
- Rebuilt the foundation on current global patterns (Material 3 Expressive shape and motion, adaptive window size classes, modern AI chat behavior) instead of the existing app's look.
- Replaced the color palette presets with a semantic role system and one default accent.
- Replaced the type scale with a single named scale using Inter.
- Replaced breakpoints with platform window size classes.
- Added the AI chat pattern with streaming states, scroll behavior, IME safety, and resilience rules.
- Added state rules (empty, loading, error) to every component.
- Added the implementation handoff for the code update.
