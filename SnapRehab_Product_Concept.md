# SnapRehab: AI-Powered Photo-to-Estimate Rehab Tool
## Product Concept & Feature Specification

---

## The Vision

**Walk through a property. Snap photos of every room and the exterior. Get a complete rehab estimate, scope of work, material takeoff, and budget — in minutes, not hours.**

SnapRehab turns your phone into a virtual contractor. It uses AI vision to identify repair needs from photos, asks smart follow-up questions to refine the estimate, generates a full material takeoff with quantities and costs, and produces contractor-ready documents — all adjustable to your own pricing and preferred contractors.

---

## Why This Works Now

The technology to build this exists today and is proven in adjacent industries:

- **AI computer vision** can already detect cracks, water damage, rust, structural defects, and surface anomalies in construction contexts. Systems like Datagrid, OpenSpace, and Restb.ai process thousands of images and flag issues automatically.
- **Construction cost databases** are mature and zip-code-indexed (RSMeans, National Construction Estimator, HomeAdvisor cost data).
- **LLM/AI assistants** can now conduct conversational, contextual Q&A — asking smart follow-up questions based on what's been identified in photos.
- **Material takeoff software** exists for new construction (PlanSwift, Bluebeam) but has never been applied to residential rehab estimation in a mobile-first consumer format.

Nobody has combined these capabilities into a single, investor-focused mobile experience.

---

## How It Works: The User Flow

### Step 1: Create a New Property

User enters basic info:
- Address (auto-pulls property data: year built, square footage, bed/bath, lot size, property type)
- Number of rooms they'll be walking through
- Rehab level they're targeting (cosmetic / moderate / full gut — this sets AI expectations)

### Step 2: Exterior Walk-Around (5–8 photos)

The app guides the user through a structured exterior photo sequence:

| Photo # | What to Capture | What AI Looks For |
|---------|----------------|-------------------|
| 1 | Front of house (full view) | Siding condition, paint peeling, missing shutters, porch/step damage, landscaping state |
| 2 | Roof (best angle possible) | Missing/damaged shingles, sagging ridgeline, gutter condition, flashing issues |
| 3 | Left side | Siding damage, foundation visible cracks, window condition |
| 4 | Right side | Same as above |
| 5 | Back of house | Deck/patio condition, exterior doors, drainage grading |
| 6 | Foundation close-up | Cracks, efflorescence (white mineral deposits), water staining |
| 7 | Driveway/walkways | Cracking, settling, heaving |
| 8 | Garage (if applicable) | Door condition, structure, floor |

**After each photo, AI flags what it detects:**
> "I'm seeing what appears to be peeling paint on the siding with some possible rot near the bottom edge. The gutters look detached in one section. I don't see obvious roof damage from this angle, but the shingles appear to be the original 3-tab style."

**Then asks targeted follow-ups:**
> "How old do you think the roof is? Can you see any daylight or water stains from the attic?"
> "Does the siding feel soft when you press on the damaged area? That would indicate rot vs. just peeling paint."

### Step 3: Room-by-Room Interior Walk-Through

For each room, the app prompts:
1. **Select room type** — Kitchen, Bathroom, Bedroom, Living Room, Dining Room, Laundry, Basement, Hallway, etc.
2. **Take 2–4 photos** — The app guides: "Stand in the doorway and get a wide shot," "Get the ceiling," "Get any problem areas close up"
3. **AI analyzes and flags issues**
4. **Asks smart follow-up questions specific to that room type**

#### Example: Kitchen Walk-Through

**Photos taken:** Wide shot, close-up of cabinets, close-up of countertops, floor

**AI detects and reports:**
> "Kitchen observations:
> - Cabinets appear to be oak, circa 1990s, showing wear on door faces
> - Countertops look like laminate with some edge chipping
> - Flooring appears to be vinyl sheet with some lifting at seams
> - Appliances visible: appears to be non-stainless, older models
> - I can see water staining under the sink area in one photo"

