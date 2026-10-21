---
name: drone-logistics
description: Design and build UX/UI for a drone logistics company that moves goods from supermarkets, delivery services and logistics hubs to individual consumers. Use for a consumer drone delivery app, a merchant or hub dispatch console, a fleet mission-control and live-surveillance screen, airspace and weather planning, exception and incident handling, handover, cold-chain and payload UX, or any request mentioning Drohne, Drohnenlieferung, Lieferdrohne, Drohnenmanagement, drone delivery, drone fleet, mission control, U-space, BVLOS, vertiport or last-mile drone logistics. Covers the domain model, actors, three product surfaces, critical journeys, state machines, signature components, maps and telemetry, safety and compliance constraints, copy, implementation contracts, and the domain gate checklist.
---

# Skill: Drone logistics UX

> **Step 0 - is the kit here?** This skill reads files from the kit. Check once:
> `ls ${CLAUDE_SKILL_DIR}/../../../tokens >/dev/null 2>&1 && echo KIT_OK || echo KIT_MISSING`
> On `KIT_MISSING` only the skill folders were installed, which is what
> `npx skills add` does. Say so plainly, point the user at
> `npx ux-ui-agent-skills init` or the plugin install, and stop. Do not guess the
> contents of a file you could not open.

This is the domain layer over the kit, not a second design system. Load
`design-doctrine` for the hard rules, then the runnable skill that matches the
work: `design-screen` for a page or flow, `data-dashboard` for mission control,
`design-component` for one component, `a11y-audit` for accessibility,
`ux-writing` for copy, `prototype` for the first wireflow. Everything below is
what those skills do not know about this business.

## 1. Product frame

One platform, three altitudes of the same truth:

| Surface | Who | Job | The one thing that leads |
|---|---|---|---|
| **Consumer app** | Individual recipient | Order from a local store, choose a window, follow the delivery, receive the parcel | Current delivery state and the next action |
| **Merchant / hub console** | Store manager, picker, dispatcher | Keep shelves, orders, packing, departures and handovers moving | The next departure at risk |
| **Flight operations** | Remote pilot, fleet supervisor, safety officer | Plan, authorize, monitor and recover missions | The highest-severity live risk |

Shared services behind all three: identity and consent, catalogue and inventory,
order and payment, routing and scheduling, telemetry ingestion, airspace and
weather, notifications, support, audit.

**The cross-surface contract.** One mission state ID drives every surface. The
consumer sees a collapsed, human label. The hub sees the handoff state. Flight
ops sees the full vehicle and airspace state. If two surfaces disagree about
whether a parcel is airborne, one of them is lying. Derive labels from one state
machine; never maintain three status vocabularies by hand.

Business shapes to design for: direct-to-consumer, white-label for a supermarket
or delivery brand, and logistics-as-a-service for hubs. White-label changes the
semantic theme and the logo, never the component structure or the state model.

### Runnable starting point

Two gate-checked pages demonstrate the rules below instead of only describing
them. Start from these rather than from a blank file:

| File | Use it for |
|---|---|
| `${CLAUDE_SKILL_DIR}/examples/consumer.html` | Consumer tracking and handover: ETA window, route timeline, map text alternative, stale feed, failed handover |
| `${CLAUDE_SKILL_DIR}/examples/ops.html` | Mission control: live map, risk rail, mission table, telemetry freshness, exception ownership, fleet and weather, two-step safety action |
| `${CLAUDE_SKILL_DIR}/examples/drone.css` | Domain components and mobile-first layout, all values from the kit theme |
| `${CLAUDE_SKILL_DIR}/examples/demo.js` | Theme toggle, state changes, filtering, acknowledgement, confirmation panels |
| `${CLAUDE_SKILL_DIR}/examples/demo-data.json` | Seed data whose battery, mass, wind and timing are internally consistent |
| `${CLAUDE_SKILL_DIR}/examples/README.md` | How to extend the pages into a product and how to run the gates |

The examples are deliberately labelled as demo data. Keep that label. Do not
turn a simulated feed into a live one by deleting the disclosure.

## 2. Actors and jobs

