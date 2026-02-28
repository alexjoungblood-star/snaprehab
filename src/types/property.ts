export type PropertyType = 'single_family' | 'multi_family' | 'condo' | 'townhouse';
export type RehabLevel = 'cosmetic' | 'moderate' | 'full_gut';
export type PropertyStatus = 'in_progress' | 'completed' | 'archived';

export interface Property {
  id: string;
  userId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  yearBuilt?: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType: PropertyType;
  rehabLevel: RehabLevel;
  status: PropertyStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyInput {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  yearBuilt?: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType: PropertyType;
  rehabLevel: RehabLevel;
  notes?: string;
}
