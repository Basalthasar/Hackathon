# Drone logistics starter examples

Two runnable pages that show the domain rules in the skill, not just describe
them. Use them as the starting point for a website or app, then replace the
fictional data and the demo controls.

| File | Surface | What it demonstrates |
|---|---|---|
| `consumer.html` | Consumer app | Honest ETA window, route timeline, map with a text alternative, handover code, stale feed, failed-state copy |
| `ops.html` | Flight operations | Live map, risk rail, mission table, telemetry with freshness, exception ownership, fleet state, weather go/no-go, two-step safety action |
| `drone.css` | Both | Mobile-first layout and domain components, all values from the kit theme |
| `demo.js` | Both | Theme toggle, state changes, filtering, acknowledgement, confirmation panels |
| `demo-data.json` | Both | Consistent seed data for six missions, four aircraft, three orders, two exceptions, weather and one telemetry sample |

Both pages load the shared theme, shell and icon sprite from the kit:

```
../../../../examples/brandkit-demo/theme.css
../../../../examples/templates/shell.css
../../../../examples/component-states/icons.js
```

That path is correct inside this repository. In a product, copy the theme and
replace those links with your own token build. Do not copy the values into the
page.

## Run them

Open the files directly, or serve the repository root:

```bash
python3 -m http.server 8000
```

Then open `/ux-ui-agent-skills/.claude/skills/drone-logistics/examples/consumer.html`
and `.../ops.html`. No build step, no dependency, no network.

## What is simulated

Everything. There is no live drone feed and no backend. The pages label the data
as demo data. The consumer demo controls let you simulate a stale feed and a
completed delivery. The operations page lets you select a mission, filter the
table, acknowledge a risk, and open the hold and return confirmations without
sending a command.

Do not remove those labels and present simulated telemetry as live. That is the
one deception this domain cannot afford.

## How to extend into a product

1. Replace `dem-` data with typed contracts from the skill's implementation
   section: `Mission`, `TelemetrySample`, `DeliveryOrder`.
2. Keep the state model. Add screens by deriving labels from the same IDs, not
   by adding booleans beside them.
3. Move the theme into one CSS-variable layer generated from `${CLAUDE_SKILL_DIR}/../../../tokens/*.json`.
4. Add the real-time transport. Keep `observedAt`, `receivedAt` and the freshness
   band. Detect sequence gaps and render them.
5. Add the failure branches the examples imply: lost link, hub offline, recipient
   absent, payment failure, authorization expiry.
6. Replace the demo controls with a test harness that can drive every state.
7. Run the gates before calling it done:

```bash
node ${CLAUDE_SKILL_DIR}/../../../scripts/accuracy_report.mjs
node ${CLAUDE_SKILL_DIR}/../../../scripts/axe_audit.mjs consumer.html
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_states.mjs ops.html --dark
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_keyboard.mjs ops.html
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_target_size.mjs consumer.html
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_mobile_first.mjs consumer.html
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_overflow.mjs consumer.html
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_reduced_motion.mjs consumer.html
node ${CLAUDE_SKILL_DIR}/../../../scripts/slop_tells.mjs --strict consumer.html
node ${CLAUDE_SKILL_DIR}/../../../scripts/taste_audit.mjs --strict consumer.html
```

`${CLAUDE_SKILL_DIR}` resolves to this skill's folder while a skill is running.
From a normal shell, use the repository path directly.

## Design decisions worth keeping

- The consumer page never shows raw telemetry. It shows a state, a window, a
  route and one action.
- The operations page puts the risk rail before the map. A map alone does not
  tell an operator what needs a human first.
- Stale data changes the label, the colour and the map treatment. It is not a
  toast that disappears.
- `Return to home` is danger, not primary. It opens a consequence statement and
  a second action. The same is true for hold.
- Every exception row has an owner, a reason, an age and a next action.
- The map has a text summary and a table or list equivalent. The page works
  without seeing the map.
- The demo is labelled as a demo on the page, not only in this README.
