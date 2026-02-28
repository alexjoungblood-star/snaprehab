/**
 * Seed a demo property with full AI analysis, repair items, and estimates.
 *
 * Usage: node scripts/seed-demo-property.js <user-email> <user-password>
 *
 * This creates a realistic property walkthrough result so you can preview
 * the estimate, scope of work, and PDF export screens.
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ehpxxiyaksfqivpvxrci.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocHh4aXlha3NmcWl2cHZ4cmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTEzMTAsImV4cCI6MjA4Nzg2NzMxMH0.ZG3yiu2_5utNyShKnCw7pXxZTO26ytbFbN67cQx2RHY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node scripts/seed-demo-property.js <email> <password>');
    process.exit(1);
  }

  // Sign in to get the user's session (needed for RLS)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('Auth failed:', authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log(`Signed in as ${email} (${userId})`);

  // -----------------------------------------------
  // 1. CREATE DEMO PROPERTY
  // -----------------------------------------------
  const { data: property, error: propErr } = await supabase
    .from('properties')
    .insert({
      user_id: userId,
      address_line1: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62704',
      year_built: 1985,
      square_footage: 1850,
      bedrooms: 3,
      bathrooms: 2.0,
      property_type: 'single_family',
      rehab_level: 'moderate',
      status: 'in_progress',
      notes: 'Demo property — moderate rehab flip candidate. Good bones, needs cosmetic + some systems updates.',
    })
    .select()
    .single();

  if (propErr) { console.error('Property insert failed:', propErr); process.exit(1); }
  console.log(`Created property: ${property.id}`);

  const propertyId = property.id;

  // -----------------------------------------------
  // 2. SEED BASE COSTS (if not already present)
  // -----------------------------------------------
  const { count } = await supabase.from('base_costs').select('id', { count: 'exact', head: true });
  if (!count || count < 10) {
    console.log('Seeding base costs...');
    const baseCosts = [
      { repair_code: 'EXT-SIDING-VINYL', category: 'Exterior', subcategory: 'Siding', description: 'Vinyl siding replacement', unit: 'sqft', base_unit_cost: 5.50, min_cost: 3.50, max_cost: 8.00, applicable_room_types: ['exterior'], rehab_levels: ['moderate', 'full_gut'] },
      { repair_code: 'EXT-PAINT', category: 'Exterior', subcategory: 'Paint', description: 'Exterior paint (2 coats)', unit: 'sqft', base_unit_cost: 3.25, min_cost: 2.00, max_cost: 5.00, applicable_room_types: ['exterior'], rehab_levels: ['cosmetic', 'moderate', 'full_gut'] },
      { repair_code: 'EXT-ROOF-SHINGLE', category: 'Exterior', subcategory: 'Roofing', description: 'Asphalt shingle roof replacement', unit: 'sqft', base_unit_cost: 4.75, min_cost: 3.50, max_cost: 7.50, applicable_room_types: ['exterior'], rehab_levels: ['moderate', 'full_gut'] },
      { repair_code: 'EXT-GUTTER', category: 'Exterior', subcategory: 'Gutters', description: 'Aluminum gutter replacement', unit: 'lf', base_unit_cost: 8.50, min_cost: 6.00, max_cost: 12.00, applicable_room_types: ['exterior'], rehab_levels: ['moderate', 'full_gut'] },
      { repair_code: 'KIT-CAB-REFACE', category: 'Kitchen', subcategory: 'Cabinets', description: 'Cabinet refacing (shaker style)', unit: 'lf', base_unit_cost: 175.00, min_cost: 120.00, max_cost: 250.00, applicable_room_types: ['kitchen'], rehab_levels: ['cosmetic', 'moderate'] },
      { repair_code: 'KIT-COUNTER-GRANITE', category: 'Kitchen', subcategory: 'Countertops', description: 'Granite countertop installation', unit: 'sqft', base_unit_cost: 65.00, min_cost: 45.00, max_cost: 100.00, applicable_room_types: ['kitchen'], rehab_levels: ['moderate', 'full_gut'] },
      { repair_code: 'KIT-FLOOR-LVP', category: 'Kitchen', subcategory: 'Flooring', description: 'Luxury vinyl plank flooring', unit: 'sqft', base_unit_cost: 6.50, min_cost: 4.00, max_cost: 10.00, applicable_room_types: ['kitchen', 'living_room', 'bedroom'], rehab_levels: ['cosmetic', 'moderate', 'full_gut'] },
      { repair_code: 'KIT-SINK-SS', category: 'Kitchen', subcategory: 'Plumbing', description: 'Stainless steel sink + faucet', unit: 'ea', base_unit_cost: 450.00, min_cost: 250.00, max_cost: 750.00, applicable_room_types: ['kitchen'], rehab_levels: ['moderate', 'full_gut'] },
      { repair_code: 'KIT-APPLIANCE-PKG', category: 'Kitchen', subcategory: 'Appliances', description: 'Appliance package (fridge, range, dishwasher, microwave)', unit: 'ea', base_unit_cost: 3200.00, min_cost: 2000.00, max_cost: 5000.00, applicable_room_types: ['kitchen'], rehab_levels: ['moderate', 'full_gut'] },
      { repair_code: 'BATH-VANITY-36', category: 'Bathroom', subcategory: 'Vanity', description: '36-inch vanity with top and faucet', unit: 'ea', base_unit_cost: 650.00, min_cost: 350.00, max_cost: 1200.00, applicable_room_types: ['bathroom'], rehab_levels: ['cosmetic', 'moderate', 'full_gut'] },
      { repair_code: 'BATH-TILE-FLOOR', category: 'Bathroom', subcategory: 'Flooring', description: 'Ceramic tile floor (12x12)', unit: 'sqft', base_unit_cost: 12.00, min_cost: 8.00, max_cost: 18.00, applicable_room_types: ['bathroom'], rehab_levels: ['cosmetic', 'moderate', 'full_gut'] },
      { repair_code: 'BATH-TUB-SURROUND', category: 'Bathroom', subcategory: 'Tub/Shower', description: 'Tub surround replacement (acrylic)', unit: 'ea', base_unit_cost: 1100.00, min_cost: 600.00, max_cost: 2000.00, applicable_room_types: ['bathroom'], rehab_levels: ['moderate', 'full_gut'] },
      { repair_code: 'BATH-TOILET', category: 'Bathroom', subcategory: 'Plumbing', description: 'Toilet replacement (elongated, comfort height)', unit: 'ea', base_unit_cost: 375.00, min_cost: 200.00, max_cost: 600.00, applicable_room_types: ['bathroom'], rehab_levels: ['moderate', 'full_gut'] },
      { repair_code: 'INT-PAINT-ROOM', category: 'Interior', subcategory: 'Paint', description: 'Interior paint per room (walls + ceiling, 2 coats)', unit: 'room', base_unit_cost: 450.00, min_cost: 300.00, max_cost: 700.00, applicable_room_types: ['kitchen', 'bathroom', 'bedroom', 'living_room'], rehab_levels: ['cosmetic', 'moderate', 'full_gut'] },
      { repair_code: 'INT-FLOOR-LVP', category: 'Interior', subcategory: 'Flooring', description: 'Luxury vinyl plank flooring', unit: 'sqft', base_unit_cost: 6.50, min_cost: 4.00, max_cost: 10.00, applicable_room_types: ['bedroom', 'living_room'], rehab_levels: ['cosmetic', 'moderate', 'full_gut'] },
      { repair_code: 'INT-BASEBOARD', category: 'Interior', subcategory: 'Trim', description: 'Baseboard trim (MDF, primed, installed)', unit: 'lf', base_unit_cost: 4.50, min_cost: 3.00, max_cost: 7.00, applicable_room_types: ['kitchen', 'bathroom', 'bedroom', 'living_room'], rehab_levels: ['moderate', 'full_gut'] },
      { repair_code: 'ELEC-PANEL-200A', category: 'Electrical', subcategory: 'Panel', description: '200-amp electrical panel upgrade', unit: 'ea', base_unit_cost: 2800.00, min_cost: 1800.00, max_cost: 4000.00, applicable_room_types: ['electrical_panel'], rehab_levels: ['full_gut'] },
      { repair_code: 'ELEC-OUTLET-GFCI', category: 'Electrical', subcategory: 'Outlets', description: 'GFCI outlet install (kitchen/bath)', unit: 'ea', base_unit_cost: 175.00, min_cost: 100.00, max_cost: 250.00, applicable_room_types: ['kitchen', 'bathroom'], rehab_levels: ['moderate', 'full_gut'] },
      { repair_code: 'PLUMB-WATER-HEATER', category: 'Plumbing', subcategory: 'Water Heater', description: '50-gallon gas water heater replacement', unit: 'ea', base_unit_cost: 1400.00, min_cost: 900.00, max_cost: 2200.00, applicable_room_types: ['water_heater'], rehab_levels: ['moderate', 'full_gut'] },
      { repair_code: 'HVAC-FURNACE', category: 'HVAC', subcategory: 'Furnace', description: 'Gas furnace replacement (80K BTU)', unit: 'ea', base_unit_cost: 3500.00, min_cost: 2500.00, max_cost: 5000.00, applicable_room_types: ['hvac'], rehab_levels: ['full_gut'] },
      { repair_code: 'GEN-DUMPSTER', category: 'General', subcategory: 'Demo', description: 'Dumpster rental (20-yard, 1 week)', unit: 'ea', base_unit_cost: 450.00, min_cost: 300.00, max_cost: 600.00, applicable_room_types: [], rehab_levels: ['cosmetic', 'moderate', 'full_gut'] },
      { repair_code: 'GEN-PERMITS', category: 'General', subcategory: 'Permits', description: 'Building permits and inspections', unit: 'ea', base_unit_cost: 1200.00, min_cost: 500.00, max_cost: 3000.00, applicable_room_types: [], rehab_levels: ['moderate', 'full_gut'] },
    ];
    await supabase.from('base_costs').upsert(baseCosts, { onConflict: 'repair_code' });
    console.log(`Seeded ${baseCosts.length} base cost items`);
  } else {
    console.log(`Base costs already populated (${count} items)`);
  }

  // Seed location factor for Springfield IL (627xx)
  await supabase.from('location_factors').upsert({
    zip_prefix: '627',
    city: 'Springfield',
    state: 'IL',
    material_factor: 0.95,
    labor_factor: 0.88,
    combined_factor: 0.92,
    data_source: 'hud_cci',
  }, { onConflict: 'zip_prefix' });

  // -----------------------------------------------
  // 3. CREATE ROOMS
  // -----------------------------------------------
  const roomDefs = [
    { room_type: 'exterior_front', room_label: 'Front Exterior', sort_order: 1, status: 'analyzed' },
    { room_type: 'kitchen', room_label: 'Kitchen', sort_order: 2, status: 'items_selected' },
    { room_type: 'bathroom', room_label: 'Master Bathroom', sort_order: 3, status: 'items_selected' },
    { room_type: 'bathroom', room_label: 'Hall Bathroom', sort_order: 4, status: 'items_selected' },
    { room_type: 'living_room', room_label: 'Living Room', sort_order: 5, status: 'items_selected' },
    { room_type: 'bedroom', room_label: 'Master Bedroom', sort_order: 6, status: 'analyzed' },
  ];

  const rooms = [];
  for (const def of roomDefs) {
    const { data, error } = await supabase
      .from('rooms')
      .insert({ property_id: propertyId, ...def })
      .select()
      .single();
    if (error) { console.error('Room insert error:', error); continue; }
    rooms.push(data);
    console.log(`  Room: ${data.room_label} (${data.id})`);
  }

  // -----------------------------------------------
  // 4. CREATE AI ANALYSES
  // -----------------------------------------------
  const analyses = [
    {
      room: rooms[0], // Front Exterior
      provider: 'claude',
      condition_score: 5,
      narrative_summary: 'The exterior shows moderate wear consistent with a 40-year-old property. The vinyl siding has faded significantly and several pieces are cracked or warped. The roof appears to be near end-of-life with curling shingles visible. Gutters are sagging in two sections. Foundation appears solid with no major cracks, though minor efflorescence is present. Overall, the property presents well from the street but needs siding, roof, and gutter work.',
      observations: [
        { category: 'Siding', description: 'Faded vinyl siding with 3 cracked panels on the south-facing wall', severity: 'moderate', confidence: 0.92 },
        { category: 'Roofing', description: 'Asphalt shingles curling at edges, approximately 20+ years old, granule loss visible', severity: 'major', confidence: 0.88 },
        { category: 'Gutters', description: 'Aluminum gutters pulling away from fascia in 2 sections, debris buildup visible', severity: 'moderate', confidence: 0.85 },
        { category: 'Foundation', description: 'Minor efflorescence on foundation walls, no structural cracks detected', severity: 'minor', confidence: 0.78 },
        { category: 'Windows', description: 'Original single-pane windows, frames in fair condition, some paint peeling', severity: 'moderate', confidence: 0.84 },
      ],
      defects: [
        { type: 'material_deterioration', location: 'South wall siding', severity: 'moderate', description: 'Cracked vinyl siding panels need replacement' },
        { type: 'wear_and_tear', location: 'Roof surface', severity: 'major', description: 'Shingles at end of useful life, recommend full replacement' },
        { type: 'structural', location: 'Gutter system', severity: 'moderate', description: 'Gutters pulling away, potential fascia board rot beneath' },
      ],
      follow_up_questions: [
        { question: 'When was the roof last replaced or repaired?', context: 'Shingles appear 20+ years old', responseType: 'text', priority: 'high' },
        { question: 'Are there any known water intrusion issues in the basement or crawlspace?', context: 'Foundation efflorescence detected', responseType: 'yes_no', priority: 'medium' },
      ],
      suggested_repairs: [
        { repairCode: 'EXT-SIDING-VINYL', description: 'Replace vinyl siding (full house)', estimatedQuantity: 1500, unit: 'sqft', confidence: 0.85, reasoning: 'Widespread fading and cracking indicates full replacement is more cost-effective than spot repairs' },
        { repairCode: 'EXT-ROOF-SHINGLE', description: 'Full roof replacement (asphalt shingles)', estimatedQuantity: 1850, unit: 'sqft', confidence: 0.90, reasoning: 'Shingles at end of life with curling and granule loss throughout' },
        { repairCode: 'EXT-GUTTER', description: 'Replace gutters and downspouts', estimatedQuantity: 140, unit: 'lf', confidence: 0.82, reasoning: 'Sagging gutters with potential fascia damage behind' },
        { repairCode: 'EXT-PAINT', description: 'Paint trim, soffits, and fascia', estimatedQuantity: 600, unit: 'sqft', confidence: 0.75, reasoning: 'Peeling paint on window frames and trim' },
      ],
    },
    {
      room: rooms[1], // Kitchen
      provider: 'claude',
      condition_score: 4,
      narrative_summary: 'The kitchen is dated but functional. Original 1985 oak cabinets are structurally sound but cosmetically outdated. Laminate countertops are chipped in several places. Linoleum flooring is worn and peeling at seams. Appliances are mismatched and aging. The layout is workable — a cosmetic refresh with cabinet refacing, new countertops, flooring, and appliance package would transform this space. Plumbing fixtures are dated but functional.',
      observations: [
        { category: 'Cabinets', description: 'Original oak cabinets in good structural condition, heavy yellowing and dated style', severity: 'moderate', confidence: 0.94 },
        { category: 'Countertops', description: 'Laminate countertops with chips and burn marks, seams separating', severity: 'major', confidence: 0.91 },
        { category: 'Flooring', description: 'Vinyl sheet flooring peeling at seams, staining and wear patterns visible', severity: 'moderate', confidence: 0.89 },
        { category: 'Appliances', description: 'Mismatched appliances: white fridge (2010s), black stove (2000s), no dishwasher', severity: 'moderate', confidence: 0.95 },
        { category: 'Plumbing', description: 'Dated faucet with slow drip, stainless sink has surface scratches but no damage', severity: 'minor', confidence: 0.82 },
        { category: 'Electrical', description: 'Only 2 outlets visible on counter backsplash, no GFCI protection detected', severity: 'moderate', confidence: 0.76 },
      ],
      defects: [
        { type: 'material_deterioration', location: 'Countertops', severity: 'major', description: 'Multiple chips and separating seams in laminate' },
        { type: 'wear_and_tear', location: 'Flooring', severity: 'moderate', description: 'Vinyl peeling and stained, needs full replacement' },
        { type: 'safety', location: 'Electrical outlets', severity: 'moderate', description: 'Kitchen lacks GFCI outlets — code requirement' },
      ],
      follow_up_questions: [
        { question: 'Do you plan to keep the existing kitchen layout or reconfigure?', context: 'Layout is functional but could be opened up', responseType: 'multiple_choice', options: ['Keep layout', 'Open to dining', 'Full reconfigure'], priority: 'high' },
        { question: 'What is your target buyer profile?', context: 'Helps determine appliance tier and finish level', responseType: 'multiple_choice', options: ['First-time buyer', 'Move-up buyer', 'Rental'], priority: 'medium' },
      ],
      suggested_repairs: [
        { repairCode: 'KIT-CAB-REFACE', description: 'Reface cabinets (shaker style, white)', estimatedQuantity: 25, unit: 'lf', confidence: 0.88, reasoning: 'Cabinets structurally sound, refacing more cost effective than replacement' },
        { repairCode: 'KIT-COUNTER-GRANITE', description: 'Granite countertops installed', estimatedQuantity: 42, unit: 'sqft', confidence: 0.90, reasoning: 'Laminate beyond repair, granite adds significant value' },
        { repairCode: 'KIT-FLOOR-LVP', description: 'Luxury vinyl plank flooring', estimatedQuantity: 150, unit: 'sqft', confidence: 0.92, reasoning: 'Existing vinyl flooring beyond repair' },
        { repairCode: 'KIT-SINK-SS', description: 'New stainless sink and faucet', estimatedQuantity: 1, unit: 'ea', confidence: 0.85, reasoning: 'Dated fixtures with slow drip' },
        { repairCode: 'KIT-APPLIANCE-PKG', description: 'Stainless appliance package', estimatedQuantity: 1, unit: 'ea', confidence: 0.93, reasoning: 'Mismatched aging appliances, no dishwasher' },
        { repairCode: 'INT-PAINT-ROOM', description: 'Paint kitchen walls and ceiling', estimatedQuantity: 1, unit: 'room', confidence: 0.95, reasoning: 'Walls show wear and dated color' },
        { repairCode: 'ELEC-OUTLET-GFCI', description: 'Install GFCI outlets on backsplash', estimatedQuantity: 3, unit: 'ea', confidence: 0.80, reasoning: 'Kitchen requires GFCI protection per code' },
      ],
    },
    {
      room: rooms[2], // Master Bathroom
      provider: 'claude',
      condition_score: 3,
      narrative_summary: 'The master bathroom is the most dated room in the property and needs a complete refresh. The tub surround shows grout cracks and possible moisture issues behind the tile. The vanity is original 1985 with a cultured marble top. Toilet is functional but discolored. Floor tile is intact but heavily stained. This bathroom will need a full cosmetic renovation to appeal to today\'s buyers.',
      observations: [
        { category: 'Tub/Shower', description: 'Original tile tub surround with cracked grout lines, possible moisture behind tiles', severity: 'major', confidence: 0.87 },
        { category: 'Vanity', description: 'Original 36-inch vanity with cultured marble top, yellowed and chipped', severity: 'moderate', confidence: 0.92 },
        { category: 'Toilet', description: 'Functional but discolored around base, older low-flow model', severity: 'minor', confidence: 0.88 },
        { category: 'Flooring', description: '12x12 ceramic tile with heavy grout staining, tiles intact', severity: 'moderate', confidence: 0.84 },
      ],
      defects: [
        { type: 'moisture', location: 'Tub surround', severity: 'major', description: 'Cracked grout may indicate moisture behind tiles — potential mold risk' },
        { type: 'material_deterioration', location: 'Vanity', severity: 'moderate', description: 'Cultured marble top chipped and yellowed' },
      ],
      follow_up_questions: [
        { question: 'Is there a musty smell in the bathroom?', context: 'Cracked grout on tub surround suggests possible hidden moisture', responseType: 'yes_no', priority: 'high' },
      ],
      suggested_repairs: [
        { repairCode: 'BATH-TUB-SURROUND', description: 'Replace tub surround (acrylic)', estimatedQuantity: 1, unit: 'ea', confidence: 0.92, reasoning: 'Cracked grout and potential moisture damage behind tiles' },
        { repairCode: 'BATH-VANITY-36', description: '36-inch vanity with granite top', estimatedQuantity: 1, unit: 'ea', confidence: 0.90, reasoning: 'Original vanity is dated and chipped' },
        { repairCode: 'BATH-TOILET', description: 'Replace toilet (comfort height)', estimatedQuantity: 1, unit: 'ea', confidence: 0.85, reasoning: 'Discolored and outdated model' },
        { repairCode: 'BATH-TILE-FLOOR', description: 'New floor tile', estimatedQuantity: 48, unit: 'sqft', confidence: 0.83, reasoning: 'Heavily stained grout, cosmetic upgrade needed' },
        { repairCode: 'INT-PAINT-ROOM', description: 'Paint bathroom', estimatedQuantity: 1, unit: 'room', confidence: 0.95, reasoning: 'Walls need fresh paint' },
        { repairCode: 'ELEC-OUTLET-GFCI', description: 'GFCI outlet installation', estimatedQuantity: 1, unit: 'ea', confidence: 0.78, reasoning: 'Bathroom requires GFCI protection' },
      ],
    },
    {
      room: rooms[3], // Hall Bathroom
      provider: 'claude',
      condition_score: 5,
      narrative_summary: 'The hall bathroom is in slightly better condition than the master. The tub/shower combo is functional with minor cosmetic issues. Vanity is dated but usable. Tile floor is in acceptable condition. A targeted refresh would bring this up to standard.',
      observations: [
        { category: 'Tub/Shower', description: 'Tub/shower combo in fair condition, some caulk discoloration', severity: 'minor', confidence: 0.85 },
        { category: 'Vanity', description: '30-inch vanity, dated but functional', severity: 'minor', confidence: 0.88 },
        { category: 'Flooring', description: 'Vinyl floor in acceptable condition, minor wear at threshold', severity: 'minor', confidence: 0.82 },
      ],
      defects: [
        { type: 'cosmetic', location: 'Caulk around tub', severity: 'minor', description: 'Caulk discolored and needs replacement' },
      ],
      follow_up_questions: [],
      suggested_repairs: [
        { repairCode: 'BATH-VANITY-36', description: 'Replace vanity with modern 30-inch', estimatedQuantity: 1, unit: 'ea', confidence: 0.80, reasoning: 'Dated but functional — cosmetic upgrade for resale appeal' },
        { repairCode: 'BATH-TOILET', description: 'Replace toilet', estimatedQuantity: 1, unit: 'ea', confidence: 0.75, reasoning: 'Older model, upgrading for consistency' },
        { repairCode: 'INT-PAINT-ROOM', description: 'Paint bathroom', estimatedQuantity: 1, unit: 'room', confidence: 0.95, reasoning: 'Fresh paint needed' },
      ],
    },
    {
      room: rooms[4], // Living Room
      provider: 'claude',
      condition_score: 6,
      narrative_summary: 'The living room is in the best condition of the interior spaces. Carpet is worn but no major stains or damage. Walls have nail holes and scuff marks but are structurally sound. Windows allow good natural light. The room would benefit from new flooring and fresh paint to complete the renovation.',
      observations: [
        { category: 'Flooring', description: 'Wall-to-wall carpet showing wear patterns in traffic areas, no major stains', severity: 'moderate', confidence: 0.90 },
        { category: 'Walls', description: 'Nail holes and scuff marks, some hairline cracks at corners (settling)', severity: 'minor', confidence: 0.88 },
        { category: 'Windows', description: 'Double-hung windows in fair condition, good natural light', severity: 'minor', confidence: 0.84 },
        { category: 'Trim', description: 'Original baseboards with paint buildup, some areas missing or damaged', severity: 'minor', confidence: 0.80 },
      ],
      defects: [
        { type: 'wear_and_tear', location: 'Carpet', severity: 'moderate', description: 'Worn carpet in traffic areas, replace with LVP' },
      ],
      follow_up_questions: [],
      suggested_repairs: [
        { repairCode: 'INT-FLOOR-LVP', description: 'Luxury vinyl plank flooring', estimatedQuantity: 280, unit: 'sqft', confidence: 0.92, reasoning: 'Remove carpet, install LVP for modern look and durability' },
        { repairCode: 'INT-PAINT-ROOM', description: 'Paint living room', estimatedQuantity: 1, unit: 'room', confidence: 0.95, reasoning: 'Walls need prep and fresh paint' },
        { repairCode: 'INT-BASEBOARD', description: 'Replace baseboards', estimatedQuantity: 64, unit: 'lf', confidence: 0.80, reasoning: 'Original baseboards damaged in several sections, replace for clean look with new flooring' },
      ],
    },
    {
      room: rooms[5], // Master Bedroom
      provider: 'claude',
      condition_score: 6,
      narrative_summary: 'The master bedroom is in fair condition overall. Carpet is worn but serviceable. Walls need paint. One ceiling stain near the window suggests a past or current roof leak that should be investigated. Closet is standard reach-in style.',
      observations: [
        { category: 'Flooring', description: 'Carpet worn in walkways, no major damage', severity: 'moderate', confidence: 0.88 },
        { category: 'Ceiling', description: 'Water stain approximately 12 inches diameter near window corner', severity: 'major', confidence: 0.91 },
        { category: 'Walls', description: 'Standard drywall in good condition, needs paint', severity: 'minor', confidence: 0.92 },
      ],
      defects: [
        { type: 'water_damage', location: 'Ceiling near window', severity: 'major', description: 'Water stain indicates past or active roof leak — investigate before painting' },
      ],
      follow_up_questions: [
        { question: 'Is the ceiling stain wet or dry to the touch?', context: 'Need to determine if leak is active or historical', responseType: 'multiple_choice', options: ['Wet/damp', 'Dry', 'Not sure'], priority: 'high' },
      ],
      suggested_repairs: [
        { repairCode: 'INT-FLOOR-LVP', description: 'Luxury vinyl plank flooring', estimatedQuantity: 180, unit: 'sqft', confidence: 0.88, reasoning: 'Replace worn carpet with LVP to match rest of home' },
        { repairCode: 'INT-PAINT-ROOM', description: 'Paint bedroom (includes ceiling stain sealing)', estimatedQuantity: 1, unit: 'room', confidence: 0.95, reasoning: 'Walls and ceiling need paint, stain must be sealed with primer first' },
        { repairCode: 'INT-BASEBOARD', description: 'Replace baseboards', estimatedQuantity: 52, unit: 'lf', confidence: 0.78, reasoning: 'Match new baseboards being installed in living room' },
      ],
    },
  ];

  for (const a of analyses) {
    const { data, error } = await supabase
      .from('ai_analyses')
      .insert({
        room_id: a.room.id,
        ai_provider: a.provider,
        model_version: 'claude-sonnet-4-20250514',
        observations: a.observations,
        defects: a.defects,
        condition_score: a.condition_score,
        follow_up_questions: a.follow_up_questions,
        suggested_repairs: a.suggested_repairs,
        narrative_summary: a.narrative_summary,
        tokens_used: Math.floor(Math.random() * 2000) + 1500,
        latency_ms: Math.floor(Math.random() * 5000) + 3000,
      })
      .select()
      .single();

    if (error) { console.error(`Analysis insert error for ${a.room.room_label}:`, error); continue; }
    console.log(`  Analysis: ${a.room.room_label} — score ${a.condition_score}/10`);

    // Insert repair items for rooms with status 'items_selected'
    if (a.room.status === 'items_selected') {
      const locationFactor = 0.92; // Springfield IL
      for (let i = 0; i < a.suggested_repairs.length; i++) {
        const repair = a.suggested_repairs[i];
        // Look up base cost
        const { data: baseCost } = await supabase
          .from('base_costs')
          .select('base_unit_cost')
          .eq('repair_code', repair.repairCode)
          .single();

        const unitCost = baseCost
          ? parseFloat((baseCost.base_unit_cost * locationFactor).toFixed(2))
          : parseFloat((repair.estimatedQuantity > 100 ? 6.00 : 400.00).toFixed(2));

        await supabase.from('repair_items').insert({
          property_id: propertyId,
          room_id: a.room.id,
          analysis_id: data.id,
          repair_code: repair.repairCode,
          category: repair.repairCode.split('-')[0] === 'EXT' ? 'Exterior' :
                    repair.repairCode.split('-')[0] === 'KIT' ? 'Kitchen' :
                    repair.repairCode.split('-')[0] === 'BATH' ? 'Bathroom' :
                    repair.repairCode.split('-')[0] === 'INT' ? 'Interior' :
                    repair.repairCode.split('-')[0] === 'ELEC' ? 'Electrical' :
                    repair.repairCode.split('-')[0] === 'PLUMB' ? 'Plumbing' :
                    repair.repairCode.split('-')[0] === 'GEN' ? 'General' : 'Other',
          description: repair.description,
          quantity: repair.estimatedQuantity,
          unit: repair.unit,
          unit_cost: unitCost,
          is_selected: true,
          is_ai_suggested: true,
          source: 'ai',
          sort_order: i,
        });
      }
      console.log(`    + ${a.suggested_repairs.length} repair items`);
    }
  }

  // -----------------------------------------------
  // 5. ADD GENERAL LINE ITEMS (dumpster + permits)
  // -----------------------------------------------
  const generalItems = [
    { repair_code: 'GEN-DUMPSTER', category: 'General', description: 'Dumpster rental (20-yard)', quantity: 2, unit: 'ea', unit_cost: 414.00 },
    { repair_code: 'GEN-PERMITS', category: 'General', description: 'Building permits and inspections', quantity: 1, unit: 'ea', unit_cost: 1104.00 },
  ];

  for (const item of generalItems) {
    await supabase.from('repair_items').insert({
      property_id: propertyId,
      ...item,
      is_selected: true,
      is_ai_suggested: false,
      is_user_added: true,
      source: 'user',
    });
  }
  console.log('  + General line items (dumpster, permits)');

  // -----------------------------------------------
  // DONE
  // -----------------------------------------------
  console.log('\n========================================');
  console.log('Demo property seeded successfully!');
  console.log(`Property: 742 Evergreen Terrace, Springfield IL`);
  console.log(`ID: ${propertyId}`);
  console.log(`Rooms: ${rooms.length}`);
  console.log('========================================');
  console.log('\nOpen the app and navigate to this property to see the full output:');
  console.log('  - Tap a room to see AI analysis results');
  console.log('  - Go to Estimate to see the categorized cost breakdown');
  console.log('  - Go to Scope of Work for contractor-ready documents');
  console.log('  - Go to Export to generate a PDF');
}

main().catch(console.error);