| Actor | Context | Job to be done | What breaks them |
|---|---|---|---|
| Consumer | Phone, outdoors, one hand, poor signal | Know where the parcel is and how to receive it | Vague ETA, no fallback, surprise fees, unclear handover |
| Store manager | Back office, interruptions every minute | Promise only what the hub can fly | Oversold slots, stock mismatch, silent cancellations |
| Picker / packer | Aisle and packing bench, gloves | Build the right tote, cold chain intact, on time | Tiny targets, unclear substitutions, no staging location |
| Hub dispatcher | Two screens, shift handover | Launch the right mission with the right payload | Hidden conflicts, stale fleet state, no reason codes |
| Remote pilot | Mission control, headset, high consequence | Keep the aircraft inside its envelope | Alarm floods, ambiguous authority, map without terrain or link state |
| Safety / compliance officer | Office, audit deadline | Prove authorization, occurrence handling, airworthiness | Missing evidence, mutable logs, unexplained overrides |
| Maintenance technician | Hangar, tablet | Clear or ground an aircraft with evidence | Vague defect reports, no parts or battery history |
| Support agent | Queue, angry customer | Resolve a failed delivery without guessing | No single timeline, no compensation authority, PII scattered |
| Partner logistics manager | Own console, SLA review | See volume, punctuality, cost and incidents | Different numbers from their own system |
| Auditor / regulator | Read-only, evidence mode | Reconstruct who decided what, when, and why | Screens that only show the current state |

Design for the stressed version of each actor, not the demo version.

## 3. Ubiquitous language

Use one term per concept in code, specs and UI. The right-hand column says where
the term is allowed to appear.

| Term | Meaning | Exposure |
|---|---|---|
| **Hub** | Small warehouse or store roof station where payloads are staged and aircraft launch | All surfaces |
| **Vertiport** | Prepared landing and takeoff site, possibly shared | Ops and partner surfaces |
| **Aircraft / UAS** | The vehicle. Consumer copy may say "drone"; ops copy says "aircraft" | Ops uses aircraft; consumer may use drone |
| **Mission** | One planned flight with a vehicle, route, payload and authorization | Ops and hub; consumer sees "delivery" |
| **Leg** | One segment between waypoints | Ops and support |
| **Corridor** | Pre-cleared volume of airspace for a route | Ops and airspace views |
| **Geofence** | Volume the aircraft must stay inside; a breach is an incident | Ops; consumer only if it changes their delivery |
| **Alternate landing site** | Pre-validated place to land when the primary is unavailable | Ops, pilot, support |
| **Payload** | Goods carried, including packaging and cold-chain mass | Hub and ops; consumer sees "order" |
| **Tote** | Reusable container packed at the hub | Hub and ops |
| **Cold chain** | Temperature-controlled segment with a maximum excursion | Hub, ops, consumer when relevant |
| **Telemetry** | Position, altitude, heading, speed, battery, link quality and timestamps | Ops and support; consumer gets a derived position, never raw telemetry |
| **Stale** | Data older than its freshness budget; the UI must say so | Every live surface |
| **RTH** | Return to home, an automatic or commanded recovery | Ops and pilot |
| **Link loss** | Command and control link degraded or lost | Ops and pilot |
| **Handover** | Transfer of the parcel to the recipient or a secure locker | Consumer, hub, support |
| **Slot** | Promised delivery window with a confidence level | Consumer and merchant |
| **Exception** | A deviation that needs a decision: weather, airspace, mechanical, payload, recipient, hub | Hub and ops |
| **Incident / occurrence** | A safety-relevant event that must be recorded and reviewed | Ops, safety, auditor |
| **Authorization** | Permission to fly a mission in a volume and time | Ops and safety |
| **SORA** | Specific Operations Risk Assessment method | Safety and compliance only |
| **BVLOS** | Beyond visual line of sight | Ops, safety and regulator only |
| **Remote ID** | Broadcast identity required by the applicable regime | Ops and compliance |
| **U-space** | Digital airspace services and procedures | Ops and airspace views |
| **Airworthiness** | Vehicle is legally and technically fit to fly | Ops and maintenance |

Never put `BVLOS`, `SORA`, `U-space` or `Remote ID` in consumer copy. Use "flight
approval", "airspace clearance" or "delivery window" instead.

## 4. Domain non-negotiables

These sit on top of the house rules. They decide correctness in this domain.

1. **Truth over polish.** Every live value carries `observed_at` and a freshness
   label. A stale position is shown as stale, never smoothed into a confident
   dot. No telemetry, no "live".
2. **The safe action is the primary action.** "Abort mission", "Return to home"
   and "Emergency land" are separate actions with separate consequences. None of
   them is the default primary button. Irreversible actions require a second
   step, a reason, and an audit entry.
3. **Automation proposes, a human disposes** for any safety-relevant decision.
   If the system reroutes, grounds or cancels, show what changed, why, and who
   can override it. Log the override.
4. **One state machine, many labels.** Status IDs are stable; labels are derived
   per surface and locale. No ad-hoc booleans such as `isFlying`, `isLate`,
   `isCancelled` living beside the state.
5. **Status is never colour alone.** Icon, text and, where useful, shape or
   pattern. This matters more here because red and green are also used for
   battery, risk and cold chain.
