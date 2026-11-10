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
6. **Minimalist.** Each page does one job. Show only the fields that job needs.
7. **Don't make me think.** The next step is always obvious: one primary button, plain labels, sensible defaults.
8. **Remember what I typed.** Values and the last result stay when the user leaves and comes back. Nobody retypes a form (see section 12).

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
- Uses `ToolScreen` with `usesAi={false}`: round back button, the title "Settings" in the header, and no "not configured" notice.
- Body, top to bottom: the Appearance panel, a one-line intro, then one `Panel` per connection: Chat model, Voice input, and Text to speech. Each card has a `SectionTitle` and its main fields first.
- Optional separate base URL and key (voice and speech) sit behind a "Separate connection" toggle inside their card. It opens by itself when those values are already set.
- Fields use the shared `TextField` and `SelectField`. The API key input is masked, with a round eye toggle beside it.
- Footer: the error (`destructive`) or "Settings saved." (`emerald`) above a full-width primary "Save settings" button. The button is disabled until a value changes.
- Validation: each base URL must start with `http://` or `https://`.
- Values are stored on the device only (SecureStore on Android, localStorage on web). Other apps read them through `useAiSettings()`.

### Disclosure (dropdown section)
- `src/components/tool/Disclosure.tsx`: a panel with a tappable header (title, optional one-line summary, chevron) and a body that shows or hides.
- Starts closed unless `defaultOpen` is set. Use it for long secondary sections, such as a turn breakdown or an input that is not needed on every turn, so the screen stays short. The summary keeps the closed section informative.

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

---

## 12. Tool Pages

Every tool page (Learning, Practice, Tools) follows the same layout, the same field rules, and the same memory rules. A user who knows one tool can use all of them.

### 12.1 Layout

- Use `ToolScreen`. Header: round back button on the left, title in the middle, and the `ResetButton` on the right. A tool that never calls the AI passes `usesAi={false}`, so the "AI model not configured" notice does not show.
- The body scrolls and holds the results. When there is no result yet, show an `EmptyHint` with a title and one sentence about the next step.
- The form sits in the **footer** (`ToolScreen` `footer` prop). The footer stays pinned at the bottom, has a 1px top border, and holds:
  1. The fields. Cap the height and let them scroll inside the footer if they are long.
  2. The error message, just above the button.
  3. One full-width primary `ActionButton`, the only primary action on the screen.
- While the request runs, the button shows a loading label (for example "Connecting concepts…") and the fields are disabled.
- Reference files (inline layout): Conceptual Bridge (`src/app/learning/conceptual-bridge/index.tsx`) and Translator (`src/app/language-learner/translator/index.tsx`, with `src/features/translator/components/TranslatorTool.tsx`), and Rewriter (`src/app/language-learner/rewriter/index.tsx`, with `src/features/rewriter/components/RewriterTool.tsx`). Use the inline layout when the user repeats the same input and output on one page, such as paste text and read the translation.

### 12.2 Fields

- **Plain labels.** Required fields have no marker. Optional fields say `(optional)` in the label.
- **Placeholders show examples.** Never pre-fill real values. Filled-in defaults get sent to the AI without the user noticing.
- **Few fields.** If a form has more than about five fields, remove or merge some.
- **Choices only when they help.** Use a dropdown or chips with one sensible default selected (for example "Beginner"). Do not add options the AI does not need.
- **Custom choice.** A dropdown ends with a Custom entry (`SelectField` default). Give its text box an example placeholder. The generator must accept any non-empty text, and the signature must say the presets are suggestions, not a fixed list.
- **User instructions.** Tools that send a free-text instruction use the label "User instructions (optional)" and `maxLength` 1000.
- **Long text is multiline.** Show voice input on fields where the user might speak.
- **Length limits on every text field.** Use `maxLength` in the UI and a matching check in the generator.
- **Blank handling.** An empty optional field sends a fallback such as "None". An empty required field shows a plain message above the button, such as "Broader topic is required."
- **Errors use words, not codes.** Say what to fix, in `destructive`.
- **AI-written text.** A long field can be filled by the AI from a short description (`SystemPromptAssistant` in roleplay). The description field and an outline "Write…" button sit above the field. The AI text only fills the field, and the user can edit it before use. Keep the primary button for the tool's main action.

