-- SnapRehab Base Cost Data
-- National average costs for common rehab line items
-- These will be adjusted by location factors per zip code

INSERT INTO public.base_costs (repair_code, category, subcategory, description, unit, base_material_cost, base_labor_cost, base_unit_cost, min_cost, max_cost, typical_quantity_hint, applicable_room_types, rehab_levels, is_active, data_source) VALUES

-- EXTERIOR
('EXT-SIDING-VINYL', 'exterior', 'siding', 'Vinyl siding replacement', 'SF', 2.50, 3.00, 5.50, 4.00, 8.00, 'per SF of exterior wall area', '{exterior_front,exterior_rear,exterior_left,exterior_right}', '{moderate,full_gut}', true, 'national_avg'),
('EXT-SIDING-PAINT', 'exterior', 'siding', 'Exterior paint (siding + trim)', 'SF', 0.80, 1.50, 2.30, 1.50, 4.00, 'per SF of exterior wall area', '{exterior_front,exterior_rear,exterior_left,exterior_right}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('EXT-SIDING-HARDI', 'exterior', 'siding', 'HardiPlank fiber cement siding', 'SF', 4.00, 4.50, 8.50, 6.50, 12.00, 'per SF of exterior wall area', '{exterior_front,exterior_rear,exterior_left,exterior_right}', '{moderate,full_gut}', true, 'national_avg'),
('EXT-ROOF-SHINGLE-ARCH', 'exterior', 'roof', 'Architectural shingle re-roof', 'SQ', 180.00, 270.00, 450.00, 350.00, 600.00, 'per roofing square (100 SF)', '{exterior_roof}', '{moderate,full_gut}', true, 'national_avg'),
('EXT-ROOF-SHINGLE-3TAB', 'exterior', 'roof', '3-tab shingle re-roof', 'SQ', 120.00, 200.00, 320.00, 250.00, 450.00, 'per roofing square (100 SF)', '{exterior_roof}', '{cosmetic,moderate}', true, 'national_avg'),
('EXT-GUTTER-SEAMLESS', 'exterior', 'gutters', 'Seamless aluminum gutters', 'LF', 3.50, 4.50, 8.00, 6.00, 12.00, 'per LF of gutter run', '{exterior_front,exterior_rear,exterior_left,exterior_right}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('EXT-GUTTER-DOWNSPOUT', 'exterior', 'gutters', 'Downspout replacement', 'EA', 30.00, 45.00, 75.00, 50.00, 120.00, 'per downspout', '{exterior_front,exterior_rear,exterior_left,exterior_right}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('EXT-FNDTN-CRACK-REPAIR', 'exterior', 'foundation', 'Foundation crack repair + seal', 'LS', 400.00, 800.00, 1200.00, 500.00, 3000.00, 'lump sum per occurrence', '{exterior_foundation}', '{moderate,full_gut}', true, 'national_avg'),
('EXT-WINDOW-VINYL', 'exterior', 'windows', 'Vinyl replacement window', 'EA', 200.00, 150.00, 350.00, 250.00, 600.00, 'per window', '{exterior_front,exterior_rear,exterior_left,exterior_right}', '{moderate,full_gut}', true, 'national_avg'),
('EXT-DOOR-ENTRY', 'exterior', 'doors', 'Entry door replacement (steel)', 'EA', 350.00, 250.00, 600.00, 400.00, 1200.00, 'per door', '{exterior_front}', '{moderate,full_gut}', true, 'national_avg'),
('EXT-PORCH-REPAIR', 'exterior', 'porch', 'Front porch/step repair', 'LS', 300.00, 500.00, 800.00, 400.00, 2000.00, 'lump sum', '{exterior_front}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('EXT-DRIVEWAY-CONCRETE', 'exterior', 'concrete', 'Concrete driveway pour', 'SF', 4.00, 4.00, 8.00, 6.00, 12.00, 'per SF', '{exterior_driveway}', '{full_gut}', true, 'national_avg'),
('EXT-DRIVEWAY-PATCH', 'exterior', 'concrete', 'Concrete driveway patching', 'SF', 2.00, 3.00, 5.00, 3.00, 8.00, 'per SF of repair area', '{exterior_driveway}', '{cosmetic,moderate}', true, 'national_avg'),
('EXT-LANDSCAPING', 'exterior', 'landscaping', 'Basic landscaping cleanup + plantings', 'LS', 600.00, 900.00, 1500.00, 800.00, 3000.00, 'lump sum', '{exterior_front,exterior_rear}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('EXT-FENCE-WOOD', 'exterior', 'fencing', 'Wood privacy fence', 'LF', 12.00, 13.00, 25.00, 18.00, 35.00, 'per LF', '{exterior_rear}', '{moderate,full_gut}', true, 'national_avg'),
('EXT-DECK-COMPOSITE', 'exterior', 'deck', 'Composite deck build', 'SF', 15.00, 15.00, 30.00, 22.00, 45.00, 'per SF', '{exterior_rear}', '{moderate,full_gut}', true, 'national_avg'),
('EXT-DECK-REPAIR', 'exterior', 'deck', 'Wood deck repair/refinish', 'SF', 3.00, 5.00, 8.00, 5.00, 15.00, 'per SF', '{exterior_rear}', '{cosmetic,moderate}', true, 'national_avg'),
('EXT-GARAGE-DOOR', 'exterior', 'garage', 'Garage door replacement (2-car)', 'EA', 800.00, 400.00, 1200.00, 800.00, 2500.00, 'per door', '{exterior_garage}', '{moderate,full_gut}', true, 'national_avg'),

-- KITCHEN
('KIT-CAB-REPLACE-SHAKER', 'kitchen', 'cabinets', 'Replace cabinets (white shaker)', 'LF', 100.00, 75.00, 175.00, 120.00, 280.00, 'per LF of cabinet run', '{kitchen}', '{moderate,full_gut}', true, 'national_avg'),
('KIT-CAB-PAINT', 'kitchen', 'cabinets', 'Paint existing cabinets', 'LF', 15.00, 25.00, 40.00, 25.00, 65.00, 'per LF of cabinet run', '{kitchen}', '{cosmetic,moderate}', true, 'national_avg'),
('KIT-CAB-REFACE', 'kitchen', 'cabinets', 'Reface cabinets (new doors + veneer)', 'LF', 60.00, 40.00, 100.00, 75.00, 150.00, 'per LF of cabinet run', '{kitchen}', '{moderate}', true, 'national_avg'),
('KIT-CAB-HARDWARE', 'kitchen', 'cabinets', 'Cabinet hardware (knobs + pulls)', 'EA', 5.00, 0.00, 5.00, 3.00, 12.00, 'per piece', '{kitchen}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('KIT-COUNT-QUARTZ', 'kitchen', 'countertops', 'Quartz countertops installed', 'SF', 40.00, 25.00, 65.00, 50.00, 100.00, 'per SF of counter area', '{kitchen}', '{moderate,full_gut}', true, 'national_avg'),
('KIT-COUNT-GRANITE', 'kitchen', 'countertops', 'Granite countertops installed', 'SF', 35.00, 25.00, 60.00, 45.00, 90.00, 'per SF of counter area', '{kitchen}', '{moderate,full_gut}', true, 'national_avg'),
('KIT-COUNT-LAMINATE', 'kitchen', 'countertops', 'Laminate countertops installed', 'SF', 12.00, 13.00, 25.00, 18.00, 40.00, 'per SF of counter area', '{kitchen}', '{cosmetic}', true, 'national_avg'),
('KIT-COUNT-BUTCHER', 'kitchen', 'countertops', 'Butcher block countertops', 'SF', 25.00, 15.00, 40.00, 30.00, 60.00, 'per SF of counter area', '{kitchen}', '{cosmetic,moderate}', true, 'national_avg'),
('KIT-APPL-SS-PACKAGE', 'kitchen', 'appliances', 'Stainless steel appliance package (range, fridge, DW, micro)', 'Set', 2400.00, 400.00, 2800.00, 2000.00, 4500.00, 'per set', '{kitchen}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('KIT-SINK-UNDERMOUNT', 'kitchen', 'plumbing', 'Undermount SS sink + pull-down faucet', 'EA', 250.00, 100.00, 350.00, 200.00, 600.00, 'per sink', '{kitchen}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('KIT-BACKSPLASH-SUBWAY', 'kitchen', 'tile', 'Subway tile backsplash installed', 'SF', 8.00, 10.00, 18.00, 12.00, 30.00, 'per SF of backsplash area', '{kitchen}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('KIT-DISPOSAL', 'kitchen', 'plumbing', 'Garbage disposal', 'EA', 100.00, 80.00, 180.00, 120.00, 300.00, 'per unit', '{kitchen}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),

-- BATHROOM
('BATH-VANITY-36', 'bathroom', 'vanity', '36-inch bathroom vanity with top', 'EA', 250.00, 150.00, 400.00, 250.00, 700.00, 'per vanity', '{bathroom}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('BATH-VANITY-60', 'bathroom', 'vanity', '60-inch double vanity with top', 'EA', 500.00, 200.00, 700.00, 450.00, 1200.00, 'per vanity', '{bathroom}', '{moderate,full_gut}', true, 'national_avg'),
('BATH-TOILET-STANDARD', 'bathroom', 'fixtures', 'Standard toilet replacement', 'EA', 150.00, 100.00, 250.00, 180.00, 400.00, 'per toilet', '{bathroom}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('BATH-TUB-SURROUND', 'bathroom', 'tub', 'Tub/shower surround (acrylic)', 'EA', 400.00, 350.00, 750.00, 500.00, 1200.00, 'per tub/shower', '{bathroom}', '{cosmetic,moderate}', true, 'national_avg'),
('BATH-TUB-TILE-SURROUND', 'bathroom', 'tub', 'Tile tub/shower surround', 'SF', 10.00, 12.00, 22.00, 15.00, 35.00, 'per SF of tile area', '{bathroom}', '{moderate,full_gut}', true, 'national_avg'),
('BATH-TILE-FLOOR', 'bathroom', 'flooring', 'Bathroom floor tile', 'SF', 5.00, 8.00, 13.00, 8.00, 22.00, 'per SF of floor area', '{bathroom}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('BATH-MIRROR', 'bathroom', 'fixtures', 'Bathroom mirror replacement', 'EA', 60.00, 30.00, 90.00, 40.00, 200.00, 'per mirror', '{bathroom}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('BATH-FAUCET', 'bathroom', 'fixtures', 'Bathroom faucet replacement', 'EA', 80.00, 60.00, 140.00, 80.00, 250.00, 'per faucet', '{bathroom}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('BATH-LIGHT-FIXTURE', 'bathroom', 'electrical', 'Bathroom vanity light fixture', 'EA', 50.00, 40.00, 90.00, 50.00, 200.00, 'per fixture', '{bathroom}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('BATH-EXHAUST-FAN', 'bathroom', 'ventilation', 'Exhaust fan replacement', 'EA', 40.00, 80.00, 120.00, 80.00, 250.00, 'per fan', '{bathroom}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('BATH-SHOWER-DOOR', 'bathroom', 'tub', 'Frameless glass shower door', 'EA', 600.00, 200.00, 800.00, 500.00, 1500.00, 'per door', '{bathroom}', '{moderate,full_gut}', true, 'national_avg'),
('BATH-ACCESSORIES', 'bathroom', 'fixtures', 'Bathroom accessory set (towel bars, TP holder, etc.)', 'Set', 40.00, 30.00, 70.00, 40.00, 150.00, 'per set', '{bathroom}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),

-- FLOORING (cross-room)
('FLR-LVP', 'flooring', 'vinyl', 'Luxury vinyl plank flooring (LVP)', 'SF', 2.50, 2.00, 4.50, 3.00, 7.00, 'per SF of floor area', '{kitchen,living_room,bedroom,dining_room,hallway,office}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('FLR-CARPET', 'flooring', 'carpet', 'Carpet installation', 'SF', 2.00, 1.50, 3.50, 2.50, 6.00, 'per SF of floor area', '{bedroom}', '{cosmetic,moderate}', true, 'national_avg'),
('FLR-HARDWOOD-REFINISH', 'flooring', 'hardwood', 'Hardwood floor refinishing', 'SF', 1.00, 2.50, 3.50, 2.50, 5.00, 'per SF of floor area', '{kitchen,living_room,bedroom,dining_room,hallway}', '{cosmetic,moderate}', true, 'national_avg'),
('FLR-HARDWOOD-NEW', 'flooring', 'hardwood', 'New hardwood floor installation', 'SF', 5.00, 4.00, 9.00, 6.00, 14.00, 'per SF of floor area', '{kitchen,living_room,bedroom,dining_room,hallway}', '{moderate,full_gut}', true, 'national_avg'),
('FLR-TILE-CERAMIC', 'flooring', 'tile', 'Ceramic tile flooring', 'SF', 4.00, 6.00, 10.00, 7.00, 16.00, 'per SF of floor area', '{kitchen,bathroom,laundry}', '{moderate,full_gut}', true, 'national_avg'),

-- PAINTING (cross-room)
('PAINT-INT-WALLS', 'painting', 'interior', 'Interior wall painting (2 coats)', 'SF', 0.30, 1.00, 1.30, 0.80, 2.00, 'per SF of wall area', '{kitchen,bathroom,bedroom,living_room,dining_room,hallway,office,laundry}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('PAINT-INT-TRIM', 'painting', 'interior', 'Interior trim painting', 'LF', 0.40, 1.10, 1.50, 1.00, 2.50, 'per LF of trim', '{kitchen,bathroom,bedroom,living_room,dining_room,hallway,office}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('PAINT-INT-CEILING', 'painting', 'interior', 'Ceiling painting', 'SF', 0.20, 0.80, 1.00, 0.60, 1.50, 'per SF of ceiling', '{kitchen,bathroom,bedroom,living_room,dining_room,hallway,office}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('PAINT-INT-DOORS', 'painting', 'interior', 'Interior door painting', 'EA', 15.00, 35.00, 50.00, 30.00, 80.00, 'per door', '{bedroom,hallway}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),

-- ELECTRICAL
('ELEC-PANEL-200A', 'electrical', 'panel', '200-amp electrical panel upgrade', 'LS', 800.00, 1700.00, 2500.00, 1800.00, 4000.00, 'per panel', '{electrical_panel}', '{moderate,full_gut}', true, 'national_avg'),
('ELEC-PANEL-SUBPANEL', 'electrical', 'panel', 'Sub-panel installation', 'LS', 400.00, 600.00, 1000.00, 700.00, 1500.00, 'per sub-panel', '{electrical_panel}', '{full_gut}', true, 'national_avg'),
('ELEC-OUTLET-REPLACE', 'electrical', 'outlets', 'Outlet/switch replacement', 'EA', 5.00, 15.00, 20.00, 12.00, 35.00, 'per outlet/switch', '{kitchen,bathroom,bedroom,living_room}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('ELEC-OUTLET-GFCI', 'electrical', 'outlets', 'GFCI outlet installation', 'EA', 15.00, 25.00, 40.00, 25.00, 60.00, 'per outlet', '{kitchen,bathroom,laundry}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('ELEC-LIGHT-RECESSED', 'electrical', 'lighting', 'Recessed LED light installation', 'EA', 25.00, 60.00, 85.00, 50.00, 150.00, 'per fixture', '{kitchen,bathroom,living_room}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('ELEC-LIGHT-PENDANT', 'electrical', 'lighting', 'Pendant light installation', 'EA', 50.00, 50.00, 100.00, 60.00, 250.00, 'per fixture', '{kitchen,dining_room}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('ELEC-LIGHT-CEILING', 'electrical', 'lighting', 'Ceiling light fixture replacement', 'EA', 30.00, 40.00, 70.00, 40.00, 150.00, 'per fixture', '{bedroom,hallway,living_room}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('ELEC-FAN-CEILING', 'electrical', 'lighting', 'Ceiling fan installation', 'EA', 80.00, 80.00, 160.00, 100.00, 300.00, 'per fan', '{bedroom,living_room}', '{cosmetic,moderate}', true, 'national_avg'),
('ELEC-SMOKE-DETECT', 'electrical', 'safety', 'Hardwired smoke/CO detector', 'EA', 30.00, 30.00, 60.00, 40.00, 100.00, 'per detector', '{hallway,bedroom}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),

-- PLUMBING
('PLUMB-WATER-HEATER-40G', 'plumbing', 'water_heater', '40-gallon gas water heater', 'EA', 500.00, 400.00, 900.00, 700.00, 1500.00, 'per unit', '{water_heater}', '{moderate,full_gut}', true, 'national_avg'),
('PLUMB-WATER-HEATER-50G', 'plumbing', 'water_heater', '50-gallon gas water heater', 'EA', 600.00, 400.00, 1000.00, 800.00, 1600.00, 'per unit', '{water_heater}', '{moderate,full_gut}', true, 'national_avg'),
('PLUMB-WATER-HEATER-ELEC', 'plumbing', 'water_heater', '40-gallon electric water heater', 'EA', 350.00, 350.00, 700.00, 500.00, 1100.00, 'per unit', '{water_heater}', '{moderate,full_gut}', true, 'national_avg'),
('PLUMB-REPIPE-PEX', 'plumbing', 'piping', 'Whole house re-pipe (PEX)', 'LS', 1500.00, 3000.00, 4500.00, 3000.00, 8000.00, 'lump sum', '{utility}', '{full_gut}', true, 'national_avg'),
('PLUMB-FIXTURE-REPLACE', 'plumbing', 'fixtures', 'General plumbing fixture replacements', 'LS', 600.00, 1200.00, 1800.00, 1000.00, 3000.00, 'lump sum', '{kitchen,bathroom}', '{moderate,full_gut}', true, 'national_avg'),
('PLUMB-DRAIN-CLEAN', 'plumbing', 'drain', 'Main drain clean-out / snake', 'LS', 50.00, 200.00, 250.00, 150.00, 500.00, 'per occurrence', '{utility}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),

-- HVAC
('HVAC-FURNACE-GAS', 'hvac', 'heating', 'Gas furnace replacement', 'EA', 1500.00, 1500.00, 3000.00, 2200.00, 5000.00, 'per unit', '{hvac}', '{moderate,full_gut}', true, 'national_avg'),
('HVAC-AC-CENTRAL', 'hvac', 'cooling', 'Central AC unit replacement', 'EA', 2000.00, 1500.00, 3500.00, 2500.00, 6000.00, 'per unit', '{hvac}', '{moderate,full_gut}', true, 'national_avg'),
('HVAC-THERMOSTAT', 'hvac', 'controls', 'Smart thermostat installation', 'EA', 150.00, 80.00, 230.00, 150.00, 400.00, 'per unit', '{hvac}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('HVAC-SERVICE', 'hvac', 'maintenance', 'HVAC service + tune-up', 'LS', 50.00, 150.00, 200.00, 100.00, 400.00, 'per service', '{hvac}', '{cosmetic,moderate}', true, 'national_avg'),
('HVAC-DUCT-SEAL', 'hvac', 'ductwork', 'Ductwork sealing/repair', 'LS', 200.00, 400.00, 600.00, 300.00, 1200.00, 'lump sum', '{hvac}', '{moderate,full_gut}', true, 'national_avg'),

-- STRUCTURAL
('STRUCT-SUBFLOOR-REPAIR', 'structural', 'subfloor', 'Subfloor repair (plywood)', 'SF', 2.00, 4.00, 6.00, 4.00, 10.00, 'per SF of repair area', '{kitchen,bathroom}', '{moderate,full_gut}', true, 'national_avg'),
('STRUCT-FRAMING-REPAIR', 'structural', 'framing', 'Wall/ceiling framing repair', 'LF', 5.00, 10.00, 15.00, 10.00, 25.00, 'per LF', '{bedroom,living_room}', '{full_gut}', true, 'national_avg'),
('STRUCT-DRYWALL-PATCH', 'structural', 'drywall', 'Drywall patch and repair', 'SF', 1.50, 2.50, 4.00, 2.50, 6.00, 'per SF', '{kitchen,bathroom,bedroom,living_room,hallway}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('STRUCT-DRYWALL-NEW', 'structural', 'drywall', 'New drywall installation', 'SF', 1.00, 1.50, 2.50, 1.50, 4.00, 'per SF of wall area', '{kitchen,bathroom,bedroom,living_room}', '{full_gut}', true, 'national_avg'),
('STRUCT-INSULATION', 'structural', 'insulation', 'Wall insulation (fiberglass batt)', 'SF', 0.80, 0.70, 1.50, 1.00, 2.50, 'per SF of wall cavity', '{bedroom,living_room}', '{full_gut}', true, 'national_avg'),

-- GENERAL
('GEN-DUMPSTER-30YD', 'general', 'demo', '30-yard roll-off dumpster', 'EA', 550.00, 0.00, 550.00, 400.00, 750.00, 'per dumpster rental', '{}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('GEN-DUMPSTER-20YD', 'general', 'demo', '20-yard roll-off dumpster', 'EA', 400.00, 0.00, 400.00, 300.00, 550.00, 'per dumpster rental', '{}', '{cosmetic,moderate}', true, 'national_avg'),
('GEN-PERMITS', 'general', 'admin', 'Building permits (estimated)', 'LS', 800.00, 0.00, 800.00, 200.00, 2000.00, 'lump sum', '{}', '{moderate,full_gut}', true, 'national_avg'),
('GEN-CLEANUP', 'general', 'demo', 'Final construction cleanup', 'LS', 100.00, 400.00, 500.00, 300.00, 1000.00, 'lump sum', '{}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('GEN-DEMO-INTERIOR', 'general', 'demo', 'Interior demolition', 'SF', 1.00, 2.00, 3.00, 2.00, 5.00, 'per SF of floor area demolished', '{}', '{moderate,full_gut}', true, 'national_avg'),
('GEN-HAUL-AWAY', 'general', 'demo', 'Debris haul-away (per load)', 'EA', 100.00, 100.00, 200.00, 150.00, 350.00, 'per truckload', '{}', '{cosmetic,moderate,full_gut}', true, 'national_avg'),
('GEN-INT-DOOR', 'general', 'doors', 'Interior door replacement (hollow core)', 'EA', 50.00, 60.00, 110.00, 80.00, 180.00, 'per door', '{bedroom,bathroom,hallway}', '{moderate,full_gut}', true, 'national_avg'),
('GEN-BASEBOARD', 'general', 'trim', 'Baseboard installation', 'LF', 1.50, 2.50, 4.00, 3.00, 7.00, 'per LF', '{kitchen,bathroom,bedroom,living_room,dining_room,hallway}', '{moderate,full_gut}', true, 'national_avg'),
('GEN-CLOSET-SHELF', 'general', 'storage', 'Wire closet shelving system', 'EA', 40.00, 30.00, 70.00, 40.00, 120.00, 'per closet', '{bedroom}', '{cosmetic,moderate,full_gut}', true, 'national_avg')

ON CONFLICT (repair_code) DO UPDATE SET
  description = EXCLUDED.description,
  base_unit_cost = EXCLUDED.base_unit_cost,
  min_cost = EXCLUDED.min_cost,
  max_cost = EXCLUDED.max_cost,
  updated_at = NOW();
