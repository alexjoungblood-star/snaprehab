import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../../src/services/supabase/client';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { Input } from '../../../src/components/ui/Input';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing } from '../../../src/theme/spacing';
import type { Room, RoomType } from '../../../src/types/room';
import { ROOM_TYPE_LABELS, ROOM_TYPE_ICONS } from '../../../src/types/room';

// Priority rooms shown first with "Suggested" header
const SUGGESTED_ROOMS: { type: RoomType; label: string; icon: string; hint: string }[] = [
  { type: 'kitchen', label: 'Kitchen', icon: 'restaurant-outline', hint: 'Highest rehab cost — always capture' },
  { type: 'bathroom', label: 'Bathroom', icon: 'water-outline', hint: 'Add one per bathroom in the property' },
  { type: 'living_room', label: 'Living Room', icon: 'tv-outline', hint: 'Main living area' },
  { type: 'bedroom', label: 'Bedroom', icon: 'bed-outline', hint: 'Add one per bedroom' },
];

// Other rooms shown in a grid below
const OTHER_ROOMS: { type: RoomType; label: string; icon: string }[] = [
  { type: 'dining_room', label: 'Dining Room', icon: 'cafe-outline' },
  { type: 'laundry', label: 'Laundry', icon: 'shirt-outline' },
  { type: 'basement', label: 'Basement', icon: 'arrow-down-outline' },
  { type: 'attic', label: 'Attic', icon: 'arrow-up-outline' },
  { type: 'hallway', label: 'Hallway', icon: 'resize-outline' },
  { type: 'office', label: 'Office', icon: 'desktop-outline' },
  { type: 'garage_interior', label: 'Garage', icon: 'car-outline' },
  { type: 'utility', label: 'Utility Room', icon: 'construct-outline' },
  { type: 'hvac', label: 'HVAC System', icon: 'thermometer-outline' },
  { type: 'electrical_panel', label: 'Electrical Panel', icon: 'flash-outline' },
  { type: 'water_heater', label: 'Water Heater', icon: 'flame-outline' },
  { type: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export default function RoomsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [customLabel, setCustomLabel] = useState('');

  // Reload rooms when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      loadRooms();
    }, [])
  );

  const loadRooms = async () => {
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .eq('property_id', id)
      .not('room_type', 'like', 'exterior_%')
      .order('sort_order');

    if (data) {
      setRooms(
        data.map((r: any) => ({
          id: r.id,
          propertyId: r.property_id,
          roomType: r.room_type,
          roomLabel: r.room_label,
          floorLevel: r.floor_level,
          sortOrder: r.sort_order,
          status: r.status,
          notes: r.notes,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }))
      );
    }
  };

  const addRoom = async (type: RoomType) => {
    const label = customLabel.trim() || ROOM_TYPE_LABELS[type];

    const { data, error } = await supabase
      .from('rooms')
      .insert({
        property_id: id,
        room_type: type,
        room_label: label,
        sort_order: rooms.length,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      Alert.alert('Error', 'Failed to add room.');
      return;
    }

    if (data) {
      setShowModal(false);
      setCustomLabel('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadRooms();

      // Navigate to capture screen for the new room
      router.push(`/property/${id}/room/${data.id}/capture`);
    }
  };

  const deleteRoom = (roomId: string, label: string) => {
    Alert.alert('Delete Room', `Remove "${label}" from this property?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('rooms').delete().eq('id', roomId);
          loadRooms();
        },
      },
    ]);
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success' as const;
      case 'analyzed':
      case 'items_selected': return 'info' as const;
      case 'photos_taken': return 'warning' as const;
      default: return 'default' as const;
    }
  };

  const navigateToRoom = (room: Room) => {
    switch (room.status) {
      case 'pending':
        router.push(`/property/${id}/room/${room.id}/capture`);
        break;
      case 'photos_taken':
        router.push(`/property/${id}/room/${room.id}/analysis`);
        break;
      case 'analyzed':
        router.push(`/property/${id}/room/${room.id}/followup`);
        break;
      case 'items_selected':
      case 'completed':
        router.push(`/property/${id}/room/${room.id}/repairs`);
        break;
      default:
        router.push(`/property/${id}/room/${room.id}/capture`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Suggested rooms section — shown when no rooms added yet */}
        {rooms.length === 0 && (
          <View style={styles.suggestedSection}>
            <Text style={styles.sectionTitle}>Suggested Rooms</Text>
            <Text style={styles.sectionHint}>
              Tap to add a room and start taking photos. Kitchen and bathrooms have the biggest impact on rehab cost.
            </Text>
            {SUGGESTED_ROOMS.map((rt) => (
              <TouchableOpacity
                key={rt.type}
                style={styles.suggestedCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  addRoom(rt.type);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.suggestedIcon}>
                  <Ionicons name={rt.icon as any} size={28} color={colors.primary[500]} />
                </View>
                <View style={styles.suggestedInfo}>
                  <Text style={styles.suggestedLabel}>{rt.label}</Text>
                  <Text style={styles.suggestedHint}>{rt.hint}</Text>
                </View>
                <Ionicons name="add-circle" size={28} color={colors.primary[500]} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.moreRoomsButton}
              onPress={() => setShowModal(true)}
            >
              <Ionicons name="grid-outline" size={20} color={colors.primary[500]} />
              <Text style={styles.moreRoomsText}>More room types...</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Existing rooms list */}
        {rooms.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              {rooms.length} Room{rooms.length !== 1 ? 's' : ''} Added
            </Text>
            {rooms.map((room) => (
              <Card
                key={room.id}
                onPress={() => navigateToRoom(room)}
                style={styles.roomCard}
              >
                <View style={styles.roomRow}>
                  <Ionicons
                    name={(ROOM_TYPE_ICONS[room.roomType] || 'cube-outline') as any}
                    size={24}
                    color={colors.primary[500]}
                  />
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>
                      {room.roomLabel || ROOM_TYPE_LABELS[room.roomType]}
                    </Text>
                    <Text style={styles.roomType}>
                      {ROOM_TYPE_LABELS[room.roomType]}
                    </Text>
                  </View>
                  <Badge
                    label={room.status.replace(/_/g, ' ')}
                    variant={statusVariant(room.status)}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      deleteRoom(room.id, room.roomLabel || ROOM_TYPE_LABELS[room.roomType])
                    }
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.gray[400]} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}

            {/* Quick-add suggested rooms that aren't added yet */}
            <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Add More Rooms</Text>
            <View style={styles.quickAddRow}>
              {SUGGESTED_ROOMS.map((rt) => (
                <TouchableOpacity
                  key={rt.type}
                  style={styles.quickAddChip}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    addRoom(rt.type);
                  }}
                >
                  <Ionicons name={rt.icon as any} size={18} color={colors.primary[500]} />
                  <Text style={styles.quickAddLabel}>{rt.label}</Text>
                  <Ionicons name="add" size={16} color={colors.primary[500]} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Add Room FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Room Type Selection Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            style={styles.modalDismiss}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Room</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <Input
              placeholder="Custom label (e.g. Master Bath, 2nd Bedroom)"
              value={customLabel}
              onChangeText={setCustomLabel}
              containerStyle={styles.labelInput}
            />

            <ScrollView style={styles.roomTypeGrid} keyboardShouldPersistTaps="handled">
              <Text style={styles.gridSectionTitle}>Popular</Text>
              <View style={styles.grid}>
                {SUGGESTED_ROOMS.map((rt) => (
                  <TouchableOpacity
                    key={rt.type}
                    style={styles.roomTypeItem}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      addRoom(rt.type);
                    }}
                  >
                    <View style={styles.roomTypeIcon}>
                      <Ionicons
                        name={rt.icon as any}
                        size={28}
                        color={colors.primary[500]}
                      />
                    </View>
                    <Text style={styles.roomTypeLabel}>{rt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.gridSectionTitle, { marginTop: spacing.lg }]}>Other</Text>
              <View style={styles.grid}>
                {OTHER_ROOMS.map((rt) => (
                  <TouchableOpacity
                    key={rt.type}
                    style={styles.roomTypeItem}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      addRoom(rt.type);
                    }}
                  >
                    <View style={styles.roomTypeIcon}>
                      <Ionicons
                        name={rt.icon as any}
                        size={28}
                        color={colors.gray[500]}
                      />
                    </View>
                    <Text style={styles.roomTypeLabel}>{rt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing['5xl'],
    flexGrow: 1,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionHint: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  // Suggested rooms (empty state)
  suggestedSection: {
    paddingTop: spacing.md,
  },
  suggestedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  suggestedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestedInfo: {
    flex: 1,
  },
  suggestedLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  suggestedHint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  moreRoomsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
  },
  moreRoomsText: {
    ...typography.body,
    color: colors.primary[500],
    fontWeight: '500',
  },
  // Room list
  roomCard: {
    marginBottom: spacing.sm,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  roomType: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  // Quick add chips
  quickAddRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAddChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  quickAddLabel: {
    ...typography.bodySmall,
    color: colors.primary[700],
    fontWeight: '500',
  },
  // FAB
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing['3xl'],
    maxHeight: '80%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[300],
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  modalTitle: {
    ...typography.heading2,
    color: colors.text.primary,
  },
  labelInput: {
    marginBottom: spacing.md,
  },
  roomTypeGrid: {
    flex: 1,
  },
  gridSectionTitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  roomTypeItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  roomTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  roomTypeLabel: {
    ...typography.caption,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});