**Follow-up questions:**
> "Are you planning to replace cabinets entirely, or would you refinish/paint them? (In this market, comps show most flips have shaker-style painted cabinets.)"
> "Turn on the faucet — how's the water pressure? Any discoloration?"
> "Open the cabinet under the sink — is there active moisture or just old staining?"
> "Do the cabinet doors close properly, or are the hinges loose?"

**User selects from suggested repair items:**
- ☑ Replace cabinets (30 LF estimated from photo)
- ☑ New countertops — quartz (estimated 45 SF from kitchen dimensions)
- ☑ New flooring — LVP (estimated 120 SF)
- ☑ Replace all appliances (standard flip package)
- ☑ New sink + faucet
- ☑ Repair subfloor under sink (estimated 10 SF)
- ☐ Relocate plumbing (only if changing layout)
- ☑ Paint walls + ceiling
- ☑ New lighting fixtures (3 estimated)
- ☑ New backsplash (estimated 25 SF)

Each item auto-populates with a cost estimate based on the user's zip code.

#### Example: Bathroom Walk-Through

**AI detects:**
> "This bathroom appears to have a tub/shower combo with tile surround. I'm seeing grout discoloration and possible mold at the caulk line. The vanity looks like a builder-grade single-sink. Toilet appears functional but dated. Floor is small ceramic tile."

**Follow-up questions:**
> "Does the floor feel spongy near the tub? That's a common sign of subfloor water damage."
> "Flush the toilet — does it run or take a long time to fill?"
> "Turn the shower on — any leaks behind the wall or low pressure?"

#### Example: Systems Check (HVAC, Electrical, Plumbing)

The app walks you through a systems checklist with photos:
> "Find the electrical panel and take a photo."
> AI: "This appears to be a 100-amp panel. For most flip-grade rehabs, you'll want a 200-amp upgrade. I also see what look like some Federal Pacific breakers — those are a known safety issue and should be replaced."

> "Take a photo of the water heater."
> AI: "This looks like a standard 40-gallon gas water heater. The manufacturing date on the label would tell us the age. These typically last 10–12 years. Can you read the date code?"

> "Take a photo of the HVAC system."
> AI: "This appears to be an older forced-air furnace. What does the filter area look like? Any rust on the heat exchanger?"

### Step 4: AI Generates the Full Estimate

Once all rooms are captured, the app compiles everything into:

#### A. The Rehab Cost Estimate

| Category | Description | Quantity | Unit | Unit Cost | Total |
|----------|-------------|----------|------|-----------|-------|
| **Exterior** | | | | | |
| Siding | Vinyl siding replacement | 1,200 | SF | $5.50 | $6,600 |
| Paint (ext) | Trim & accent paint | 1 | LS | $2,800 | $2,800 |
| Gutters | Seamless aluminum | 120 | LF | $8.00 | $960 |
| Roof | Architectural shingle re-roof | 20 | SQ | $450 | $9,000 |
| Foundation | Crack repair + seal | 1 | LS | $1,200 | $1,200 |
| Landscaping | Clean-up + basic plantings | 1 | LS | $1,500 | $1,500 |
| **Kitchen** | | | | | |
| Cabinets | White shaker 30 LF | 30 | LF | $175 | $5,250 |
| Countertops | Quartz | 45 | SF | $65 | $2,925 |
| Flooring | LVP (kitchen) | 120 | SF | $4.50 | $540 |
| Appliances | SS flip package (range, fridge, DW, micro) | 1 | Set | $2,800 | $2,800 |
| Sink + Faucet | Undermount SS + pull-down faucet | 1 | EA | $350 | $350 |
| Backsplash | Subway tile | 25 | SF | $18 | $450 |
| Lighting | Recessed + pendant | 3 | EA | $85 | $255 |
| **... (continues for each room)** | | | | | |
| **Systems** | | | | | |
| Electrical | Panel upgrade to 200A | 1 | LS | $2,500 | $2,500 |
| Plumbing | Fixture replacements | 1 | LS | $1,800 | $1,800 |
| HVAC | Service + new thermostat | 1 | LS | $500 | $500 |
| **General** | | | | | |
| Dumpster | 30-yard roll-off x2 | 2 | EA | $550 | $1,100 |
| Permits | Building permit (estimated) | 1 | LS | $800 | $800 |
| Contingency | 15% buffer | 1 | LS | — | $6,350 |
| | | | | **TOTAL** | **$48,680** |