### 12.3 Remembering values

- Every tool saves its form, and its last result, on the device. Use `loadDocument` and `saveDocument` from `src/lib/document-store.ts`, or the shared hook `src/hooks/usePersistedState.ts`.
- **Key naming:** `learning.<tool>.v1`. Bump the version suffix when the saved shape changes.
- **Restore safely.** Stored JSON is not trusted. Read it through a normaliser (see `normalizeDraft` in `features/conceptual-bridge/lib/draft.ts`) that keeps valid fields and uses defaults for anything else.
- **Wait before saving.** Do not save until the stored value has loaded. Otherwise the defaults overwrite the user's values on startup.
- **Reset** clears the form and the result, then saves the empty state.
- **Do not save** API keys (they belong in AI settings), in-progress request state, or error messages.
- **Live data is not saved.** Data that comes from elsewhere, such as completed roadmap items, loads when the screen is focused.

### 12.4 New tool checklist

1. One job, one primary button in the footer.
2. Every field has a plain label, and optional fields say so.
3. Placeholders, not pre-filled values.
4. Form and last result are saved under `learning.<tool>.v1`, and load before the first save.
5. Reset is in the header and clears the saved copy.
6. Empty state tells the user what to do next.

### 12.5 Current gaps

- **Webui** tools do not follow this section. It describes the Android app only.

### 12.6 Two-page generator (Idioms pattern)

Use this pattern when the result is short and reads best on its own, and the form has enough fields to need the full screen. Idioms, Word of the Day, and Sentence of the Day are the reference implementations. Use the inline tool layout (section 12.1) for everything else.

**Pages**

| Page | Route (example) | Shows | Header | Footer |
| --- | --- | --- | --- | --- |
| Result | `language-learner/<tool>/index.tsx` | Only the last result, or an `EmptyHint` when there is none | Title, no Reset | One primary button that opens the form ("New idiom") |
| Form | `language-learner/<tool>/new.tsx` | Context only (for example `ActiveLanguageNotice`) at the top of the body, then the fields | Title, `ResetButton` (clears the form only) | Error message, then the one primary button ("Generate an idiom") |

**Layout rules**

- The form fields go in the **body**, not the footer. The body scrolls, so the fields get the full screen. The footer stays short: the error and the button.
- Split the form into two exports: `<Tool>FormFields` (body) and `<Tool>FormFooter` (footer). Both take the same state object.
- The result page has no form and no Reset. The form page has no result.
- The loading label lives on the button. Fields are disabled while the request runs.

**Navigation**

- Open the form with `router.push`.
- After a successful generate, return with `router.back()`, not `router.replace`. This keeps one result page in the stack. A `replace` would leave two copies of it.
- Show the error on the form page. Do not navigate on failure.

**Storage**

- Save the form under its own key, for example `language-learner.<tool>.generate.v2`. Save the result under a second key, for example `language-learner.<tool>.lesson.v1`. Use `mergeSavedForm` to restore the form.
- Save the result **before** navigating back, and await it. Otherwise the result page can load an old value.
- The form and the result must never share a key. Otherwise the two screens overwrite each other's data.
- The result page reads its saved result with `useFocusEffect`, so it shows the new result each time it is focused.

**Checklist for a new two-page tool**

1. Decide the result is short and worth its own page. A long form with a long result is better kept on one page.
2. Write the storage keys and the `mergeSavedForm` defaults in `lib/persistence.ts`.
3. Write the form hook. It calls the generator, saves the result, then calls `onGenerated`.
4. Write `<Tool>FormFields` for the body and `<Tool>FormFooter` for the footer.
5. Create the form page: `ToolScreen`, `ResetButton`, notice, fields, footer.
6. Create the result page: `ToolScreen`, `EmptyHint` when empty, one footer button to the form.
7. Test the round trip: generate, the result page shows it, reopen the app, and the result is still there.

**Reference files (Idioms)**

