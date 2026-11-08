# AI Trainer Android: Design System

This document describes the visual language of the Android app. It is copied from the
webui dashboard (`webui/src/app/globals.css`, `webui/src/app/(authenticated)/dashboard/page.tsx`,
and `webui/src/page_layout.md`) so both products look like one family.

Single-user Android build. There is no login or passcode gate. The app opens on the dashboard.

---

## 1. Principles

1. **Calm, dark-first surfaces.** Black background, slightly lifted card surfaces, hairline borders. Light mode mirrors the same structure.
2. **One accent.** Blue (`primary`) marks actions and brand. Hub colors are only used for icons.
3. **Generous rounding.** Cards and hero panels are very rounded; circular controls are fully round.
4. **Hierarchy through type and space**, not through heavy borders or shadows.
5. **Mobile first, with the webui breakpoints kept in mind** (see section 7).

---

## 2. Color Tokens

The app ships six colour presets (Ocean, Sunset, Forest, Violet, Rose, Classic), each with a light and a dark variant. Users pick a preset and Light, Dark, or System mode on the Settings page. The choice is saved on the device.

- Source of truth: `src/theme/palettes.ts` (preset surfaces) and `src/theme/colors.ts` (derived text, tone, and contrast helpers).
- Each preset sets `primary`, `hero` (the welcome panel), `background`, `card`, `muted`, and `border`. Text colours, hub tones, and button text are derived from them.
- Button and hero text switch between white and near-black, whichever is more legible. `palettes.test.ts` checks the 4.5:1 contrast minimum for every preset in both modes.

The table below shows the Classic preset values, which match the webui.

| Token | Light | Dark | webui token |
| --- | --- | --- | --- |
| `background` | `#FFFFFF` | `#000000` | `--background` |
| `foreground` | `#0F1419` | `#E7E9EA` | `--foreground` |
| `card` | `#F7F8F8` | `#17181C` | `--card` |
| `primary` | `#1E9DF1` | `#1C9CF0` | `--primary` |
| `primaryForeground` | `#FFFFFF` | `#FFFFFF` | `--primary-foreground` |
| `muted` | `#E5E5E6` | `#181818` | `--muted` |
| `mutedForeground` | `#0F1419` | `#72767A` | `--muted-foreground` |
| `accent` | `#E3ECF6` | `#061622` | `--accent` |
| `border` | `#E1EAEF` | `#242628` | `--border` |
| `ring` | `#1DA1F2` | `#1C9CF0` | `--ring` |
| `destructive` | `#F4212E` | `#F4212E` | `--destructive` |

### Hub tones

Each hub has one tone. Tone is used for the icon tile only.

| Tone | Hub | Icon color (light / dark) | Tile fill | Tile border |
| --- | --- | --- | --- | --- |
| `sky` | Learning | `#0284C7` / `#38BDF8` | sky-500 at 10% | sky-500 at 20% |
| `rose` | Practice | `#E11D48` / `#FB7185` | rose-500 at 10% | rose-500 at 20% |
| `emerald` | Linguistic | `#059669` / `#34D399` | emerald-500 at 10% | emerald-500 at 20% |
| `amber` | Tools | `#D97706` / `#FBBF24` | amber-500 at 10% | amber-500 at 20% |

Rules:
- Text is never colored with a hub tone. Only the icon tile uses it.
- Body text uses `foreground`. Supporting text uses `mutedForeground`.
- Errors use `destructive`. Do not use hub tones for errors or success.

---

## 3. Typography

The webui loads Open Sans and Geist. The Android starter uses the system font for now.
When fonts are added (via `expo-font`), keep the sizes and weights below.

| Role | Size | Weight | Tracking | Example |
| --- | --- | --- | --- | --- |
| Brand | 20 | 700 | -0.3 | AI**Trainer** header |
| Hero title | 30 | 700 | -0.5, line height 36 | "What are we learning today?" |
| Settings title | 24 | 700 | -0.4 | "Model connection" |
| Section title | 18 | 600 | 0 | "Explore hubs" |
| Card title | 18 | 600 | 0 | "Learning" |
| Body | 15 | 400 | 0, line height 23 | Hero description |
| Card description | 14 | 400 | 0, line height 21 | Hub description |
| Eyebrow | 14 | 500 | 0 | "Welcome back" |
| Tagline | 12 | 500 | 0.6, uppercase | "UNDERSTAND DEEPLY" |

Brand styling: "AI" in `primary`, "Trainer" in `foreground`.

---

## 4. Shape, Spacing, Elevation

### Radius

From webui `--radius: 1.3rem` (about 21px). Scale: `src/theme/tokens.ts`.

| Token | Value | Use |
| --- | --- | --- |
| `md` | 19 | Small inner elements |
| `lg` | 21 | Icon tiles |
| `xl` | 25 | Standard cards |
| `2xl` | 37 | Hero card, hub cards |
| `full` | 999 | Icon buttons, text inputs (round toggle), save button |

### Spacing

Base unit 4px. Named scale: `xs` 4, `sm` 8, `md` 12, `lg` 16, `xl` 24, `2xl` 32.

- Screen padding: `lg` (16).
- Gap between page sections: `2xl` (32).
- Gap inside a section (title to content): `lg` (16).
- Hub card inner padding: `xl` (24), gap `lg` (16).

### Borders and elevation

