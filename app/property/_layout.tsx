import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function PropertyLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.text.primary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="create"
        options={{ title: 'New Property' }}
      />
      <Stack.Screen
        name="[id]/index"
        options={{ title: 'Property Overview' }}
      />
      <Stack.Screen
        name="[id]/exterior"
        options={{ title: 'Exterior Walkthrough' }}
      />
      <Stack.Screen
        name="[id]/rooms"
        options={{ title: 'Rooms' }}
      />
      <Stack.Screen
        name="[id]/room/[roomId]/capture"
        options={{ title: 'Photo Capture' }}
      />
      <Stack.Screen
        name="[id]/room/[roomId]/analysis"
        options={{ title: 'AI Analysis' }}
      />
      <Stack.Screen
        name="[id]/room/[roomId]/followup"
        options={{ title: 'Follow-Up Questions' }}
      />
      <Stack.Screen
        name="[id]/room/[roomId]/repairs"
        options={{ title: 'Repair Items' }}
      />
      <Stack.Screen
        name="[id]/estimate"
        options={{ title: 'Estimate' }}
      />
      <Stack.Screen
        name="[id]/scope-of-work"
        options={{ title: 'Scope of Work' }}
      />
      <Stack.Screen
        name="[id]/export"
        options={{ title: 'Export PDF' }}
      />
    </Stack>
  );
}
