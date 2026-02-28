import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  type GestureResponderEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
let ImagePicker: any = null;
try { ImagePicker = require('expo-image-picker'); } catch {}
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing } from '../../../src/theme/spacing';
import { EXTERIOR_PHOTO_SEQUENCE, PHOTO_CONFIG } from '../../../src/utils/constants';
import { supabase } from '../../../src/services/supabase/client';

interface CapturedPhoto {
  position: number;
  uri: string;
  label: string;
}

export default function ExteriorWalkthroughScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(0);
  const lastPinchDistance = useRef<number | null>(null);
  const zoomAtPinchStart = useRef(0);

  const getDistance = (touches: GestureResponderEvent['nativeEvent']['touches']) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: GestureResponderEvent) => {
    if (e.nativeEvent.touches.length === 2) {
      lastPinchDistance.current = getDistance(e.nativeEvent.touches);
      zoomAtPinchStart.current = zoom;
    }
  }, [zoom]);

  const handleTouchMove = useCallback((e: GestureResponderEvent) => {
    if (e.nativeEvent.touches.length === 2 && lastPinchDistance.current !== null) {
      const currentDistance = getDistance(e.nativeEvent.touches);
      const scale = currentDistance / lastPinchDistance.current;
      const newZoom = Math.min(1, Math.max(0, zoomAtPinchStart.current + (scale - 1) * 0.5));
      setZoom(newZoom);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastPinchDistance.current = null;
  }, []);

  // Pinch hint
  const [showPinchHint, setShowPinchHint] = useState(true);
  const pinchHintOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(pinchHintOpacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => setShowPinchHint(false));
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Load any previously saved exterior photos on mount
  useEffect(() => {
    loadExistingPhotos();
  }, []);

  const loadExistingPhotos = async () => {
    const { data } = await supabase
      .from('rooms')
      .select('id, room_label, sort_order')
      .eq('property_id', id)
      .like('room_type', 'exterior_%')
      .order('sort_order');

    if (data && data.length > 0) {
      // Load photos for each exterior room
      const existing: CapturedPhoto[] = [];
      for (const room of data) {
        const { data: photoData } = await supabase
          .from('photos')
          .select('local_uri, photo_position')
          .eq('room_id', room.id)
          .limit(1);

        if (photoData && photoData[0]?.local_uri) {
          existing.push({
            position: room.sort_order,
            uri: photoData[0].local_uri,
            label: room.room_label || '',
          });
        }
      }
      if (existing.length > 0) {
        setPhotos(existing);
      }
    }
  };

  const currentGuide = EXTERIOR_PHOTO_SEQUENCE[currentStep];
  const totalSteps = EXTERIOR_PHOTO_SEQUENCE.length;

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={colors.gray[300]} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          SnapRehab needs camera access to take photos of the property.
        </Text>
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
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        exif: true,
      });

      if (photo) {
        // Compress the image
        const compressed = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: PHOTO_CONFIG.MAX_WIDTH } }],
          {
            compress: PHOTO_CONFIG.COMPRESSION_QUALITY,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );

        setPreviewUri(compressed.uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const acceptPhoto = () => {
    if (!previewUri || !currentGuide) return;

    const newPhoto: CapturedPhoto = {
      position: currentGuide.position,
      uri: previewUri,
      label: currentGuide.label,
    };

    setPhotos((prev) => [...prev, newPhoto]);
    setPreviewUri(null);

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const retakePhoto = () => {
    setPreviewUri(null);
  };

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

  const skipPhoto = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const finishExterior = async () => {
    if (photos.length === 0) {
      Alert.alert('No Photos', 'Please take at least one exterior photo.');
      return;
    }

    setIsSaving(true);
    try {
      // Create exterior room records and save photo references
      for (const photo of photos) {
        const roomType = `exterior_${photo.label.toLowerCase().replace(/[^a-z]/g, '_')}`;

        // Create room record
        const { data: room } = await supabase
          .from('rooms')
          .insert({
            property_id: id,
            room_type: roomType.substring(0, 30) as any,
            room_label: photo.label,
            status: 'photos_taken',
            sort_order: photo.position,
          })
          .select()
          .single();

        if (room) {
          // Save photo record (local URI for now, will sync later)
          await supabase.from('photos').insert({
            room_id: room.id,
            property_id: id,
            local_uri: photo.uri,
            photo_position: photo.position,
            photo_type: 'wide_shot',
            sync_status: 'pending',
          });
        }
      }

      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to save photos. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Preview mode
  if (previewUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
        <View style={styles.previewOverlay}>
          <Text style={styles.previewLabel}>{currentGuide?.label}</Text>
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
              <Ionicons name="refresh" size={24} color={colors.white} />
              <Text style={styles.actionButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={acceptPhoto}>
              <Ionicons name="checkmark" size={24} color={colors.white} />
              <Text style={styles.actionButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Camera mode
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        zoom={zoom}
        selectedLens="builtInUltraWideCamera"
      >
        {/* Guide overlay with pinch-to-zoom */}
        <View
          style={styles.guideOverlay}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              {currentStep + 1} / {totalSteps}
            </Text>
          </View>

          <View style={styles.guideContent}>
            <Text style={styles.guideLabel}>{currentGuide?.label}</Text>
            <Text style={styles.guideInstruction}>
              {currentGuide?.instruction}
            </Text>
          </View>

          {/* Pinch-to-zoom hint */}
          {showPinchHint && (
            <Animated.View style={[styles.pinchHint, { opacity: pinchHintOpacity }]}>
              <View style={styles.pinchGesture}>
                <Ionicons name="finger-print-outline" size={22} color="rgba(255,255,255,0.9)" />
                <Text style={styles.pinchArrows}>{'  \u2194  '}</Text>
                <Ionicons name="finger-print-outline" size={22} color="rgba(255,255,255,0.9)" />
              </View>
              <Text style={styles.pinchHintText}>Pinch to zoom</Text>
            </Animated.View>
          )}

          {/* Photo strip */}
          <View style={styles.photoStrip}>
            {photos.map((p, i) => (
              <Image
                key={i}
                source={{ uri: p.uri }}
                style={styles.thumbnail}
              />
            ))}
          </View>

          {/* Skip button */}
          <TouchableOpacity style={styles.skipButton} onPress={skipPhoto}>
            <Text style={styles.skipText}>Skip this shot</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          {/* Zoom indicator */}
          {zoom > 0.01 && (
            <View style={styles.zoomIndicator}>
              <Text style={styles.zoomText}>{(1 + zoom * 9).toFixed(1)}x</Text>
            </View>
          )}

          {/* Controls */}
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
                onPress={finishExterior}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.doneText}>Done ({photos.length})</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
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
  retakeButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  acceptButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
  guideOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  stepIndicator: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginTop: spacing['2xl'],
  },
  stepText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
  guideContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: spacing.base,
    borderRadius: 12,
    marginHorizontal: spacing.xl,
  },
  guideLabel: {
    ...typography.heading3,
    color: colors.white,
    marginBottom: spacing.xs,
  },
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
  pinchHint: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 16,
  },
  pinchGesture: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  pinchArrows: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.9)',
  },
  pinchHintText: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  zoomIndicator: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  zoomText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
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
  doneButton: {
    position: 'absolute',
    right: 0,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
  },
  doneText: {
    ...typography.button,
    color: colors.white,
  },
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
  permissionText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  permissionButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  permissionButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
