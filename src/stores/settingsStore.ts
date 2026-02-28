import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import type { AIProviderName } from '../types/analysis';

const storage = createMMKV({ id: 'settings' });

interface SettingsState {
  aiProvider: AIProviderName;
  defaultContingencyPct: number;
  defaultRehabLevel: 'cosmetic' | 'moderate' | 'full_gut';
  defaultZipCode: string;

  setAIProvider: (provider: AIProviderName) => void;
  setDefaultContingencyPct: (pct: number) => void;
  setDefaultRehabLevel: (level: 'cosmetic' | 'moderate' | 'full_gut') => void;
  setDefaultZipCode: (zip: string) => void;
  loadSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  aiProvider: (storage.getString('aiProvider') as AIProviderName) ?? 'claude',
  defaultContingencyPct: storage.getNumber('defaultContingencyPct') ?? 15,
  defaultRehabLevel: (storage.getString('defaultRehabLevel') as 'cosmetic' | 'moderate' | 'full_gut') ?? 'moderate',
  defaultZipCode: storage.getString('defaultZipCode') ?? '',

  setAIProvider: (provider) => {
    storage.set('aiProvider', provider);
    set({ aiProvider: provider });
  },

  setDefaultContingencyPct: (pct) => {
    storage.set('defaultContingencyPct', pct);
    set({ defaultContingencyPct: pct });
  },

  setDefaultRehabLevel: (level) => {
    storage.set('defaultRehabLevel', level);
    set({ defaultRehabLevel: level });
  },

  setDefaultZipCode: (zip) => {
    storage.set('defaultZipCode', zip);
    set({ defaultZipCode: zip });
  },

  loadSettings: () => {
    set({
      aiProvider: (storage.getString('aiProvider') as AIProviderName) ?? 'claude',
      defaultContingencyPct: storage.getNumber('defaultContingencyPct') ?? 15,
      defaultRehabLevel: (storage.getString('defaultRehabLevel') as 'cosmetic' | 'moderate' | 'full_gut') ?? 'moderate',
      defaultZipCode: storage.getString('defaultZipCode') ?? '',
    });
  },
}));
