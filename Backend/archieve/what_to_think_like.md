# 🕵️ DSPy Module: **ScenarioForge** — Making Every Subject Feel Epic

Here's a complete DSPy module that takes any subject or task and generates a **high-stakes, immersive scenario** that transforms ordinary learning into a dramatic mission.

---

## 🏗️ The Module

```python
import dspy
from typing import Optional, List, Literal
from pydantic import BaseModel


# ─────────────────────────────────────────────
# 1. OUTPUT SCHEMA — Structured Scenario Data
# ─────────────────────────────────────────────

class ScenarioPersona(BaseModel):
    """The character the student becomes."""
    role_title: str          # e.g. "Secret Codebreaker"
    role_description: str    # e.g. "An elite cryptanalyst working in a underground bunker..."
    motivation: str          # Why this character cares — the emotional hook

class ScenarioWorld(BaseModel):
    """The world/setting the scenario takes place in."""
    setting: str             # e.g. "A dimly lit war-room during a global crisis"
    stakes: str              # What happens if they fail — the tension
    atmosphere: str          # Mood/tone description

class ScenarioMission(BaseModel):
    """How the subject maps to the scenario."""
    mission_briefing: str    # The main quest framed dramatically
    subject_connection: str  # How the actual subject ties into the mission
    challenge Framing: str    # How a typical task/problem is described in-world

class ScenarioOutput(BaseModel):
    """Complete scenario package."""
    persona: ScenarioPersona
    world: ScenarioWorld
    mission: ScenarioMission
    example_one_liner: str   # A punchy tagline to open the lesson
    # e.g. "Agent, the enemy's cipher changes in 60 seconds. Crack it — or the city falls."


# ─────────────────────────────────────────────
# 2. DSPy SIGNATURE — The Core Engine
# ─────────────────────────────────────────────

class ScenarioForge(dspy.Signature):
    """
    You are the SCENARIO FORGE — a classified creative engine used by elite
    educators worldwide. Your job is to take any ordinary school subject or
    learning task and transform it into a CINEMATIC, HIGH-STAKES scenario.

    RULES YOU MUST FOLLOW:
    1. The scenario must make the student feel like the MAIN CHARACTER in a
       thriller, adventure, or mission.
    2. The subject matter must be CENTRAL to the scenario — not decoration.
       The actual skills (solving equations, reading texts, running laps) must
       BE the actions the character performs in the story.
    3. Stakes must feel REAL and URGENT — failure has dramatic consequences.
    4. The tone should be dramatic but AGE-APPROPRIATE for the given level.
    5. Every scenario must be UNIQUE — never reuse the same framing twice.
    6. The scenario must be PRACTICAL — a teacher should be able to use it
       directly in a classroom without extra explanation.
    """

    # ── INPUTS ──────────────────────────────
    subject: str = dspy.InputField(
        description="The school subject or learning domain (e.g., 'Mathematics', 'History', 'Physical Education')."
    )
    specific_topic: Optional[str] = dspy.InputField(
        default=None,
        description="Optional: The specific topic or skill within the subject (e.g., 'Algebraic equations', 'World War II', 'Endurance running')."
    )
    student_age_group: str = dspy.InputField(
        default="high school",
        description="Age group of the students: 'elementary', 'middle school', 'high school', or 'university'."
    )
    intensity_level: Literal["mild", "moderate", "extreme"] = dspy.InputField(
        default="moderate",
        description="How dramatic and intense the scenario should be."
    )
    genre_preference: Optional[str] = dspy.InputField(
        default=None,
        description="Optional genre hint: 'spy thriller', 'fantasy', 'sci-fi', 'horror', 'survival', 'heist', 'mythology', etc."
    )

    # ── OUTPUTS ─────────────────────────────
    persona_role_title: str = dspy.OutputField(
        description="The dramatic title of the role the student takes on (e.g., 'The Cipher Breaker', 'Arena Champion')."
    )
    persona_description: str = dspy.OutputField(
        description="2-3 sentences describing who this character is, their background, and why they're the only one who can do this."
    )
    persona_motivation: str = dspy.OutputField(
        description="The deep emotional drive — what personally matters to this character."
    )
    world_setting: str = dspy.OutputField(
        description="Where this takes place — a vivid, specific location (not generic)."
    )
    world_stakes: str = dspy.OutputField(
        description="What happens if the mission fails — the dramatic consequence."
    )
    world_atmosphere: str = dspy.OutputField(
        description="The mood and sensory details — what it feels, sounds, looks like."
    )
    mission_briefing: str = dspy.OutputField(
        description="The main quest written as a dramatic briefing the student receives."
    )
    subject_connection: str = dspy.OutputField(
        description="Clear explanation of how the actual subject/skill IS the mission action."
    )
    challenge_framing: str = dspy.OutputField(
        description="How a typical problem or task in this subject would be described in-world."
    )
    example_one_liner: str = dspy.OutputField(
        description="A single punchy, cinematic tagline a teacher could open the lesson with."
    )


# ─────────────────────────────────────────────
# 3. EXECUTION FUNCTION
# ─────────────────────────────────────────────

def forge_scenario(
    model_name: str,
    api_key: str,
    api_base: str,
    subject: str,
    specific_topic: Optional[str] = None,
    student_age_group: str = "high school",
    intensity_level: str = "moderate",
    genre_preference: Optional[str] = None,
) -> dict:
    """
    Generate an immersive, high-stakes scenario for any subject.
    Returns a structured dictionary with persona, world, and mission details.
    """

    with dspy.context(lm=dspy.LM(
        model=f'openai/{model_name}',
        api_key=api_key,
        api_base=api_base,
        temperature=0.85,  # Higher temp = more creative scenarios
        stop=None,
        cache=False
    )):
        # Use ChainOfThought for richer creative output
        forger = dspy.ChainOfThought(ScenarioForge)

        response = forger(
            subject=subject,
            specific_topic=specific_topic or "general",
            student_age_group=student_age_group,
            intensity_level=intensity_level,
            genre_preference=genre_preference or "any"
        )

        # ── Pack into clean structured output ──
        result = {
            "persona": {
                "role_title": response.persona_role_title,
                "role_description": response.persona_description,
                "motivation": response.persona_motivation,
            },
            "world": {
                "setting": response.world_setting,
                "stakes": response.world_stakes,
                "atmosphere": response.world_atmosphere,
            },
            "mission": {
                "mission_briefing": response.mission_briefing,
                "subject_connection": response.subject_connection,
                "challenge_framing": response.challenge_framing,
            },
            "tagline": response.example_one_liner,
        }

        return result


# ─────────────────────────────────────────────
# 4. BATCH FORGER — Generate for multiple subjects
# ─────────────────────────────────────────────

def forge_batch(
    model_name: str,
    api_key: str,
    api_base: str,
    subjects: List[dict],
    intensity_level: str = "moderate",
) -> List[dict]:
    """
    Generate scenarios for a list of subjects at once.

    Each item in `subjects` should be a dict with keys:
      - "subject" (required)
      - "specific_topic" (optional)
      - "genre_preference" (optional)
    """
    results = []
    for entry in subjects:
        scenario = forge_scenario(
            model_name=model_name,
            api_key=api_key,
            api_base=api_base,
            subject=entry["subject"],
            specific_topic=entry.get("specific_topic"),
            genre_preference=entry.get("genre_preference"),
            intensity_level=intensity_level,
        )
        results.append(scenario)
    return results


# ─────────────────────────────────────────────
# 5. PRETTY PRINTER
# ─────────────────────────────────────────────

def print_scenario(scenario: dict, subject_name: str = ""):
    """Pretty-print a generated scenario."""
    header = f"🎬 SCENARIO: {subject_name}" if subject_name else "🎬 GENERATED SCENARIO"
    print(f"\n{'='*60}")
    print(f"  {header}")
    print(f"{'='*60}")

    p = scenario["persona"]
    print(f"\n🕶️  PERSONA: {p['role_title']}")
    print(f"   {p['role_description']}")
    print(f"   💡 Motivation: {p['motivation']}")

    w = scenario["world"]
    print(f"\n🌍 WORLD:")
    print(f"   📍 Setting: {w['setting']}")
    print(f"   ⚠️  Stakes: {w['stakes']}")
    print(f"   🌫️  Atmosphere: {w['atmosphere']}")

    m = scenario["mission"]
    print(f"\n🎯 MISSION:")
    print(f"   📋 Briefing: {m['mission_briefing']}")
    print(f"   🔗 Subject Link: {m['subject_connection']}")
    print(f"   🧩 Challenge: {m['challenge_framing']}")

    print(f"\n💬 TAGLINE: \"{scenario['tagline']}\"")
    print(f"{'='*60}\n")


# ─────────────────────────────────────────────
# 6. USAGE EXAMPLE
# ─────────────────────────────────────────────

if __name__ == "__main__":

    config = {
        "model_name": "gpt-4-turbo",
        "api_key": "your-key-here",
        "api_base": "http://localhost:4567/v1",
    }

    # ── Single Subject ──
    result = forge_scenario(
        **config,
        subject="Mathematics",
        specific_topic="Quadratic equations",
        student_age_group="high school",
        intensity_level="extreme",
        genre_preference="spy thriller",
    )
    print_scenario(result, subject_name="Mathematics — Quadratic Equations")

    # ── Batch Mode ──
    subjects_batch = [
        {"subject": "Languages", "genre_preference": "spy thriller"},
        {"subject": "History", "specific_topic": "Ancient Rome", "genre_preference": "detective noir"},
        {"subject": "Science", "specific_topic": "Chemistry — periodic table", "genre_preference": "mad scientist"},
        {"subject": "Physical Education", "genre_preference": "survival"},
    ]

    all_scenarios = forge_batch(**config, subjects=subjects_batch, intensity_level="extreme")
    for scenario, entry in zip(all_scenarios, subjects_batch):
        print_scenario(scenario, subject_name=entry["subject"])
```

