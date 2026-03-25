# GREENEYE NURSERY — NW CORNER DESIGN BUNDLE
## Phase 1 Construction — Complete Deliverables

**Owner:** Piyush Ji (CTPO, CancerMitr / Greeneye Foundation)  
**Architect:** Diksha Singh, AK Interiors, Jaipur  
**Date:** 20 March 2026  
**Status:** Final — ready for contractor execution

---

## FOLDER STRUCTURE

### `/final/` — USE THESE FILES
These are the current, approved, final versions of all deliverables.

| File | Description |
|------|-------------|
| `Greeneye_NW_Architecture_Document.docx` | **Master specification document.** 10 pages covering toilet, room, cantilever, pathway, Vastu, electrical, construction notes. Share this with Claude/AI agents for full context. |
| `Greeneye_NW_Detailed_Plan.pdf` | 2-page A3 landscape PDF. Page 1: Toilet v4. Page 2: Caretaker Room. For printing and contractor reference. |
| `greeneye_caretaker_room_pathway.html` | **Interactive floor plan** with tabs: Room layout, Pathway, Full NW layout, Specs. Open in browser. Contains all fixtures, ventilation arrows, kitchenette, outdoor counter. |
| `greeneye_toilet_v4_final.html` | **Interactive toilet floor plan** with tabs: Floor Plan, West Wall Detail, Plumbing, Specs. Open in browser. |
| `greeneye_nw_complete_blender.py` | **Blender 3D model script.** Complete NW corner. Open Blender → Scripting → New → Paste → Alt+P. 5 cameras, 4 lights, Cycles render. |
| `greeneye_walkthrough.html` | **First-person browser walkthrough.** WASD movement, mouse look, interactive doors (press E), minimap. No installation needed. |

### `/architect_originals/` — REFERENCE
Original files from architect Diksha Singh (AK Interiors). These are the starting point for the design.

| File | Description |
|------|-------------|
| `Greeneye_NW_Layout_AI_Prompt.txt` | 310-line architectural brief with plot details, Vastu requirements, construction specs. |
| `Greeneye_Nursery_NW_Layout.pdf` | Architect's 2-page layout drawing (plan view). |
| `Greeneye_MS_Structure.pdf` | MS (mild steel) structural details. |
| `Greeneye_West_Elevation.pdf` | West elevation drawing. |
| `Greeneye_East_Elevation.pdf` | East elevation drawing. |
| `Greeneye_South_Elevation.pdf` | South elevation drawing. |

### `/iterations/` — DESIGN HISTORY
Earlier versions showing the evolution of the design. For reference only — do NOT use for construction.

| File | Description |
|------|-------------|
| `toilet_v1.html` | First toilet layout (urinal on W wall — collided with door) |
| `toilet_v2_urinal_east.html` | Urinal moved to E wall |
| `toilet_v3_urinal_south.html` | Urinal moved to S wall (better flow) |
| `toilet_blender_v1.py` | First Blender script (separate objects, had bugs) |
| `toilet_blender_v2_joined.py` | Fixed Blender script (joined bmesh objects) |

---

## QUICK START FOR AI AGENTS

If you're an AI agent receiving this bundle for the first time:

1. **Read `final/Greeneye_NW_Architecture_Document.docx` first** — it contains every decision, spec, and Vastu analysis.
2. **Open `final/greeneye_caretaker_room_pathway.html`** in a browser for the visual floor plan.
3. **Read `architect_originals/Greeneye_NW_Layout_AI_Prompt.txt`** for the original architect brief.

### Key Design Decisions (Summary)

**Toilet (9×6ft, Vastu 95%):**
- WC on West wall (faces East), glass partition, door hinged South
- Urinal on South wall, handwash on East wall (faces East)
- Shower SE corner, geyser on East wall
- Cross-ventilation: E→W (louvre in, exhaust out)

**Caretaker Room (9×9ft, Vastu 92%):**
- L-counter NW corner: N arm 6.3ft × 1ft deep, W arm 3.4ft × 1.5ft deep
- Kitchenette on W arm: single induction (no LPG), 50L mini fridge under counter
- Storage cupboard SW: 5.5ft × 1.5ft, 4 shelves, floor-to-ceiling
- Bed: 6ft × 6ft king, South zone, head faces South
- Door: NE corner, 3ft, hinged North jamb, swings along N wall
- Louver window: East wall, 6ft operable slats (South of door)
- High louvre: West wall @7ft, fixed, air exits to pathway
- Cross-ventilation: E→W (louver in, high louvre out)

**South Cantilever (5ft overhang):**
- Outdoor counter SW: 6ft × 2ft, storage shelf below, 3× 5A sockets
- Passage SE: ~3ft open, connects nursery land to cantilever area

**Pathway:** 5ft × 15ft, open to sky, IPS/Kota stone, drain trench along West

---

## COORDINATE SYSTEM (for 3D models)

All 3D models use this coordinate system:
- **X** = East-West (East = +X). X=0 to X=9 is buildable, X=-5 to X=0 is pathway.
- **Y (Blender) / Z (Three.js)** = North-South (North = +). Room Y=5-14, Toilet Y=14-20, Parking Y=20-35, Cantilever Y=0-5.
- **Z (Blender) / Y (Three.js)** = Height. Ground = 0, Ceiling = 10ft.

---

*Generated 20 March 2026 • Greeneye Foundation / AK Interiors*