- Every surface has a 1px `border` color edge. This replaces the webui `ring-1 ring-foreground/10`.
- No drop shadows. Depth comes from the lifted `card` color against `background`.
- Decorative glows in hero panels are circles at 10% (primary) and 5% (amber) opacity, clipped by the panel. This approximates the webui `blur-3xl` circles, because React Native has no blur.

---

## 5. Components

### Header bar (sticky, top of every signed-in screen)
- Height 64. Bottom 1px `border`. Background `background`.
- Left: brand. Right: 40px round icon button with 1px border (settings gear, opens `/admin/settings`).
- Matches the webui `Navbar` (height `--navbar-height` 4rem, brand left, actions right).

### Hero / welcome card
- Full width, `card` fill, 1px `border`, radius `2xl`, padding 24 horizontal, 40 vertical.
- Eyebrow line with a `Sparkles` icon in `primary`, then a 30px title, then a 15px description.
- Matches the webui dashboard header.

### Hub card
- Full width on phones, about half width on tablets (`>= 640px`).
- Top row: 44px icon tile on the left, uppercase tagline on the right.
- Middle: title (18px semibold) and description (14px, muted).
- Footer: 1px top border, label in `mutedForeground`. Starter label is "Coming soon". The webui uses "Explore" with an arrow once pages exist.
- Not pressable yet. When pages are added, make the whole card a `Pressable` with a pressed state of `muted` and an arrow in `primary`.

### Icon buttons
- 40px circle, 1px `border`, transparent fill. Pressed fill is `muted`.
- Icons: `lucide-react-native`, 18–24px, stroke 2. Same family as the webui (`lucide-react`).

### Settings screen (`/admin/settings`)
- Header bar with a round back button on the left and the title "AI settings" centered.
- One `card` panel with three labeled fields: Model name, API key, Base URL. Each field has a hint line in `mutedForeground`.
- Inputs: `background` fill, 1px `border`, radius `lg`. The API key input is masked, with a round eye toggle beside it.
- Validation: the base URL must start with `http://` or `https://`. The error appears in `destructive` above the save button.
- Save button: full width, `primary` fill, round, with a save icon. Saved confirmation uses the `emerald` tone.
- Values are stored on the device only (SecureStore on Android, localStorage on web). Other apps read them through `useAiSettings()`.

### Loading
- While stored settings load, the settings screen shows a centered `primary` activity indicator.

---

## 6. Motion and Feedback

- Use the platform press state (`Pressable` pressed fill) for feedback. No bounce or scale on tap.
- Webui hover lift (`-translate-y-0.5`) has no touch equivalent. Do not copy it.
- Keep transitions under 300ms. Prefer platform navigation animations from Expo Router.
- Respect the system reduced-motion setting when animations are added.

---

## 7. Layout and Breakpoints

From `webui/src/page_layout.md`, mapped to Android. Constants in `src/theme/tokens.ts`.

| Range | Layout |
| --- | --- |
| `< 640px` (phones) | One column. Hub cards stack. Header shows brand and actions only. |
| `>= 640px` (tablets, foldables) | Hub cards in a two-column grid (48.5% width each). |

Layout rules:
- Content width is capped on very wide tablets, as the webui does above 1536px. Add a `maxWidth` when tablet layouts are built.
- Keep the 2-column split pattern from the webui page layout guide for future screens with live preview.
- Every screen must use `SafeAreaView` (or `useSafeAreaInsets`) so it clears notches and gesture bars.

---

## 8. Dark Mode

- The app follows the system setting (`userInterfaceStyle: "automatic"`).
- Components pick colors through `useThemeColors()` in `src/theme/index.ts`. Never hard-code a color in a component.
- Both schemes must pass WCAG AA contrast for body text (`foreground` on `background` and `card`).

---

## 9. Accessibility

- Every `Pressable` has `accessibilityRole` and `accessibilityLabel`.
- Touch targets are at least 44pt (iOS) and 48dp (Android). Keypad keys are 76px, icon buttons 40px. Raise the icon buttons to 48px if they show up as too small in device testing.
- Do not rely on color alone. Dots and errors also use text or shape.
- Support the system font scale. Avoid fixed-height text containers.

---

## 10. Known Gaps and Decisions

- **Fonts:** system font for now. The webui uses Open Sans (body) and Geist.
- **Blur:** replaced by translucent circles (see section 4).
- **Light-mode muted text:** the webui sets `--muted-foreground` to the same value as `--foreground` in light mode. Android copies that value for parity. Change it in both apps if the lower-contrast gray is preferred.
- **Access control:** there is no login or passcode. Anyone with the device can open the app and read the stored API key in the settings screen. Add a gate again before storing sensitive data beyond the API key.

---

## 11. Source Map

| Concern | Android file | webui reference |
| --- | --- | --- |
| Color tokens | `src/theme/colors.ts` | `src/app/globals.css` |
| Radius and breakpoints | `src/theme/tokens.ts` | `--radius`, `page_layout.md` section 4 |
| Dashboard | `src/features/dashboard/components/DashboardScreen.tsx` | `src/app/(authenticated)/dashboard/page.tsx` |
| Hub cards | `src/features/dashboard/components/HubCard.tsx` | `src/features/learning/components/LearningHubCard.tsx` |
| Hub list | `src/features/dashboard/data/hubs.ts` | `HUBS` in dashboard page |
| Header | `DashboardScreen.tsx` header | `src/features/navigation/components/Navbar.tsx` |
| AI settings | `src/features/ai-settings/`, `src/app/admin/settings.tsx` | No webui counterpart; single-user admin page |
