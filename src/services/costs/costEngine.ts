import { supabase } from '../supabase/client';
import type { BaseCost, LocationFactor } from '../../types/estimate';

// Cache for location factors and base costs
let locationFactorsCache: Map<string, LocationFactor> = new Map();
let baseCostsCache: Map<string, BaseCost> = new Map();

export async function loadBaseCosts(): Promise<void> {
  if (baseCostsCache.size > 0) return;

  const { data, error } = await supabase
    .from('base_costs')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;

  baseCostsCache = new Map(
    (data ?? []).map((row: any) => [
      row.repair_code,
      {
        id: row.id,
        repairCode: row.repair_code,
        category: row.category,
        subcategory: row.subcategory,
        description: row.description,
        unit: row.unit,
        baseUnitCost: row.base_unit_cost,
        minCost: row.min_cost,
        maxCost: row.max_cost,
        typicalQuantityHint: row.typical_quantity_hint,
        applicableRoomTypes: row.applicable_room_types ?? [],
        rehabLevels: row.rehab_levels ?? [],
      },
    ])
  );
}

export async function getLocationFactor(zipCode: string): Promise<LocationFactor> {
  const zipPrefix = zipCode.substring(0, 3);

  if (locationFactorsCache.has(zipPrefix)) {
    return locationFactorsCache.get(zipPrefix)!;
  }

  const { data, error } = await supabase
    .from('location_factors')
    .select('*')
    .eq('zip_prefix', zipPrefix)
    .single();

  if (error || !data) {
    // Return national average (1.0) if no match found
    return {
      zipPrefix,
      state: '',
      materialFactor: 1.0,
      laborFactor: 1.0,
      combinedFactor: 1.0,
    };
  }

  const factor: LocationFactor = {
    zipPrefix: data.zip_prefix,
    city: data.city,
    state: data.state,
    materialFactor: data.material_factor,
    laborFactor: data.labor_factor,
    combinedFactor: data.combined_factor,
  };

  locationFactorsCache.set(zipPrefix, factor);
  return factor;
}

export function getBaseCost(repairCode: string): BaseCost | undefined {
  return baseCostsCache.get(repairCode);
}

export function getBaseCostsByCategory(category: string): BaseCost[] {
  return Array.from(baseCostsCache.values()).filter(
    (cost) => cost.category === category
  );
}

export function getBaseCostsForRoom(roomType: string): BaseCost[] {
  return Array.from(baseCostsCache.values()).filter((cost) =>
    cost.applicableRoomTypes.includes(roomType)
  );
}

export function calculateAdjustedCost(
  baseUnitCost: number,
  locationFactor: LocationFactor
): number {
  return Math.round(baseUnitCost * locationFactor.combinedFactor * 100) / 100;
}

export function calculateLineItemTotal(
  quantity: number,
  unitCost: number
): number {
  return Math.round(quantity * unitCost * 100) / 100;
}

export function calculateEstimateTotal(
  lineItems: { quantity: number; unitCost: number; isSelected: boolean }[],
  contingencyPct: number = 15
): {
  subtotal: number;
  contingencyAmt: number;
  total: number;
} {
  const subtotal = lineItems
    .filter((item) => item.isSelected)
    .reduce((sum, item) => sum + calculateLineItemTotal(item.quantity, item.unitCost), 0);

  const contingencyAmt = Math.round(subtotal * (contingencyPct / 100));
  const total = subtotal + contingencyAmt;

  return { subtotal, contingencyAmt, total };
}

export function clearCostCaches(): void {
  locationFactorsCache.clear();
  baseCostsCache.clear();
}