6. **Honest promises.** A consumer ETA is a window with a confidence, not a
   minute-precise countdown. "Arriving" starts when the aircraft enters the
   arrival geofence, not when it takes off. If the estimate is weak, say so.
7. **Degraded is a designed state.** Offline, stale feed, lost link, hub closed,
   recipient absent, payment failed, and partial data each get their own state.
   They are not a generic error toast.
8. **Every exception has an owner, a reason, a next action and a timestamp.**
   An exception row without those four is decoration.
9. **Privacy is part of the product.** Camera and video exist only for a named
   purpose, with consent, retention and bystander redaction. Never stream a
   customer's doorstep to a public or shared screen.
10. **One thing leads per screen.** Consumer: the delivery. Hub: the next
    departure at risk. Ops: the highest-severity live risk. Not a wall of four
    equal KPI cards.

## 5. Information architecture

### Consumer app

Bottom navigation: **Order**, **Deliveries**, **Account**. Keep support one tap
from any delivery.

```
Order
  Store or category -> Store detail -> Basket -> Slot and price
  -> Checkout and consent -> Confirmation
Deliveries
  Upcoming -> Live tracking -> Handover -> Receipt
  History -> Delivery detail -> Issue or return
Account
  Addresses and drop-off instructions -> Payment -> Notifications
  Privacy and camera consent -> Help
```

The live tracking screen is the product. The order screen is the acquisition.
Do not make the consumer learn the operations model to receive a parcel.

### Merchant / hub console

Navigation: **Today**, **Orders**, **Inventory**, **Dispatch**, **Handover**,
**Exceptions**, **Settings**. A store manager lives in Today and Dispatch; a
picker lives in Orders and Packing; a dispatcher lives in Dispatch and Handover.

```
Today
  Next departures, at-risk orders, capacity, weather hold, staff on shift
Orders
  Queue -> Order detail -> Pick list -> Substitution -> Pack -> Stage
Dispatch
  Departure board -> Mission draft -> Payload and balance -> Assign aircraft
  -> Preflight -> Release
Handover
  Arriving -> Recipient check -> Proof -> Complete or fail with reason
Exceptions
  Queue -> Triage -> Owner -> Resolution -> Review
Inventory
  Stock, cold-chain slots, tote pool, promised versus available
Settings
  Hours, slots, drop-off zones, tenant branding, roles
```

### Flight operations

Navigation: **Live map**, **Missions**, **Fleet**, **Airspace**, **Weather**,
**Incidents**, **Maintenance**, **Crew**, **Logs**. This is a dense console:
use `data-dashboard` and its layout bands, not a consumer layout stretched wide.

```
Live map
  Map + mission list + risk rail + selected mission detail
Missions
  Planned -> Authorized -> Active -> Recovery -> Closed
  Mission detail: route, payload, aircraft, crew, clearances, timeline
Fleet
  Aircraft table (state, battery, airworthiness, location, next mission)
  Aircraft detail: hours, cycles, batteries, defects, documents
Airspace
  Corridors, geofences, no-fly volumes, temporary restrictions, authorization state
Weather
  Go / no-go per hub and corridor, wind, gust, precipitation, visibility, ceiling
Incidents
  Open -> Acknowledged -> Contained -> Resolved -> Reviewed
Maintenance
  Defect -> Triage -> Work order -> Release or ground
Logs
  Immutable mission, command and audit timeline with export
```

### Shared

Authentication and role selection, notification centre, tenant switcher,
profile, consent, language, theme. The same account can hold several roles; never
infer authority from the screen the user is on.

## 6. Screen inventory and priority

Build in this order. Every screen names its lead and its most important failure
state.

| # | Surface | Screen | Priority | Lead | Critical failure state |
|---|---|---|---|---|---|
| 1 | Consumer | Store and basket | MVP | Can this address be served, and when | Address outside corridor |
| 2 | Consumer | Slot and checkout | MVP | Honest window and total price | Slot sold out during payment |
| 3 | Consumer | Live tracking | MVP | Where it is and what happens next | Feed stale or mission held |
| 4 | Consumer | Handover | MVP | The one action to receive the parcel | Recipient absent, code expired |
| 5 | Merchant | Today | MVP | Next departure at risk | Weather hold, hub capacity |
| 6 | Merchant | Order queue and packing | MVP | Which order is next and what goes in it | Substitution or cold-chain breach |
| 7 | Merchant | Dispatch board | MVP | Which mission releases next | Aircraft unavailable, payload over mass |
| 8 | Ops | Live mission map | MVP | Highest-severity live risk | Stale telemetry, link loss |
| 9 | Ops | Mission detail and preflight | MVP | Go or no-go, and why | Failed checklist item |
| 10 | Ops | Exception and incident console | MVP | What needs a human now | Unacknowledged critical alarm |
| 11 | Consumer | Delivery history and issue | P1 | Receipt and resolution | Refund or return path missing |
| 12 | Merchant | Handover station | P1 | Which recipient is arriving | Wrong parcel, failed proof |
| 13 | Ops | Fleet and maintenance | P1 | Which aircraft is grounded and why | Airworthiness document expired |
| 14 | Ops | Airspace and corridor planner | P1 | Which route is legal now | Authorization expired mid-mission |
| 15 | Ops | Weather and go/no-go | P1 | Fly or hold, per hub | Gust limit crossed after release |
| 16 | Ops | Audit and flight log | P1 | Who did what and why | Missing actor or reason |
| 17 | Shared | Roles and permissions | P1 | What this person may do | Privilege escalation |
| 18 | Ops | Analytics and SLA | P2 | Punctuality and exception trend | Numbers disagree with logs |

