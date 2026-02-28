import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePropertyStore } from '../../src/stores/propertyStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import type { PropertyType, RehabLevel } from '../../src/types/property';

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'single_family', label: 'Single Family' },
  { value: 'multi_family', label: 'Multi Family' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
];

const REHAB_LEVELS: { value: RehabLevel; label: string; description: string }[] = [
  { value: 'cosmetic', label: 'Cosmetic', description: 'Paint, flooring, fixtures, light updates' },
  { value: 'moderate', label: 'Moderate', description: 'Kitchen/bath remodel, some systems work' },
  { value: 'full_gut', label: 'Full Gut', description: 'Everything down to studs, all new systems' },
];

export default function CreatePropertyScreen() {
  const router = useRouter();
  const { createProperty, isLoading } = usePropertyStore();
  const { defaultRehabLevel } = useSettingsStore();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [sqft, setSqft] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('single_family');
  const [rehabLevel, setRehabLevel] = useState<RehabLevel>(defaultRehabLevel);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');

    if (!address.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
      setError('Please fill in the address fields');
      return;
    }

    const property = await createProperty({
      addressLine1: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      yearBuilt: yearBuilt ? parseInt(yearBuilt, 10) : undefined,
      squareFootage: sqft ? parseInt(sqft, 10) : undefined,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      bathrooms: bathrooms ? parseFloat(bathrooms) : undefined,
      propertyType,
      rehabLevel,
    });

    if (property) {
      router.replace(`/property/${property.id}`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Address Section */}
        <Text style={styles.sectionTitle}>Property Address</Text>
        <Input
          label="Street Address"
          placeholder="123 Main St"
          value={address}
          onChangeText={setAddress}
          autoCapitalize="words"
        />
        <View style={styles.row}>
          <Input
            label="City"
            placeholder="Austin"
            value={city}
            onChangeText={setCity}
            containerStyle={styles.flex2}
            autoCapitalize="words"
          />
          <Input
            label="State"
            placeholder="TX"
            value={state}
            onChangeText={setState}
            containerStyle={styles.flex1}
            autoCapitalize="characters"
            maxLength={2}
          />
        </View>
        <Input
          label="Zip Code"
          placeholder="78701"
          value={zipCode}
          onChangeText={setZipCode}
          keyboardType="number-pad"
          maxLength={5}
        />

        {/* Property Details */}
        <Text style={styles.sectionTitle}>Property Details</Text>
        <View style={styles.row}>
          <Input
            label="Year Built"
            placeholder="1985"
            value={yearBuilt}
            onChangeText={setYearBuilt}
            keyboardType="number-pad"
            containerStyle={styles.flex1}
            maxLength={4}
          />
          <Input
            label="Sq Ft"
            placeholder="1,500"
            value={sqft}
            onChangeText={setSqft}
            keyboardType="number-pad"
            containerStyle={styles.flex1}
          />
        </View>
        <View style={styles.row}>
          <Input
            label="Bedrooms"
            placeholder="3"
            value={bedrooms}
            onChangeText={setBedrooms}
            keyboardType="number-pad"
            containerStyle={styles.flex1}
          />
          <Input
            label="Bathrooms"
            placeholder="2"
            value={bathrooms}
            onChangeText={setBathrooms}
            keyboardType="decimal-pad"
            containerStyle={styles.flex1}
          />
        </View>

        {/* Property Type */}
        <Text style={styles.sectionTitle}>Property Type</Text>
        <View style={styles.chipRow}>
          {PROPERTY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.chip,
                propertyType === type.value && styles.chipSelected,
              ]}
              onPress={() => setPropertyType(type.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  propertyType === type.value && styles.chipTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rehab Level */}
        <Text style={styles.sectionTitle}>Rehab Level</Text>
        {REHAB_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.value}
            onPress={() => setRehabLevel(level.value)}
          >
            <Card
              style={[
                styles.rehabCard,
                rehabLevel === level.value && styles.rehabCardSelected,
              ]}
            >
              <View style={styles.rehabHeader}>
                <View
                  style={[
                    styles.radio,
                    rehabLevel === level.value && styles.radioSelected,
                  ]}
                >
                  {rehabLevel === level.value && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.rehabLabel}>{level.label}</Text>
              </View>
              <Text style={styles.rehabDescription}>{level.description}</Text>
            </Card>
          </TouchableOpacity>
        ))}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title="Start Walkthrough"
          onPress={handleCreate}
          loading={isLoading}
          fullWidth
          size="lg"
          style={styles.createButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.primary[600],
  },
  rehabCard: {
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  rehabCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  rehabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.primary[500],
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary[500],
  },
  rehabLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  rehabDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginLeft: 34,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error[500],
    textAlign: 'center',
    marginTop: spacing.base,
  },
  createButton: {
    marginTop: spacing.xl,
  },
});
