import { create } from 'zustand';
import { supabase } from '../services/supabase/client';
import type { Property, CreatePropertyInput } from '../types/property';

interface PropertyState {
  properties: Property[];
  activeProperty: Property | null;
  isLoading: boolean;
  error: string | null;

  fetchProperties: () => Promise<void>;
  createProperty: (input: CreatePropertyInput) => Promise<Property | null>;
  setActiveProperty: (property: Property | null) => void;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  activeProperty: null,
  isLoading: false,
  error: null,

  fetchProperties: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const properties: Property[] = (data ?? []).map(mapDbToProperty);
      set({ properties, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createProperty: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          address_line1: input.addressLine1,
          address_line2: input.addressLine2,
          city: input.city,
          state: input.state,
          zip_code: input.zipCode,
          year_built: input.yearBuilt,
          square_footage: input.squareFootage,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          property_type: input.propertyType,
          rehab_level: input.rehabLevel,
          notes: input.notes,
        })
        .select()
        .single();

      if (error) throw error;

      const property = mapDbToProperty(data);
      set((state) => ({
        properties: [property, ...state.properties],
        activeProperty: property,
        isLoading: false,
      }));
      return property;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  setActiveProperty: (property) => {
    set({ activeProperty: property });
  },

  updateProperty: async (id, updates) => {
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.addressLine1 !== undefined) dbUpdates.address_line1 = updates.addressLine1;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.state !== undefined) dbUpdates.state = updates.state;
      if (updates.zipCode !== undefined) dbUpdates.zip_code = updates.zipCode;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('properties')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        properties: state.properties.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
        activeProperty: state.activeProperty?.id === id
          ? { ...state.activeProperty, ...updates }
          : state.activeProperty,
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteProperty: async (id) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        properties: state.properties.filter((p) => p.id !== id),
        activeProperty: state.activeProperty?.id === id ? null : state.activeProperty,
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));

function mapDbToProperty(row: any): Property {
  return {
    id: row.id,
    userId: row.user_id,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    yearBuilt: row.year_built,
    squareFootage: row.square_footage,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    propertyType: row.property_type,
    rehabLevel: row.rehab_level,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
