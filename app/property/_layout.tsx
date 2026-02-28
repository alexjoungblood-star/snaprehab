import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function PropertyLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.primary[600],
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
          color: colors.text.primary,
        },
        headerBackTitle: 'Back',
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
        options={{
          title: 'Exterior Walkthrough',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/rooms"
        options={{ title: 'Rooms' }}
      />
      <Stack.Screen
        name="[id]/room/[roomId]/capture"
        options={{
          title: 'Photo Capture',
          headerShown: false,
        }}
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