---

## 📊 How It Maps — Input → Output Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      INPUTS TO SCENARIOFORGE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   subject: "Mathematics"                                        │
│   specific_topic: "Quadratic equations"                         │
│   student_age_group: "high school"                              │
│   intensity_level: "extreme"                                    │
│   genre_preference: "spy thriller"                              │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                     ┌───────▼────────┐
                     │  SCENARIOFORGE │
                     │  (ChainOfThought)│
                     └───────┬────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      STRUCTURED OUTPUT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   🕶️ PERSONA                                                    │
│   ├── role_title: "The Equation Phantom"                        │
│   ├── role_description: "A rogue mathematician who..."          │
│   └── motivation: "Your mentor was silenced solving this..."    │
│                                                                 │
│   🌍 WORLD                                                      │
│   ├── setting: "An abandoned NSA bunker beneath Denver..."      │
│   ├── stakes: "The trajectory algorithm launches in 30 min..."  │
│   └── atmosphere: "Flickering monitors, humming servers..."     │
│                                                                 │
│   🎯 MISSION                                                    │
│   ├── mission_briefing: "Decode the parabolic trajectory..."    │
│   ├── subject_connection: "Each quadratic you solve reveals..." │
│   └── challenge_framing: "Enemy cipher #7: ax² + bx + c = 0"  │
│                                                                 │
│   💬 TAGLINE                                                    │
│   └── "The missile follows a curve. So does your survival."     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔥 Example Outputs (What It Generates)