A hackathon MVP is screens 1 to 10. That is enough to tell the whole story once.

## 7. Critical journeys

### J1. Consumer order to handover

1. Enter address, see serviceability before showing a catalogue. If outside the
   corridor, offer a nearby pickup point or a waitlist; do not let them shop and
   fail at checkout.
2. Choose a store, build a basket, see substitutions policy and cold-chain note.
3. Choose a window. Each window carries a confidence label and a price. The
   default is the earliest reliable window, not the cheapest unreliable one.
4. Pay. On slot loss, preserve the basket and offer the next two windows.
5. Confirmation states the window, the handover method and what the recipient
   must do. Send a calendar entry and a notification permission prompt.
6. Packing begins. Consumer sees "Preparing your order" with a real timestamp.
7. Mission releases. Consumer sees "On its way" only after takeoff, with a
   window and a map that shows a corridor, not a fake road route.
8. Arrival. Push plus in-app state: "Arriving now. Have your code ready."
9. Handover. Code, locker, or face-to-face. If the code fails, offer a retry and
   a support action, not a dead end.
10. Receipt, rating, and a one-tap issue path. If the delivery failed, state what
    happens to the parcel and when the refund lands.

### J2. Store order to dispatch

Order accepted -> pick list -> substitution decision if needed -> pack with tote
and cold-chain check -> stage at the correct door -> mission draft -> payload mass
and balance check -> aircraft assignment -> preflight -> release.

The dispatch board must answer four questions without opening a record: what
leaves next, what is missing, what is at risk, and who owns it.

### J3. Live monitoring

Glance: map, active mission count, highest severity, weather holds, fleet health.
Detect: an alarm or a stale feed elevates one mission. Investigate: open detail
with telemetry, route, link quality, battery reserve, weather and clearances. Act:
hold, reroute, return home, land, or contact the pilot. Confirm: every action
shows its consequence and requires a reason where irreversible.

The map is not the product alone. The risk rail and the mission list are equally
important, because a map with forty overlapping markers is unreadable.

### J4. Exception and incident

Detect -> triage severity and affected orders -> assign owner -> contain (hold,
reroute, ground, substitute) -> communicate to consumer and partner -> resolve ->
review with a timeline and corrective action.

Severity is not the same as urgency. A cold-chain excursion on a short mission
can be more urgent than a low-battery warning on a returning aircraft. Show both
axes or state the combined priority explicitly.

### J5. Weather or airspace replan

A hold is a promise change, not just an ops event. The consumer gets: what
changed, why in plain language, the new window or alternatives, and what happens
if they do nothing. The hub gets: which orders to re-slot, which payloads to
return to cold storage, and the cost impact. Ops gets: the constraint, the
affected missions, and the authorization state.

### J6. Failed handover, refusal, damage

Recipient absent -> wait or alternate secure drop, never an indefinite hover.
Refused -> return to hub, restock or dispose per policy, refund path. Damaged ->
evidence capture, replacement or refund, incident link. Every branch ends with a
parcel location and a money outcome.

### J7. Onboarding, consent, verification

Serviceability, address and drop-off instructions, notification permission,
camera and privacy consent where relevant, payment, and identity verification if
the jurisdiction or value requires it. Explain why each item is needed. Never
make consent a dark pattern; refusing optional camera consent must not block a
standard handover.

### J8. Maintenance and battery

Defect report -> triage -> work order -> parts and labour -> test -> release or
ground. Battery health is a first-class asset: cycles, capacity, temperature
history, reserve policy. The UI must show the reserve, not just the percentage.

## 8. State models

Use a typed state machine. The UI renders from it; it does not invent state.

### Mission

