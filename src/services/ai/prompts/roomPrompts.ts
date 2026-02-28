import type { RoomType } from '../../../types/room';
import type { RehabLevel } from '../types';

const ROOM_PROMPTS: Partial<Record<RoomType, string>> = {
  exterior_front: `Analyze the front exterior of this residential property. Focus on:
- Siding/exterior material condition (type, damage, paint peeling, rot)
- Front porch/steps condition and safety
- Windows visible from this angle (type, condition, seals)
- Front door condition
- Landscaping state and curb appeal
- Visible gutters and downspouts
- Any structural concerns visible from the front`,

  exterior_roof: `Analyze the roof of this residential property. Focus on:
- Shingle/roofing material type and condition
- Missing, curling, or damaged shingles
- Ridge line straightness (sagging = structural issue)
- Flashing condition around penetrations
- Gutter condition and attachment
- Any visible moss, algae, or debris
- Estimated remaining roof life based on what you see`,

  exterior_foundation: `Analyze the foundation of this property. Focus on:
- Visible cracks (horizontal cracks are more concerning than vertical)
- Efflorescence (white mineral deposits indicating water penetration)
- Water staining or tide marks
- Foundation material type (poured concrete, block, stone)
- Grade of soil relative to foundation (soil should slope away)
- Any visible repairs or patches
- Exposed rebar or deterioration`,

  kitchen: `Analyze this kitchen. Focus on:
- Cabinet style, material, condition (doors closing properly? hardware condition?)
- Countertop material and condition (chips, burns, stains, seams)
- Flooring type and condition
- Appliances visible (brand, age estimate, condition, stainless vs not)
- Sink and faucet condition
- Backsplash presence and condition
- Lighting type and adequacy
- Any water damage (especially under sink area, near dishwasher)
- General layout functionality
- Ceiling condition
- Wall condition and paint`,

  bathroom: `Analyze this bathroom. Focus on:
- Vanity type, size, and condition
- Toilet condition and style (round vs elongated, height)
- Tub/shower type (insert, tile surround, walk-in)
- Tile condition (grout, caulk, cracking, mold/mildew)
- Flooring type and condition (look for soft spots near wet areas)
- Fixture style and condition (faucet, showerhead)
- Mirror condition
- Ventilation (fan present?)
- Signs of water damage (floor near tub, ceiling stains, wall bubbling)
- Lighting adequacy`,

  bedroom: `Analyze this bedroom. Focus on:
- Flooring type and condition
- Wall condition (cracks, nail pops, water stains)
- Ceiling condition (texture type, stains, cracks)
- Window condition and style
- Closet doors visible
- Electrical outlets visible (quantity, style, grounded?)
- Lighting fixtures
- Door and trim condition
- Overall room size estimate from the photo`,

  living_room: `Analyze this living room/family room. Focus on:
- Flooring type and condition
- Wall condition
- Ceiling condition (popcorn ceiling? stains?)
- Windows (type, condition, number visible)
- Fireplace if present (type, condition)
- Built-in features
- Lighting
- Trim and baseboards condition
- Overall room proportions`,

  hvac: `Analyze this HVAC system. Focus on:
- Equipment type (forced air furnace, heat pump, boiler, wall unit)
- Fuel type if identifiable (gas, electric, oil)
- Estimated age from visible condition and style
- Brand if visible
- Filter area condition
- Visible rust or corrosion
- Ductwork condition if visible
- Thermostat type (manual, programmable, smart)
- Any safety concerns`,

  electrical_panel: `Analyze this electrical panel. Focus on:
- Panel amperage (100A, 150A, 200A)
- Brand (Federal Pacific and Zinsco are safety concerns)
- Breaker types (standard, AFCI, GFCI)
- Panel condition (rust, overheating signs, double-tapped breakers)
- Labeling quality
- Available space for additional circuits
- Main disconnect present?
- Any visible code violations`,

  water_heater: `Analyze this water heater. Focus on:
- Type (tank, tankless)
- Fuel type (gas, electric)
- Capacity (gallons) if visible
- Brand and model if visible
- Age indicators (manufacturing date, condition)
- Rust or corrosion
- T&P valve and discharge pipe present?
- Expansion tank present?
- Any signs of leaking`,
};

const DEFAULT_PROMPT = `Analyze this room/space in the property. Focus on:
- Flooring type and condition
- Wall condition
- Ceiling condition
- Windows and doors
- Fixtures and features
- Any damage or issues requiring repair
- Overall condition assessment`;

export function getRoomPrompt(roomType: RoomType): string {
  return ROOM_PROMPTS[roomType] ?? DEFAULT_PROMPT;
}

export function getRehabContext(rehabLevel: RehabLevel): string {
  switch (rehabLevel) {
    case 'cosmetic':
      return `This is a COSMETIC rehab. The investor plans to do surface-level updates only: paint, flooring, fixtures, hardware, light landscaping. Focus on what's visually outdated or damaged on the surface. Don't recommend structural or systems work unless there's a clear safety concern.`;
    case 'moderate':
      return `This is a MODERATE rehab. The investor plans to update kitchens and bathrooms, replace flooring throughout, potentially update some systems. Identify both cosmetic issues and moderate functional problems. Recommend upgrades that would bring this to market-competitive condition.`;
    case 'full_gut':
      return `This is a FULL GUT rehab. Everything is being taken down to studs. Focus on structural issues, systems condition (electrical, plumbing, HVAC), and any code compliance concerns. All finishes will be replaced, so don't focus on cosmetic condition — focus on what's behind the walls and the structural integrity.`;
  }
}

export function buildAnalysisPrompt(
  roomType: RoomType,
  rehabLevel: RehabLevel,
  yearBuilt?: number,
  previousContext?: string[]
): string {
  const roomPrompt = getRoomPrompt(roomType);
  const rehabContext = getRehabContext(rehabLevel);

  let prompt = `${roomPrompt}\n\n${rehabContext}`;

  if (yearBuilt) {
    prompt += `\n\nThis property was built in ${yearBuilt}. Consider common issues for homes of this era:`;
    if (yearBuilt < 1978) prompt += '\n- Potential lead paint';
    if (yearBuilt < 1980) prompt += '\n- Potential asbestos in flooring, insulation, or popcorn ceilings';
    if (yearBuilt < 1960) prompt += '\n- Possible knob-and-tube or aluminum wiring';
    if (yearBuilt < 1970) prompt += '\n- Possible cast iron drain pipes nearing end of life';
    if (yearBuilt < 1990) prompt += '\n- Original windows likely single-pane';
    if (yearBuilt > 2000) prompt += '\n- Relatively modern construction, focus on maintenance issues';
  }

  if (previousContext && previousContext.length > 0) {
    prompt += `\n\nContext from other rooms already analyzed:\n${previousContext.join('\n')}`;
  }

  prompt += '\n\nRespond with ONLY the JSON object as specified in your system instructions. No other text.';

  return prompt;
}