### 🧪 **SCIENCE — Chemistry**
```
🕶️  PERSONA: The Elemental Alchemist
   You are Dr. Vex, the last remaining chemist in a world where
   the Periodic Table has been weaponized. Each element holds a
   power — and you're the only one who understands the bonds.
   💡 Motivation: Your city's water supply was poisoned with an
   unknown compound. Only you can identify it before it's too late.

🌍 WORLD:
   📍 Setting: A crumbling underground lab, shelves of glowing
      reagents, air thick with the smell of sulfur
   ⚠️  Stakes: One wrong mixture and the lab — and you — go up
   🌫️  Atmosphere: Bubbling flasks, hissing valves, green light
      reflecting off wet concrete walls

🎯 MISSION:
   📋 Briefing: "Identify the unknown substance by its elemental
      composition. The reactor core is destabilizing."
   🔗 Subject Link: Each element you classify brings you closer
      to neutralizing the threat
   🧩 Challenge: "Sample #47 — silver-white metal, reacts with
      acid to produce hydrogen. What element are you dealing with?"

💬 TAGLINE: "Every element has a secret. Tonight, you crack them all."
```

### 🏃 **PHYSICAL EDUCATION**
```
🕶️  PERSONA: The Last Runner — Sector 7 Escapee
   You are Runner-7, the only operative who made it out of the
   collapsed facility. The exits are sealed. The only way out
   is THROUGH — mile after mile of hostile terrain.
   💡 Motivation: Your team is trapped behind you. If you stop,
   they don't make it.

🌍 WORLD:
   📍 Setting: An endless industrial wasteland — collapsed
      overpasses, flooded tunnels, searchlights sweeping
   ⚠️  Stakes: The hunters are 4 minutes behind you. They're
      faster. But they don't have your endurance.
   🌫️  Atmosphere: Heavy breathing, distant sirens, rain on
      broken glass

🎯 MISSION:
   📋 Briefing: "Cross the 5km exclusion zone. Dodge the
      patrol drones. Reach the extraction point before dawn."
   🔗 Subject Link: Every lap, sprint, and agility drill IS
      your escape route
   🧩 Challenge: "Drone sweep in 20 seconds — drop, roll,
      sprint through the gap. GO."

💬 TAGLINE: "They built the walls to keep you in. They didn't
   know you'd outrun them."
```

---

## ⚙️ Key Design Decisions

| Decision | Why |
|---|---|
| **`ChainOfThought`** instead of `Predict` | Creative generation benefits from step-by-step reasoning — the model plans the persona before writing it |
| **`temperature=0.85`** | Higher creativity = more unique, dramatic scenarios. Lower would produce repetitive results |
| **`genre_preference` input** | Lets teachers steer the vibe — spy, fantasy, horror, heist — without rebuilding the module |
| **`intensity_level` control** | A teacher working with 8-year-olds picks "mild"; a high school teacher picks "extreme" |
| **Flat output fields** (not nested JSON) | DSPy handles flat string fields more reliably than complex nested objects |
| **`example_one_liner` output** | Gives teachers a ready-made hook to open class — immediately usable |

---

## 🔗 Chaining It Further

You can chain **ScenarioForge** into other DSPy modules:

```
ScenarioForge → SlideListCreator → SlideWriter → SlideRewriter
     │                │                  │              │
     │                │                  │              └── Polish
     │                │                  └── Write slides
     │                └── Plan the lesson deck
     └── Generate the scenario
```

```python
# Example: Scenario → Slide Deck
scenario = forge_scenario(**config, subject="History", ...)

slide_plan = create_slide_list(
    topic=scenario["persona"]["role_title"],
    content=scenario["mission"]["mission_briefing"],
)
```

This turns any subject into an **unforgettable, cinematic learning experience** — all driven by a single DSPy module. 🎬