#### B. The Material Takeoff (This Is the Killer Feature)

This is what no rehab estimator currently produces. A real, actionable shopping list:

**Kitchen Materials:**
| Item | Spec | Quantity | Source | Unit Price | Total |
|------|------|----------|--------|------------|-------|
| Cabinets | Hampton Bay Shaker White 30" base | 4 | Home Depot SKU #304655 | $219 | $876 |
| Cabinets | Hampton Bay Shaker White 36" wall | 6 | Home Depot SKU #304658 | $189 | $1,134 |
| Countertop | Silestone Quartz — Calacatta Gold 45 SF | 1 | Floor & Decor | $55/SF | $2,475 |
| Backsplash | MSI Arctic White 3x6 subway tile | 3 boxes | Home Depot SKU #307421 | $12.98/box | $38.94 |
| Backsplash grout | Mapei Keracolor U — Frost | 1 bag | Home Depot | $16.98 | $16.98 |
| Thin-set | Mapei Large Format tile mortar | 1 bag | Home Depot | $24.98 | $24.98 |
| Sink | Kraus Standart PRO Undermount SS | 1 | Amazon?"KHU100-30 | $189 | $189 |
| Faucet | Delta Leland Pull-Down — SS | 1 | Home Depot SKU #245723 | $179 | $179 |
| LVP Flooring | Lifeproof Sterling Oak 7mm | 5 boxes | Home Depot (25 SF/box) | $2.69/SF | $322.80 |
| Underlayment | Lifeproof attached (included) | — | — | — | — |
| Transition strips | T-molding, color match | 2 | Home Depot | $12.98 | $25.96 |
| Appliances | Whirlpool SS Package (range, fridge, DW) | 1 | Lowe's Bundle #WHP-SS-3 | $2,397 | $2,397 |
| Microwave | Whirlpool OTR SS | 1 | Lowe's | $279 | $279 |
| Recessed lights | Halo 6" LED retrofit | 4 | Home Depot | $12.97 | $51.88 |
| Pendant | Globe Electric matte black | 1 | Amazon | $34.99 | $34.99 |
| Paint | Sherwin-Williams Agreeable Gray (walls) | 2 gal | SW | $65/gal | $130 |
| Paint | SW Extra White (ceiling + trim) | 1 gal | SW | $65 | $65 |

*... continues for every room and system in the house.*

**Total Material Cost: $XX,XXX**
**Estimated Labor Cost: $XX,XXX**
**Combined Total: $XX,XXX**

#### C. Scope of Work Document (Auto-Generated)

Ready to hand directly to contractors for bidding:

> **KITCHEN — Scope of Work**
> 1. Demo and removal of all existing cabinets, countertops, backsplash, and flooring. Haul to dumpster.
> 2. Inspect and repair subfloor as needed (estimated 10 SF repair near sink area).
> 3. Install new white shaker cabinets per layout drawing (30 LF total — see attached spec sheet).
> 4. Install quartz countertops with undermount sink cutout (45 SF, seamed as needed).
> 5. Install subway tile backsplash from counter to upper cabinets (25 SF).
> 6. Install LVP flooring (120 SF) with transitions to adjacent rooms.
> 7. Connect plumbing for new sink and faucet. Verify disposal connection.
> 8. Install all new appliances (owner-supplied — Whirlpool SS package).
> 9. Install 4 recessed LED lights and 1 pendant over sink. Connect to existing circuits.
> 10. Paint walls (2 coats Agreeable Gray) and ceiling/trim (Extra White).
> 11. Install new hardware on all cabinets (owner-supplied).