```ts
type MissionState =
  | 'draft' | 'planned' | 'validated' | 'authorized' | 'queued'
  | 'assigned' | 'preflight' | 'loading' | 'armed' | 'takeoff'
  | 'enroute' | 'approach' | 'hover' | 'handover'
  | 'returning' | 'landing' | 'postflight' | 'closed'
  | 'held' | 'diverted' | 'aborted' | 'emergency_landed';
```

- Happy path: `draft -> planned -> validated -> authorized -> queued ->
  assigned -> preflight -> loading -> armed -> takeoff -> enroute -> approach ->
  hover -> handover -> returning -> landing -> postflight -> closed`.
- Recovery states: `held`, `diverted`, `aborted`, `emergency_landed`. Each has
  an explicit return path or a terminal review path.
- `authorized` can expire. The UI must show authorization age and expiry, and
  block release when expired.
- `hover` has a time limit. Show the remaining time and the automatic action at
  expiry.

### Order

```ts
type OrderState =
  | 'cart' | 'slot_selected' | 'paid' | 'accepted' | 'picking'
  | 'packed' | 'staged' | 'queued' | 'in_flight' | 'arriving'
  | 'handover' | 'delivered' | 'failed' | 'returned' | 'refunded'
  | 'cancelled';
```

Consumer labels collapse this to: Confirmed, Preparing, On its way, Arriving,
Delivered, Needs attention. Ops labels keep the full set. A single mapping table
in code owns the translation.

Rules:

- Every transition emits an event with `mission_id` or `order_id`, `from`, `to`,
  `actor`, `reason_code`, `occurred_at`, `source`.
- Invalid transitions are rejected server-side. The client may disable a button,
  but the server is the authority.
- Safety states are never optimistically rendered. Use a pending indicator until
  the command is acknowledged.
- Do not derive `isLate` from a clock in the client. The server publishes the
  promise and the projection.

## 9. Visual direction

Decide the brief before markup. For this domain the defensible moods are
**accountable** (consumer) and **precise** (operations). "Futuristic" is a trap:
it produces neon HUDs, fake 3D drones and glowing maps that read as a game, not a
service that carries someone's groceries.

| Decision | Consumer | Operations |
|---|---|---|
| Mood | Calm, accountable, quietly premium | Precise, dense, calm under pressure |
| Type | Humanist sans, large status, tabular numerals for times | Compact sans, tabular numerals, mono for IDs and coordinates |
| Colour | Warm neutral surface, one accent, semantic status only | Dark-first surface with full light parity, restrained accent |
| Density | Comfortable, thumb-reachable | Compact, keyboard-first, 12-column bands |
| Motion | Short feedback, gentle map recenter, no celebration loops | State changes only, no ambient animation |
| Imagery | Real place and parcel context, no drone glamour shots | None. The map and telemetry are the imagery |
| Reference anchor | `${CLAUDE_SKILL_DIR}/../../../design-systems/library/uber/DESIGN.md` for logistics clarity | `${CLAUDE_SKILL_DIR}/../../../design-systems/library/linear-app/DESIGN.md` for operational density |

One token source, two density modes and two semantic themes, not two forks. Add
domain aliases at the semantic tier only:

```
status.live            status.stale           status.unknown
status.blocked         status.at-risk         status.resolved
telemetry.position     telemetry.battery      telemetry.link
map.corridor           map.geofence           map.no-fly
risk.info              risk.caution           risk.critical
```

Do not add a new palette for drones. Use `${CLAUDE_SKILL_DIR}/../../../tokens/data-viz.json` for charts and
`${CLAUDE_SKILL_DIR}/../../../tokens/motion.json` for every duration. Status colour always travels with an
icon and a word.

## 10. Signature components

