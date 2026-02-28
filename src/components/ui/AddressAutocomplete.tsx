import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressDetails {
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onAddressSelect: (details: AddressDetails) => void;
  placeholder?: string;
  label?: string;
}

export function AddressAutocomplete({
  value,
  onChangeText,
  onAddressSelect,
  placeholder = '123 Main St, Austin, TX',
  label = 'Property Address',
}: AddressAutocompleteProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchPlaces = useCallback(async (input: string) => {
    if (!GOOGLE_API_KEY || input.length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&components=country:us&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.predictions) {
        setPredictions(data.predictions.slice(0, 5));
        setShowDropdown(true);
      }
    } catch {
      setPredictions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleChangeText = (text: string) => {
    onChangeText(text);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (text.length >= 3 && GOOGLE_API_KEY) {
      debounceTimer.current = setTimeout(() => searchPlaces(text), 300);
    } else {
      setPredictions([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = async (prediction: Prediction) => {
    Keyboard.dismiss();
    setShowDropdown(false);
    setPredictions([]);

    // Get place details for structured address components
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=address_components&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.result?.address_components) {
        const components = data.result.address_components;
        const getComponent = (type: string) =>
          components.find((c: any) => c.types.includes(type));

        const streetNumber = getComponent('street_number')?.long_name || '';
        const route = getComponent('route')?.long_name || '';
        const city =
          getComponent('locality')?.long_name ||
          getComponent('sublocality_level_1')?.long_name ||
          '';
        const state = getComponent('administrative_area_level_1')?.short_name || '';
        const zip = getComponent('postal_code')?.long_name || '';

        const addressLine1 = `${streetNumber} ${route}`.trim();

        onChangeText(addressLine1);
        onAddressSelect({
          addressLine1,
          city,
          state,
          zipCode: zip,
        });
      }
    } catch {
      // Fallback: just use the description text
      onChangeText(prediction.structured_formatting.main_text);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color={colors.gray[400]}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          autoCapitalize="words"
          autoCorrect={false}
          onFocus={() => {
            if (predictions.length > 0) setShowDropdown(true);
          }}
          onBlur={() => {
            // Delay hiding so tap on prediction registers
            setTimeout(() => setShowDropdown(false), 200);
          }}
        />
        {isSearching && (
          <ActivityIndicator
            size="small"
            color={colors.primary[500]}
            style={styles.spinner}
          />
        )}
      </View>

      {showDropdown && predictions.length > 0 && (
        <View style={styles.dropdown}>
          {predictions.map((prediction) => (
            <TouchableOpacity
              key={prediction.place_id}
              style={styles.predictionRow}
              onPress={() => handleSelect(prediction)}
            >
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.primary[500]}
              />
              <View style={styles.predictionText}>
                <Text style={styles.predictionMain} numberOfLines={1}>
                  {prediction.structured_formatting.main_text}
                </Text>
                <Text style={styles.predictionSecondary} numberOfLines={1}>
                  {prediction.structured_formatting.secondary_text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={styles.poweredBy}>
            <Text style={styles.poweredByText}>Powered by Google</Text>
          </View>
        </View>
      )}

      {!GOOGLE_API_KEY && (
        <Text style={styles.hint}>
          Add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to .env for address autocomplete
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    zIndex: 10,
  },
  label: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    ...typography.body,
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.text.primary,
  },
  spinner: {
    marginLeft: spacing.sm,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  predictionText: {
    flex: 1,
  },
  predictionMain: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  predictionSecondary: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 1,
  },
  poweredBy: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  poweredByText: {
    ...typography.caption,
    color: colors.gray[400],
    fontSize: 10,
  },
  hint: {
    ...typography.caption,
    color: colors.gray[400],
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});
