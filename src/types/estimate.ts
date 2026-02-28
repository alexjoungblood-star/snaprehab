export interface RepairItem {
  id: string;
  propertyId: string;
  roomId?: string;
  analysisId?: string;
  repairCode: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  isSelected: boolean;
  isAiSuggested: boolean;
  isUserAdded: boolean;
  source: 'ai' | 'user' | 'template';
  notes?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Estimate {
  id: string;
  propertyId: string;
  version: number;
  subtotal: number;
  contingencyPct: number;
  contingencyAmt: number;
  total: number;
  locationFactor: number;
  pdfStoragePath?: string;
  status: 'draft' | 'finalized' | 'exported';
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScopeOfWork {
  id: string;
  propertyId: string;
  estimateId?: string;
  content: SOWSection[];
  pdfStoragePath?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SOWSection {
  roomLabel: string;
  roomType: string;
  items: SOWItem[];
}

export interface SOWItem {
  stepNumber: number;
  description: string;
  quantity?: number;
  unit?: string;
  specification?: string;
}

export interface BaseCost {
  id: string;
  repairCode: string;
  category: string;
  subcategory?: string;
  description: string;
  unit: string;
  baseUnitCost: number;
  minCost?: number;
  maxCost?: number;
  typicalQuantityHint?: string;
  applicableRoomTypes: string[];
  rehabLevels: string[];
}

export interface LocationFactor {
  zipPrefix: string;
  city?: string;
  state: string;
  materialFactor: number;
  laborFactor: number;
  combinedFactor: number;
}