#### D. Draw Schedule (For Lender)

Auto-maps the estimate into a draw schedule format matching common hard money lender requirements:

| Draw # | Phase | Items Included | Amount | % of Total |
|--------|-------|---------------|--------|-----------|
| 1 | Demo + Structural | Demo, foundation repair, framing | $4,500 | 9% |
| 2 | Rough Systems | Electrical panel, rough plumb, HVAC | $5,800 | 12% |
| 3 | Exterior | Roof, siding, gutters, windows | $18,060 | 37% |
| 4 | Interior Finishes | Cabinets, counters, flooring, tile, paint | $15,570 | 32% |
| 5 | Final | Fixtures, appliances, punch list, cleanup | $4,750 | 10% |
| | | **Total** | **$48,680** | 100% |

---

## The Adjustability Factor (Critical for Adoption)

Everything is adjustable. This is what makes it a tool for experienced flippers, not just beginners:

### Adjust Contractor Pricing
> "I know my GC charges $150/LF for cabinets, not $175."
> → Override the unit cost. The app remembers YOUR contractor pricing for future projects.

### Build Your Own "Flip Kit"
> Save your go-to specs as a template:
> - "My standard kitchen" = Shaker White cabinets + quartz + LVP + SS Whirlpool package
> - "My standard bathroom" = 60" vanity + framed mirror + LVP + new toilet + tile surround
> - "My standard paint" = SW Agreeable Gray walls, Extra White trim, everywhere
>
> On the next project, the app auto-applies your kit and only asks about deviations.

### Adjust Material Selections
> "I don't use Lifeproof LVP. I buy from my flooring distributor at $1.89/SF."
> → Swap the material, update the price. The takeoff recalculates instantly.

### Adjust Quantities
> "The AI estimated 1,200 SF of siding but only 2 sides need replacement."
> → Adjust to 600 SF. Everything downstream (material quantities, labor, total cost) auto-updates.

### Compare Scenarios
> "What if I paint the cabinets instead of replacing them?"
> → Toggle the option. See the budget difference instantly ($5,250 → $1,200 = $4,050 saved).

---

## Revenue Model

| Revenue Stream | Description | Estimated Revenue |
|----------------|-------------|-------------------|
| **SaaS Subscription** | $29/mo (Starter: 3 projects) / $79/mo (Pro: unlimited) / $199/mo (Team: multi-user) | Primary revenue driver |
| **Material Affiliate Revenue** | When users click "Buy at Home Depot" from the takeoff, earn 2–4% affiliate commission | Passive, scales with users |
| **Contractor Marketplace** | Contractors pay for premium listing / to receive SOW bid requests from investors in their area | Network-effect revenue |
| **Lender Partnerships** | Hard money lenders pay referral fee when users apply through the app | $500–$2,000 per funded deal |
| **Data Licensing** | Anonymized rehab cost data by zip code sold to lenders, insurance companies, appraisers | High-margin, long-term |
| **"Flip Kit" Marketplace** | Experienced flippers sell their proven material spec templates to other users | Commission-based |

---

## Competitive Advantage & Moat

| Advantage | Why It's Defensible |
|-----------|-------------------|
| **AI Vision Model** | Improves with every property photographed. After 10,000+ walkthroughs, the model becomes extremely accurate at identifying repair needs from photos — no competitor can replicate this without the same volume of training data. |
| **Localized Cost Intelligence** | Every completed project feeds actual cost data back into the system. Over time, this creates the most accurate, hyper-local rehab cost database in existence — far better than national averages. |
| **Flip Kit Templates** | Users build and refine their personal spec packages. Switching costs increase over time — your entire business workflow lives in the app. |
| **Contractor Network** | As contractors receive SOWs from the app, they become accustomed to the format. Investors bring the app to new contractors, contractors bring it to new investors. Two-sided network effect. |
| **Material Takeoff Integration** | No other rehab tool generates a material-level shopping list. This alone is a reason to use the app even if you ignore everything else. |