| Component | Anatomy | Must have | Common failure |
|---|---|---|---|
| **Status pill** | Icon + label + optional count | Stable state ID, text label, tooltip with definition | Colour-only red/green, different labels per surface |
| **Freshness stamp** | "Live", "Delayed 12s", "Stale 2m", observed time | Age computed from server clock, visible stale treatment | A pulsing green dot over two-minute-old data |
| **Mission card** | ID, route, aircraft, payload, state, risk, next action | One risk line, one owner, one next action | Ten equal fields with no hierarchy |
| **Telemetry rail** | Battery, reserve, altitude, speed, link, wind | Units, freshness, threshold state | Raw numbers without limits or confidence |
| **Battery and range gauge** | Current charge, usable reserve, estimated range, temperature | Reserve marked separately; no false precision | A single percentage with no reserve or degradation |
| **Map canvas** | Basemap, corridor, route, aircraft, geofence, hazards, legend | Layer toggles, scale, north, freshness, text alternative | A dark map with glowing lines and no labels |
| **Route timeline** | Ordered legs with state, time, place, note | Current leg, next leg, delay reason | A progress bar that implies road travel |
| **Slot picker** | Window, confidence, price, cutoff | Honest confidence, alternative windows | Minute-precise promise from a forecast |
| **Handover card** | Method, code or locker, instructions, deadline, support | One primary action, fallback, expiry | Countdown that punishes a slow user |
| **Exception row** | Severity, entity, reason, owner, age, next action | All five, plus a link to evidence | A red row with no owner or action |
| **Preflight checklist** | Grouped checks, evidence, sign-off | Blocking versus advisory, who signed | A single "all good" checkbox |
| **Fleet row** | Aircraft, state, battery, location, airworthiness, next mission | Sortable, risk-first, keyboard reachable | A flat table with no risk ordering |
| **Incident timeline** | Event, actor, timestamp, evidence, decision | Immutable order, reason codes, export | Editable history |
| **Consumer tracking sheet** | State, ETA window, map, handover, support | Works with stale feed and offline | Auto-refresh that steals focus |

The status pill and freshness stamp are the two components to build first. Every
other screen depends on them being honest.

## 11. Map, telemetry and data rules

- **Default layers:** route, aircraft, corridor, one active hazard layer. Every
  additional layer is opt-in. A map with everything on is a poster, not a tool.
- **No fake precision.** Use a 5 to 15 second freshness budget for live
  telemetry, and label anything older. Thresholds are configuration, not magic
  numbers in the UI.
- **Gap detection.** Telemetry carries a sequence number. On a gap, show a dashed
  segment or a "position unknown" region. Never draw a straight line through
  missing data as if it were observed.
- **Interpolation.** Animate at most once per second. Mark extrapolated positions
  differently from observed ones, and stop extrapolating after the freshness
  budget.
- **Text alternative.** Every map ships a summary: current leg, next waypoint,
  ETA window, altitude band, link state, and a table of legs. A keyboard user
  must be able to select a mission without touching the map.
- **Charts:** battery and reserve over time, on-time performance, hub
  utilization, exception rate by reason. Use `${CLAUDE_SKILL_DIR}/../../../components/data-viz.md`; no
  decorative sparkline in a status row unless the number is adjacent.
- **Glance hierarchy:** risk rail before map, map before fleet table. The eye
  must land on the one mission that needs a human.
- **Alarm discipline:** one critical alarm does not become a confetti of toasts.
  Group by mission, show count, and require acknowledgement. `aria-live` is
  polite by default; only a genuinely critical, actionable event uses assertive,
  and even then it must not repeat on every telemetry tick.

## 12. Accessibility and field conditions

WCAG 2.2 AA is the floor. Consumer critical status text and controls should aim
for AAA contrast where the palette allows. Domain specifics:

- **Outdoors:** high contrast, large status text, no thin weights, no
  low-contrast grey on white for an ETA. Test in light mode first, then dark.
- **One hand and gloves:** primary actions in the lower third, at least 44x44,
  48x48 for field and handover controls. No drag-only interaction, no tiny close
  button, no hover-only information.
- **Noise and motion:** pair audio with visual and haptic. Respect reduced
  motion; a radar sweep or pulsing live dot collapses to a static state, not a
  vanished element.
- **Connectivity:** cache the last known state with its timestamp, show an
  offline banner, queue non-safety actions, and never queue a flight command as
  if it were a "like".
- **Stress:** plain language, one decision per screen, no timed handover that
  expires while the user is finding their phone. Offer an extension or a secure
  fallback.
- **Screen readers:** live regions announce state changes, not every coordinate.
  Give the map a summary and a list equivalent. Every icon has a text label or is
  decorative with `aria-hidden`.
- **Colour vision:** status uses icon, text and pattern. Battery, risk and cold
  chain each have distinct shapes, not three shades of green.
- **Localization:** German and English at minimum. ICU messages, metric units,
  24-hour time, address formats, and no concatenated sentences. Test long German
  compounds in every button and status pill.
- **Privacy:** no camera feed to a shared screen. Redact bystanders. State the
  purpose and retention next to the control that starts recording.

## 13. Voice and copy

Voice: calm, precise, accountable. Never blame the recipient, never promise what
the flight cannot deliver, never use cuteness in a failure.

Patterns:

- **ETA:** "Arriving 14:20 to 14:35", not "Arriving at 14:27". Add "Estimated"
  when confidence is low.
- **Delay:** what changed, why in plain words, the new window, what we did, what
  the recipient should do.
- **Failure:** where the parcel is, what happens next, when the money comes back,
  how to reach a human.