- `src/app/language-learner/idioms/index.tsx`: result page
- `src/app/language-learner/idioms/new.tsx`: form page
- `src/features/idioms/components/IdiomsForm.tsx`: form hook, fields, footer
- `src/features/idioms/hooks/usePersistedDraft.ts`: `usePersistedForm` and `usePersistedLesson`
- `src/features/idioms/lib/persistence.ts`: storage keys and `mergeSavedForm`
- Word of the Day: `src/app/language-learner/word-of-the-day/index.tsx` and `new.tsx`, with `src/features/word-of-the-day/components/WordOfTheDayForm.tsx`
- Sentence of the Day: `src/app/language-learner/sentence-of-the-day/index.tsx` and `new.tsx`, with `src/features/sentence-of-the-day/components/SentenceOfTheDayForm.tsx`
- Topic of the Day (Learning hub): `src/app/learning/topic-of-the-day/index.tsx` and `new.tsx`, with `src/features/topic-of-the-day/components/TopicOfTheDayForm.tsx` and `TopicOfTheDayView.tsx`. Storage keys are `learning.topic-of-the-day.form.v1` and `.topic.v1`.
- Poet Engine: `src/app/language-learner/poet-engine/index.tsx` and `new.tsx`, with `src/features/poet-engine/components/PoetEngineForm.tsx` and `PoetEngineResultView.tsx`
- Language Lesson: `src/app/language-learner/lesson/index.tsx` and `new.tsx`, with `src/features/lesson/components/LessonForm.tsx` and `LessonResultView.tsx`. Storage in `src/features/lesson/lib/persistence.ts`, hooks in `hooks/usePersistedDraft.ts`.
- Observation Trainer: `src/app/practice/observation-trainer/index.tsx` (report) and `new.tsx` (form), with `src/features/observation-trainer/components/ObservationForm.tsx` and `ObservationResult.tsx`. Hooks are `hooks/useObservationForm.ts` and `hooks/usePersistedTraining.ts`. Its form (image search and picker) is long, so the form page holds the image and the fields, and the footer holds only the button.
- Message Refiner: `src/app/tools/message-refiner/index.tsx` (result) and `new.tsx` (form), with `src/features/message-refiner/components/MessageRefinerForm.tsx` and `MessageRefinerResultView.tsx`. Storage is in `lib/persistence.ts`, with the hook in `hooks/usePersistedDraft.ts`.
- RSS: the Viewer is `src/app/tools/rss/viewer.tsx` (filters in the body, Refresh in the footer, Reset in the header). The Manager is `src/app/tools/rss/manager/index.tsx` (list, with "Add feed" in the footer), with `new.tsx` and `edit.tsx` as the form pages. The form is `src/features/rss/components/manager/FeedForm.tsx`, with the hook in `hooks/useFeedForm.ts`.
- Brain Dump: `src/app/tools/brain-dump/index.tsx` (list, with "New note" in the footer), `new.tsx` (capture form), and `edit.tsx` (note editor, opened by id). Components are in `src/features/brain-dump/components/`, and storage is in `lib/storage.ts`.
- Reminders: `src/app/tools/reminders/index.tsx` (list, with "New reminder" in the footer) and `new.tsx` (form). The form is in `components/ReminderForm.tsx`. The add step writes through `lib/storage.ts`, and the list reloads on focus, so the two pages never hold separate copies of the list.
- MCQ Generator: `src/app/practice/testing-portal/mcq/index.tsx` (quiz, with "Generate more" in the footer and "Clear all" in the header) and `mcq/new.tsx` (form). The form is in `components/McqForm.tsx`, with hooks `hooks/useMcqSetup.ts` and `hooks/useMcqResult.ts`. Generate appends to the saved list, so "Generate more" keeps the questions already made. The quiz answers stay in memory and are not saved.
- Theoretical: `src/app/practice/testing-portal/theoretical/index.tsx` (questions, with "Generate more" in the footer and "Clear all" in the header, which asks for confirmation) and `theoretical/new.tsx` (form). The form is in `components/TheoreticalForm.tsx`, the questions in `components/TheoreticalResultView.tsx` and `TheoreticalQuestionCard.tsx`. Hooks are `hooks/useTheoreticalSetup.ts` and `useTheoreticalResult.ts`. The saved result keeps the context and difficulty, so each question can be graded and given a model answer later. Answers and grades stay in memory and are not saved.
- Expert answer: `src/app/practice/testing-portal/answer/index.tsx` (the question and answer, with "New answer" in the footer) and `answer/new.tsx` (form). The form is in `components/AnswerForm.tsx` and the answer in `components/AnswerResultView.tsx`. Hooks are `hooks/useAnswerSetup.ts` and `useAnswerResult.ts`. Generate replaces the saved answer. Response format has no Custom, because the type is fixed.
- Performance Grader: `src/app/practice/testing-portal/grader/index.tsx` (the grade, with "New grade" in the footer) and `grader/new.tsx` (form). `src/app/practice/grader/index.tsx`, the dashboard tile route, re-exports the result page. The form is in `components/GraderForm.tsx` and the grade in `components/GraderResultView.tsx`. Hooks are `hooks/useGraderSetup.ts` and `useGraderResult.ts`. The image is not saved, because it is large. Scenario is limited to 200 characters, the same as the generator.
- Solve an MCQ: `src/app/practice/testing-portal/solver/index.tsx` (the question, its options, and the model's pick, with "New question" in the footer) and `solver/new.tsx` (form). The form is in `components/SolverForm.tsx` and the solution in `components/SolverResultView.tsx`. Hooks are `hooks/useSolverSetup.ts` and `useSolverResult.ts`. The form keeps its original storage keys, so saved drafts still load. The model's option is marked with a border and the words "Model answer", not by colour alone.

### 12.7 Chat with a persona (Roleplay pattern)

Use this pattern for a multi-turn chat where the AI plays a character. The chat is the main job, and the persona is set up once on a separate page.

**Pages**

| Page | Route (example) | Body | Header | Footer |
| --- | --- | --- | --- | --- |
| Chat | `language-learner/roleplay/index.tsx` | Persona summary with "Edit persona", then the transcript | Title, `ResetButton label="Reset chat"` (clears the transcript and draft, keeps the persona) | Error, then the composer (message box, send button, voice) |
| Persona | `language-learner/roleplay/persona.tsx` | Saved personas, "Write with AI", then the persona fields | Title, `ResetButton label="Reset persona"` (clears the persona fields, keeps the transcript) | One button, "Use this persona", which returns to the chat |

**Rules**

- The two resets never touch each other's data. "Reset chat" keeps the persona, and "Reset persona" keeps the transcript. Each header button is labeled so the user can tell them apart.
- `ResetButton` shows text only when it is given a `label`. Other tools keep the icon-only button.
- The transcript scrolls in the body and jumps to the newest message (`useToolScroll`).
- The persona page saves each change as it is typed. Its footer button only returns, so nothing is lost if the user leaves early.
- The chat reads the persona again each time it is focused. It does not write the persona.
- A chat with no persona shows an empty hint and blocks sending with a message that says where to write one.
- Defaults for the persona and instruction fields are empty. Placeholders show examples.
- Roles management (`roles.tsx`) is a separate page for saving and editing personas by name. It also has "Write with AI".

The Socratic Challenger (`practice/socratic`) uses the same pattern. Its settings page is `practice/socratic/settings.tsx`, with focus and confidence as fixed choices (no Custom). Its "Reset chat" keeps the settings, and its settings page has "Reset settings".

Negotiation Practice (`practice/negotiation`) uses the chat pattern with a setup page, like the Riddle. The practice page shows the brief, report, and transcript in the body, and the reply box in the footer. While ending, the footer asks for the outcome instead. A finished session shows "New negotiation" in the footer. The setup page is `practice/negotiation/new.tsx`, with Difficulty (no Custom) and Domain. Its Reset clears the form only.

Executive EQ Trainer (`practice/executive-eq`) uses the chat pattern with a setup page (`practice/executive-eq/new.tsx`): role, narrative arc, learning focus, difficulty, and industry context. Learning focus and difficulty have no Custom, because validation enforces them. The practice page shows the scene, counterpart, briefing, and transcript in the body, and the reply box in the footer. Its header Reset clears the simulation only, and the setup page's Reset clears the form only.

Debate Engine (`practice/debate`) uses the chat pattern with a setup page (`practice/debate/new.tsx`): archetype, speech style, intensity, influences, topic, and custom constraints. The practice page body holds the status with "End & judge", a closed "Personas" dropdown (`components/DebatePersonas.tsx`), the transcript, a closed "Turn breakdown" dropdown, and the verdict. Inside the personas dropdown, Pro and Con sit side by side, and tapping a column shows that persona below, with Edit and Regenerate. Once judged, the verdict sits right under the status, above the personas. Each transcript entry shows a Pro or Con badge and the speaker's name. The transcript is a box with its own scroll that jumps to the newest entry. "End & judge" needs at least one statement and asks for confirmation, and the header "Reset debate" asks for confirmation too. Turns alternate: after each statement the side switches to the other one. Persona actions are disabled (not just ignored) while a request runs. The footer holds the turn form (`components/DebateTurnFooter.tsx`): side, mode, the AI options when generating, and the statement box. The AI options scroll inside a capped height. The statement box allows an empty message in AI mode (`AnswerComposer` `allowEmpty`), since the direction is optional. Once judged, the footer shows "New debate". The header Reset clears the debate only. The debate stores the form values it was built from, so Regenerate uses the same topic. A debate saved before this change has no stored values, so Regenerate asks for a new debate. Persona cards use neutral badges, not hub tones (section 2).

**Reference files (Roleplay)**

- `src/app/language-learner/roleplay/index.tsx`: chat page
- `src/app/language-learner/roleplay/persona.tsx`: persona page
- `src/features/roleplay/components/RoleplayChatView.tsx`: chat body and footer
- `src/features/roleplay/components/RoleplayPersonaForm.tsx`: persona body
- `src/features/roleplay/components/SystemPromptAssistant.tsx`: "Write with AI" block
- `src/features/roleplay/hooks/useRoleplayChat.ts`, `usePersona.ts`, `useSystemPromptAssistant.ts`
- `src/features/roleplay/lib/generators.ts`: `sendRoleplayTurn` and `generateSystemPrompt`

### 12.8 Guess-and-check game (Riddle pattern)

Use this pattern when the user works through one round at a time: the app gives a puzzle, the user answers, and the app gives feedback. The round stays on the page until it is solved. The setup form is a separate page, the same as 12.6 and 12.7.

**Pages**

| Page | Route (example) | Body | Header | Footer |
| --- | --- | --- | --- | --- |
| Game | `practice/riddle/index.tsx` | The round: puzzle, attempts, feedback, solution toggle. `EmptyHint` when there is no round | Title, no Reset | While the round is open: the answer box (`AnswerComposer`). Otherwise one primary button, "New riddle" |
| Setup | `practice/riddle/new.tsx` | The fields (topic, dropdowns) | Title, `ResetButton` (clears the form only) | Error, then "Generate riddle" |

**Rules**

- While the round is open, the answer box is the only footer action. A "Start a different riddle" outline button sits in the body, so the user can leave a round without solving it.
- The round is saved on the device after each attempt. The game page reloads it each time it is focused, so a round generated on the setup page appears when the user returns.
- Generating a new round replaces the old one. The setup page saves the round before `router.back()`.
- Attempts are coloured by icon and words, not by hub tones (section 2). A correct attempt uses the normal foreground colour with a check icon. A wrong one uses `destructive` with a cross icon.
- The newest attempt scrolls into view through `useToolScroll`.
- The game page resets its solution toggle and its last error when a new round loads.

The Joke Lab (`practice/joke-coach`) uses the same pattern. Its joke box is the footer answer box, and its setup page is `practice/joke-coach/new.tsx`. Storage is in `src/features/joke-coach/lib/persistence.ts`, with hooks `useJokeLabRound.ts` and `useJokeLabSetup.ts`. Joke style and improvement goal are fixed choices (no Custom).

The Guess Game (`practice/guess-game`) uses the same pattern. Its guess box is the footer answer box, and its setup page is `practice/guess-game/new.tsx`. Storage is in `src/features/guess-game/lib/persistence.ts`, with hooks `useGuessGameRound.ts` and `useGuessGameSetup.ts`. Difficulty has no Custom, because the guess limit comes from it. Hints and coaching are body actions, so the footer holds only the guess box.

The Interview Simulator (`practice/interview`) is a multi-step session, so it follows this pattern with a stage-based footer. Its setup page is `practice/interview/new.tsx` (fields in the body, error and "Start interview" in the footer). The session page `practice/interview/index.tsx` shows the current stage in the body, with its secondary actions (Edit, Regenerate, Undo, End interview). The stages are: decision (Proceed), answer (the question, with its wording editable and Regenerate in the body, and the answer box in the footer), review (Track progress), and progress (Next question). The grading criteria, red flags, and sample answers are sent to the reviewer but are shown to the user only after the review, so the practice answer is not given away. The footer reads its edit buffers from `hooks/useInterviewScreen.ts`, so the body and footer stay in sync. The session reloads on focus, and the setup form and the session use separate keys (`practice.interview.setup.v1` and `practice.interview.session.v1`). Interview type and seniority have no Custom, because validation enforces them. Round allows Custom.

The Foresight Trainer (`practice/foresight-trainer`) follows the same pattern. Its setup page is `practice/foresight-trainer/new.tsx` (context, theme, difficulty, and max scenes in the body; error and "Start scenario" in the footer). The scenario page `practice/foresight-trainer/index.tsx` shows the transcript and the current options in the body, with the option choice made in the body. The footer holds the reasoning box, whose submit is "Commit". Difficulty has no Custom, because validation enforces it. The header Reset clears the scenario only, and the setup page's Reset clears the form only. Storage is in `src/features/foresight-trainer/lib/persistence.ts`, with hooks `useForesightSetup.ts` and `useForesightRun.ts`.

The Clarity Trainer (`practice/clarity-trainer`) follows the same pattern. Its setup page is `practice/clarity-trainer/new.tsx` (difficulty, scenario category, and context in the body; error and "Generate scenario" in the footer). The practice page shows the scenario and prompt in the body, with the reply box in the footer. After the review, the footer shows "New scenario" and the body shows the analysis, coach feedback, tightened rewrite, and gold standard. Difficulty and category have no Custom, because validation enforces them. The header has no Reset; the setup page's Reset clears the form only. Storage is in `src/features/clarity-trainer/lib/persistence.ts`, with hooks `useClaritySetup.ts` and `useClarityRound.ts`.

The Battleground Simulator (`practice/battleground`) follows this pattern. Its setup page is `practice/battleground/new.tsx` (callsign, expertise, style, and background are optional; topic is required; difficulty has no Custom). The battle page body shows the health meters, the mission, the current challenge, a closed "Reference material" dropdown, and the round adjudication (open by default). The footer is the move box ("Commit"), and it clears only after the round resolves. Once the mission ends, the footer shows "New battle". The header Reset clears the battle only, and the setup page's Reset clears the form only. Storage is in `src/features/battleground/lib/persistence.ts`, with hooks `useBattleSetup.ts` and `useBattleSession.ts`.

**Reference files (Riddle)**

- `src/app/practice/riddle/index.tsx`: game page
- `src/app/practice/riddle/new.tsx`: setup page
- `src/features/riddle/components/RiddleForm.tsx`: setup fields and footer
- `src/features/riddle/components/RiddleRoundView.tsx`: round body
- `src/features/riddle/hooks/useRiddleRound.ts`: round state, attempts, focus reload
- `src/features/riddle/hooks/useRiddleSetup.ts`: setup form and generate
- `src/features/riddle/lib/persistence.ts`: storage keys
- Puzzle Generator follows the same pattern: `src/app/practice/puzzle/index.tsx` (game), `new.tsx` (setup), `src/features/puzzle/components/PuzzleForm.tsx`, `PuzzleRoundView.tsx`, `src/features/puzzle/hooks/usePuzzleRound.ts`, `usePuzzleSetup.ts`

### 12.9 Revise a generated item (revision tree)

Use this pattern when the user wants to change one generated item and keep the original to compare against. Revisions can be revised again, so the result is a tree. The Social Media Post Generator is the reference. This pattern extends 12.6: the result page shows the whole tree, not only the last result.

**Pages**

| Page | Route (example) | Body | Header | Footer |
| --- | --- | --- | --- | --- |
| Result | `tools/social-posts/index.tsx` | The tree. Each item is followed by its revisions, indented under it. Each card has an "Edit" button. `EmptyHint` when there is no result | Title, no Reset | One primary button, "New posts" |
| Revise | `tools/social-posts/edit.tsx` | The item being revised (read-only), then "Changes you want" | Title, no Reset | Error, then one primary button, "Create revision" |

**Rules**

- A revision appears directly below the item it came from, never at the end of the list.
- Any item can be revised, including a revision. Each revision stores `parentId` and a `label` such as "Variant 2 · Revision 1".
- Originals are never overwritten. Each revision is a new item.
- Each item keeps the context it was made with (for example platform and topic), saved with the result. Revisions use that saved context, not the current form.
- "Changes you want" is required. An empty field shows a plain message above the button.
- Each revision is saved before `router.back()`. The revise page reads the latest saved result at submit time, not the component state, so nothing is lost if two revisions are made in a row.
- The result page reloads on focus.
- The indent stops growing after three levels, so deep trees stay readable on a phone.
- "New posts" generates a new result and replaces the whole tree, as in 12.8. The form page has no effect on revisions.
- Stored items are read through a normaliser. An item whose parent is missing is shown at the top level, not dropped.

**Reference files (Social Media Post Generator)**

- `src/app/tools/social-posts/index.tsx`: result page (tree)
- `src/app/tools/social-posts/edit.tsx`: revise page
- `src/app/tools/social-posts/new.tsx`: form page
- `src/features/social-posts/components/SocialPostsResult.tsx`: tree and cards
- `src/features/social-posts/components/SocialPostsRevise.tsx`: revise hook, fields, footer
- `src/features/social-posts/lib/normalize.ts`: model output and stored-result normaliser
- `src/features/social-posts/lib/generators.ts`: `generateSocialPosts` and `reviseSocialPost`

### 12.10 Keep liked items and generate more (select and extend)

Use this pattern when the user picks the items they like from a generated list and asks for more in the same spirit. Each new round can be picked and extended again, so the result is a list of batches. Creative Assets is the reference. It extends 12.6 and 12.9: the result page shows all batches, and the extend step has its own page.

**Pages**

| Page | Route (example) | Body | Header | Footer |
| --- | --- | --- | --- | --- |
| Result | `tools/creative-assets/index.tsx` | Batches in order, each with a label. Each item has a checkbox. `EmptyHint` when there is no result | Title, no Reset | One primary button, "More like these (n)", disabled when nothing is ticked. One outline button, "New assets" |
| More | `tools/creative-assets/more.tsx` | The ticked items (read-only), then "User instructions (optional)" | Title, no Reset | Error, then one primary button, "Generate more" |
| New | `tools/creative-assets/new.tsx` | The fields (see 12.6) | Title, `ResetButton` (clears the form only) | Error, then "Generate assets" |

**Rules**

- A tick is a choice the user keeps. It is saved with the result after each change, so it survives leaving the app.
- Items from a new round start ticked. The user unticks what they don't want, then extends again.
- "More like these" uses every ticked item from every batch. Duplicate texts are sent once.
- Each new round is added as a new batch at the end, labelled with its number and how many ticked items it was made from.
- When a new round is generated, every unticked item is removed from the list, and batches left empty are removed too. Ticked items stay. This keeps the list from growing without limit.
- The result keeps the form values it was made with. A round uses those values, not the current form.
- "Generate more" needs at least one ticked item and says so on the page. The user instructions are optional and limited to 1000 characters.
- Each round is saved before `router.back()`. The more page reads the latest saved result at submit time, not the component state.
- "New assets" replaces the whole result, including every batch, as in 12.8.

**Reference files (Creative Assets)**

- `src/app/tools/creative-assets/index.tsx`: result page (batches and ticks)
- `src/app/tools/creative-assets/more.tsx`: more page
- `src/app/tools/creative-assets/new.tsx`: form page
- `src/features/creative-assets/components/CreativeAssetsList.tsx`: batches and ticks
- `src/features/creative-assets/components/CreativeAssetsMore.tsx`: more page hook, fields, footer
- `src/features/creative-assets/lib/batches.ts`: batch and tick helpers
- `src/components/tool/CheckboxRow.tsx`: shared tick row
