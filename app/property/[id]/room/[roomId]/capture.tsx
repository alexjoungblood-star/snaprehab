import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
let ImagePicker: any = null;
try { ImagePicker = require('expo-image-picker'); } catch {}
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../../../../src/services/supabase/client';
import { colors } from '../../../../../src/theme/colors';
import { typography } from '../../../../../src/theme/typography';
import { spacing } from '../../../../../src/theme/spacing';
import { ROOM_PHOTO_GUIDES, PHOTO_CONFIG } from '../../../../../src/utils/constants';
import { ROOM_TYPE_LABELS } from '../../../../../src/types/room';

interface CapturedPhoto {
  uri: string;
  position: number;
}

export default function RoomCaptureScreen() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId: string }>();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [roomType, setRoomType] = useState('');
  const [roomLabel, setRoomLabel] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadRoom();
  }, []);

  const loadRoom = async () => {
    const { data } = await supabase
      .from('rooms')
      .select('room_type, room_label')
      .eq('id', roomId)
      .single();

    if (data) {
      setRoomType(data.room_type);
      setRoomLabel(data.room_label || ROOM_TYPE_LABELS[data.room_type as keyof typeof ROOM_TYPE_LABELS] || 'Room');
    }
  };

  const guides = ROOM_PHOTO_GUIDES[roomType] || ROOM_PHOTO_GUIDES.default;
  const currentGuide = guides[currentStep];
  const totalSteps = guides.length;

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={colors.gray[300]} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo) {
        const compressed = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: PHOTO_CONFIG.MAX_WIDTH } }],
          { compress: PHOTO_CONFIG.COMPRESSION_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
        );
        setPreviewUri(compressed.uri);
      }
    } catch {
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const acceptPhoto = () => {
    if (!previewUri) return;
    setPhotos((prev) => [...prev, { uri: previewUri, position: currentStep + 1 }]);
    setPreviewUri(null);
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const retakePhoto = () => setPreviewUri(null);

  const pickFromLibrary = async () => {
    if (!ImagePicker) {
      Alert.alert('Not Available', 'Photo library requires a new app build. Use the camera for now.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const compressed = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: PHOTO_CONFIG.MAX_WIDTH } }],
        { compress: PHOTO_CONFIG.COMPRESSION_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPreviewUri(compressed.uri);
    }
  };

  const finishCapture = async () => {
    if (photos.length === 0) {
      Alert.alert('No Photos', 'Take at least one photo.');
      return;
    }

    setIsSaving(true);
    try {
      for (const photo of photos) {
        await supabase.from('photos').insert({
          room_id: roomId,
          property_id: id,
          local_uri: photo.uri,
          photo_position: photo.position,
          photo_type: currentGuide?.type || 'standard',
          sync_status: 'pending',
        });
      }

      await supabase
        .from('rooms')
        .update({ status: 'photos_taken' })
        .eq('id', roomId);

      // Navigate to AI analysis
      router.replace(`/property/${id}/room/${roomId}/analysis`);
    } catch {
      Alert.alert('Error', 'Failed to save photos.');
    } finally {
      setIsSaving(false);
    }
  };

  if (previewUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: previewUri }} style={styles.preview} />
        <View style={styles.previewOverlay}>
          <Text style={styles.previewLabel}>{currentGuide?.label}</Text>
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={retakePhoto}>
              <Ionicons name="refresh" size={24} color={colors.white} />
              <Text style={styles.actionBtnText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={acceptPhoto}>
              <Ionicons name="checkmark" size={24} color={colors.white} />
              <Text style={styles.actionBtnText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.guideOverlay}>
          <View style={styles.topBar}>
            <Text style={styles.roomTitle}>{roomLabel}</Text>
            <Text style={styles.stepText}>
              {currentStep + 1} / {totalSteps}
            </Text>
          </View>

          <View style={styles.guideCard}>
            <Text style={styles.guideLabel}>{currentGuide?.label}</Text>
            <Text style={styles.guideInstruction}>{currentGuide?.instruction}</Text>
          </View>

          <View style={styles.photoStrip}>
            {photos.map((p, i) => (
              <Image key={i} source={{ uri: p.uri }} style={styles.thumbnail} />
            ))}
          </View>

          {/* Skip button */}
          {currentStep < totalSteps - 1 && (
            <TouchableOpacity style={styles.skipButton} onPress={() => setCurrentStep((prev) => prev + 1)}>
              <Text style={styles.skipText}>Skip this shot</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}

          <View style={styles.controls}>
            <TouchableOpacity style={styles.libraryButton} onPress={pickFromLibrary}>
              <Ionicons name="images-outline" size={24} color={colors.white} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
              <View style={styles.captureInner} />
            </TouchableOpacity>

            {photos.length > 0 && (
              <TouchableOpacity
                style={styles.doneButton}
                onPress={finishCapture}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.doneText}>
                    Done ({photos.length})
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  preview: { flex: 1, resizeMode: 'contain' },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  previewLabel: {
    ...typography.heading3,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['2xl'],
  },
  actionBtn: { alignItems: 'center', gap: spacing.xs },
  actionBtnText: { ...typography.bodySmall, color: colors.white, fontWeight: '600' },
  guideOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing['2xl'],
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: spacing.md,
    borderRadius: 12,
  },
  roomTitle: { ...typography.body, color: colors.white, fontWeight: '600' },
  stepText: { ...typography.bodySmall, color: 'rgba(255,255,255,0.7)' },
  guideCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: spacing.base,
    borderRadius: 12,
    marginHorizontal: spacing.xl,
  },
  guideLabel: { ...typography.heading3, color: colors.white, marginBottom: spacing.xs },
  guideInstruction: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  skipText: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.7)',
  },
  photoStrip: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.white,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xl'],
  },
  libraryButton: {
    position: 'absolute',
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.white,
  },
  doneButton: {
    position: 'absolute',
    right: 0,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
  },
  doneText: { ...typography.button, color: colors.white },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing['2xl'],
  },
  permissionTitle: {
    ...typography.heading2,
    color: colors.text.primary,
    marginTop: spacing.xl,
  },
  permissionButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  permissionButtonText: { ...typography.button, color: colors.white },
});