- **Ops:** reason code plus a sentence. "Held: gust 14 m/s above limit. Re-slot
  or return payload to cold storage."
- **Safety confirmation:** name the action, the consequence, and the scope.
  "Abort mission M-2041? The aircraft will return to Hub Nord. Two orders will
  miss their window."
- **Stale data:** "Position last updated 2 minutes ago. Do not rely on this
  location for a handover."

German and English starters:

| Moment | German | English |
|---|---|---|
| Confirmed | "Bestellt. Lieferfenster 14:20 bis 14:35." | "Order confirmed. Delivery window 14:20 to 14:35." |
| Preparing | "Ihr Einkauf wird gepackt." | "Your order is being packed." |
| On its way | "Unterwegs. Ankunft 14:20 bis 14:35." | "On its way. Arriving 14:20 to 14:35." |
| Arriving | "Jetzt da. Halten Sie Ihren Code bereit." | "Arriving now. Have your code ready." |
| Delayed | "Verzögert wegen Wind. Neues Fenster 14:50 bis 15:05." | "Delayed by wind. New window 14:50 to 15:05." |
| Failed handover | "Niemand angetroffen. Die Sendung geht zurück und wird erstattet." | "No one was there. The parcel returns and will be refunded." |
| Stale ops | "Position seit 2 Min. veraltet. Nicht für Übergabe nutzen." | "Position stale for 2 min. Do not use for handover." |
| Abort | "Mission abbrechen? Drohne kehrt zu Hub Nord zurück." | "Abort mission? The aircraft returns to Hub Nord." |

Avoid: "Your drone is on the way" before takeoff, "Arriving in 3 minutes" from a
forecast, "Oops", "Something went wrong", exclamation marks in a failure, and
jargon such as BVLOS in consumer UI.

## 14. Safety, compliance and trust

This is product design, not legal advice. Verify the applicable regime with
counsel and the competent authority before shipping.

- **Aviation:** EASA Regulations (EU) 2019/947 and 2019/945, the specific
  category and SORA where applicable, BVLOS and U-space rules, Remote ID,
  geofencing, and national additional requirements. The UI must expose
  authorization state, expiry, corridor and altitude band, and must block release
  when they are missing.
- **Data protection:** GDPR, video surveillance rules, DPIA for camera or
  bystander capture, purpose limitation, retention, access control, and data
  subject rights. Show the purpose and retention at the point of capture.
- **Consumer protection:** clear price, cancellation and refund rights, honest
  delivery promises, complaint path, accessibility of the service.
- **Product safety and liability:** incident reporting, occurrence categories,
  maintenance release, pilot currency, insurance. Every override has a named
  actor and a reason.
- **AI and automation:** label automated planning or detection, show confidence
  and the evidence, keep a human override, and log the decision. Do not present a
  model score as certainty.
- **Security:** RBAC or ABAC with least privilege, tenant isolation, signed media
  URLs, PII minimisation, masked phone numbers, no customer address on a shared
  operations wall, immutable audit log.

## 15. Implementation contract

Opinionated default; adapt to the existing stack rather than adding a second one.

| Layer | Default |
|---|---|
| Web console | React or Next.js with TypeScript, TanStack Query, MapLibre GL, deck.gl for corridors, XState for mission and order machines, Zod at boundaries |
| Consumer | React Native with Expo, or a PWA when install friction matters. Offline cache, push, deep links |
| Realtime | WebSocket or SSE for telemetry with sequence numbers, gap detection and backpressure. REST for commands and history |
| Styling | The kit's CSS variables. Tailwind is allowed only as a mapping layer over tokens |
| State | Server owns safety state. Client state is a projection with `observed_at` |
| Auth | OIDC, tenant claim, role plus scope. Never infer permission from a route |
| i18n | ICU messages, `Intl` for numbers, dates and units, no string concatenation |
| Testing | State-machine tests, contract tests, simulated telemetry, chaos for link loss and stale feeds, Playwright with axe |

Data contracts to agree on before building screens:

```ts
interface Mission {
  id: string;
  tenantId: string;
  hubId: string;
  aircraftId: string;
  state: MissionState;
  orderIds: string[];
  route: { legs: Leg[]; corridorId: string; altitudeBandM: [number, number] };
  promisedWindow: { start: string; end: string; confidence: 'high' | 'medium' | 'low' };
  authorization: { id: string; validUntil: string; status: 'pending' | 'granted' | 'expired' };
  risk: { level: 'info' | 'caution' | 'critical'; reasonCode?: string };
  updatedAt: string;
}

interface TelemetrySample {
  missionId: string;
  seq: number;
  observedAt: string;
  receivedAt: string;
  position: { lat: number; lon: number };
  altitudeM: number;
  headingDeg: number;
  groundSpeedMps: number;
  batteryPct: number;
  reservePct: number;
  linkQuality: 'good' | 'degraded' | 'lost';
  source: 'aircraft' | 'ground' | 'estimated';
}
```