---

## MVP Build Plan

### Phase 1 (Months 1–4): Core Photo-to-Estimate

- Room-by-room photo capture flow
- AI analysis using GPT-4o/Claude vision for initial defect detection (API-based, not custom model yet)
- Pre-built question trees for each room type
- Zip-code-adjusted cost database (license RSMeans or National Construction Estimator data)
- Basic estimate output + SOW document generation
- PDF export for lenders and contractors
- Works offline with sync

**Target users:** 50 beta testers from BiggerPockets / local REI clubs

### Phase 2 (Months 5–8): Material Takeoff + Adjustability

- Full material takeoff with SKUs and quantities
- Home Depot / Lowe's API integration for real-time pricing
- "Flip Kit" template system (save and reuse your standard specs)
- Contractor pricing override and memory
- Scenario comparison ("paint vs. replace cabinets")
- Draw schedule generator

### Phase 3 (Months 9–12): Network + Intelligence

- Contractor marketplace (receive SOW bid requests)
- Actual vs. estimated cost tracking (learning loop)
- Portfolio analytics across multiple projects
- Custom AI model trained on thousands of user-submitted property photos
- Hard money lender integrations
- Team/brokerage features

### Phase 4 (Year 2+): Platform Expansion

- AR measurement overlay (measure rooms from your phone camera)
- Before/after visualization (AI-render what the finished flip will look like)
- Listing photo generation from renovation completion photos
- Integration with FlipperForce, Rehab Valuator (become the estimating engine they plug into)
- Expand to rental rehab, BRRRR, and new construction verticals

---

## Technical Feasibility Assessment

| Component | Feasibility | Notes |
|-----------|-------------|-------|
| AI photo analysis for defect detection | ✅ High | GPT-4o and Claude vision already identify water damage, cracks, outdated materials, and condition issues from photos with good accuracy. Custom fine-tuning on rehab-specific images would improve this significantly. |
| Room type identification | ✅ High | Standard computer vision classification task. Very solvable. |
| Quantity estimation from photos | 🟡 Medium | Estimating square footage from a single photo is approximate. Can be improved with AR/LiDAR (iPhone Pro has LiDAR), or by asking user to confirm room dimensions. |
| Cost database integration | ✅ High | RSMeans, National Construction Estimator, and HomeAdvisor all license data. Zip-code adjustment is standard. |
| Material takeoff generation | ✅ High | Once quantities and specs are known, generating a BOM (bill of materials) is straightforward logic. |
| SKU-level product matching | 🟡 Medium | Requires maintaining a product catalog mapped to common rehab items. Home Depot/Lowe's have APIs. |
| Offline functionality | ✅ High | Photos and form data captured locally, AI analysis runs on sync. |
| SOW/PDF document generation | ✅ High | Standard document templating. |

**Bottom line: This is buildable today.** The hardest part isn't the technology — it's building the structured knowledge base of "what to look for" per room type and property age, and the mapping between detected issues → repair items → materials → quantities → costs. That's where deep rehab/contractor expertise is needed on the founding team.

---

## Summary

**SnapRehab transforms a phone into a virtual contractor** that walks with you through any property and produces everything you need to evaluate the deal, bid the work, buy the materials, and fund the project — in the time it takes to walk through the house.

No existing tool does this. The closest (Rehab Estimator Pro) is a clickable checklist. The next closest (FlipperForce) is a web-based spreadsheet with a cost database. Neither uses photos. Neither generates material takeoffs. Neither learns from your actual project data.

**This is a genuine blue ocean in the rehab/flip space.**

---

*Product concept developed February 2026.*
