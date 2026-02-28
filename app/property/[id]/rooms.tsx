import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../src/services/supabase/client';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing, borderRadius } from '../../../src/theme/spacing';
import type { Room, RoomType } from '../../../src/types/room';
import { ROOM_TYPE_LABELS, ROOM_TYPE_ICONS } from '../../../src/types/room';

const INTERIOR_ROOM_TYPES: { type: RoomType; label: string; icon: string }[] = [
  { type: 'kitchen', label: 'Kitchen', icon: 'restaurant-outline' },
  { type: 'bathroom', label: 'Bathroom', icon: 'water-outline' },
  { type: 'bedroom', label: 'Bedroom', icon: 'bed-outline' },
  { type: 'living_room', label: 'Living Room', icon: 'tv-outline' },
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
  const [selectedType, setSelectedType] = useState<RoomType | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

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
      setSelectedType(null);
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
        {rooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="grid-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Rooms Added</Text>
            <Text style={styles.emptySubtitle}>
              Add rooms to begin your interior walkthrough
            </Text>
          </View>
        ) : (
          rooms.map((room) => (
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
          ))
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
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Room</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <Input
              placeholder="Custom label (optional)"
              value={customLabel}
              onChangeText={setCustomLabel}
              containerStyle={styles.labelInput}
            />

            <ScrollView style={styles.roomTypeGrid}>
              <View style={styles.grid}>
                {INTERIOR_ROOM_TYPES.map((rt) => (
                  <TouchableOpacity
                    key={rt.type}
                    style={styles.roomTypeItem}
                    onPress={() => addRoom(rt.type)}
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
            </ScrollView>
          </View>
        </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing['5xl'],
  },
  emptyTitle: {
    ...typography.heading3,
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
    maxHeight: '80%',
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