Rules that save the product later:

- Server timestamps only. A client clock is not evidence.
- Commands carry an idempotency key and a reason where irreversible.
- Optimistic UI is for basket and preferences, never for flight commands.
- Coalesce telemetry; render at 1 Hz; detect sequence gaps; never let a render
  loop block the map.
- Virtualize fleet and order tables; keep filters in the URL; preserve scroll and
  selection when data updates.
- Offline queue only for non-safety actions; show queued, sent, acknowledged.
- Log every safety-relevant UI action with actor, mission, command, reason and
  result. The audit log is a product surface, not a backend afterthought.
- Performance targets: a usable first screen on a mid-range phone over a slow
  connection, a map that stays interactive while telemetry streams, and no
  layout shift when a status changes.

## 16. Gates and definition of done

Run the kit gates, then the domain checks. Report what each actually printed.

```bash
node ${CLAUDE_SKILL_DIR}/../../../scripts/accuracy_report.mjs
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_states.mjs <file> [--dark]
node ${CLAUDE_SKILL_DIR}/../../../scripts/axe_audit.mjs <file>
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_keyboard.mjs <file>
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_target_size.mjs <file>
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_mobile_first.mjs <file>
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_overflow.mjs <file>
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_reduced_motion.mjs <file>
node ${CLAUDE_SKILL_DIR}/../../../scripts/lint_intent.mjs <file>
node ${CLAUDE_SKILL_DIR}/../../../scripts/slop_tells.mjs --strict <file>
node ${CLAUDE_SKILL_DIR}/../../../scripts/taste_audit.mjs --strict <file>
python3 ${CLAUDE_SKILL_DIR}/../../../scripts/lint_hardcodes.py <src>
python3 ${CLAUDE_SKILL_DIR}/../../../scripts/check_no_emoji.py <src>
```

Domain checklist, all of it, on the rendered product:

1. Every status has icon, text and a definition; no colour-only state.
2. Every live surface shows observed time and a stale state; stale data is never
   animated as live.
3. Every map has a text summary and a keyboard-reachable list equivalent.
4. Every irreversible safety action is not the primary button, states its
   consequence, requires confirmation and a reason where appropriate.
5. Offline, stale feed, lost link and partial data each have a designed screen or
   state on the critical paths.
6. Consumer ETA is a window with confidence; "arriving" starts at the arrival
   geofence.
7. Failed handover, refusal and damage each end with a parcel location and a
   money outcome.
8. No customer address, phone number, camera feed or full name on a shared ops
   screen.
9. Every mission and order state in the model is reachable in seed data, and the
   demo can show at least one failure branch.
10. German and English copy fit every button, pill and banner; no jargon leaks to
    the consumer.
11. Seed data is internally consistent: battery, payload mass, distance, wind,
    time and capacity agree.
12. Screenshot both themes at 1600 and 390 wide, click every control, and confirm
    the state actually changed.

## 17. Hackathon cut

Ten screens, one story, one failure branch:

1. Consumer store and basket.
2. Slot, price and checkout.
3. Live tracking with an honest window.
4. Handover with code and fallback.
5. Hub Today with the next departure at risk.
6. Order queue and packing.
7. Dispatch board and preflight.
8. Mission control map with risk rail.
9. Mission detail with telemetry and authorization.
10. Exception console with one weather hold resolved end to end.

Demo narrative, four minutes: order placed -> hub packs -> dispatch releases ->
live map -> wind hold -> consumer gets a new window -> mission reroutes or
returns -> handover -> audit shows every decision. Simulate telemetry, but label
it "Demo data". Do not fake a live drone feed, a certification, or an AI
capability you do not have.

Do not build in the first pass: real payments, real drone control, a 3D digital
twin, a custom map renderer, a full regulatory workflow, or a gamified loyalty
layer. They consume the time the state machine and the failure branches need.

## 18. Output contract

When asked to design or build for this domain, deliver:

1. The Brief Inference block, before markup, naming the surface, actor and mood.
2. The selected state model and the labels for each surface touched.
3. All requested screens, complete, mobile-first, from one token source.
4. The failure and degraded states, not only the happy path.
5. The real gate output and the domain checklist result.
6. A screenshot review in both themes, and an explicit note of anything not
   measured.

If the user asks for "the UX/UI skill" without a specific screen, produce the
product frame, the three-surface IA, the state model and the ten-screen cut
before producing visual polish. Structure first; pixels second.
