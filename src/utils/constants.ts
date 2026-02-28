export const APP_NAME = 'SnapRehab';

export const PHOTO_CONFIG = {
  MAX_WIDTH: 2048,
  COMPRESSION_QUALITY: 0.8,
  THUMBNAIL_WIDTH: 300,
  THUMBNAIL_QUALITY: 0.6,
} as const;

export const EXTERIOR_PHOTO_SEQUENCE = [
  { position: 1, label: 'Front of House', instruction: 'Stand across the street and capture the full front view', type: 'wide_shot' as const },
  { position: 2, label: 'Roof', instruction: 'Get the best angle you can of the roof — step back for a wide view', type: 'wide_shot' as const },
  { position: 3, label: 'Left Side', instruction: 'Walk to the left side of the house and capture the full view', type: 'wide_shot' as const },
  { position: 4, label: 'Right Side', instruction: 'Walk to the right side of the house and capture the full view', type: 'wide_shot' as const },
  { position: 5, label: 'Back of House', instruction: 'Capture the rear of the house including any deck or patio', type: 'wide_shot' as const },
  { position: 6, label: 'Foundation', instruction: 'Get a close-up of the foundation — look for cracks or water staining', type: 'detail' as const },
  { position: 7, label: 'Driveway/Walkways', instruction: 'Capture the driveway and any walkways', type: 'wide_shot' as const },
  { position: 8, label: 'Garage', instruction: 'Capture the garage door and structure (skip if no garage)', type: 'wide_shot' as const },
] as const;

export const ROOM_PHOTO_GUIDES: Record<string, Array<{ position: number; label: string; instruction: string; type: string }>> = {
  kitchen: [
    { position: 1, label: 'Wide Shot', instruction: 'Stand in the doorway and get a wide shot of the entire kitchen', type: 'wide_shot' },
    { position: 2, label: 'Cabinets & Counters', instruction: 'Get a close-up of the cabinets and countertops', type: 'detail' },
    { position: 3, label: 'Appliances', instruction: 'Capture the appliances — stove, fridge, dishwasher', type: 'detail' },
    { position: 4, label: 'Problem Areas', instruction: 'Take a photo of any damage or problem areas you see', type: 'problem_area' },
  ],
  bathroom: [
    { position: 1, label: 'Wide Shot', instruction: 'Stand in the doorway and capture the full bathroom', type: 'wide_shot' },
    { position: 2, label: 'Tub/Shower', instruction: 'Get a clear shot of the tub or shower area', type: 'detail' },
    { position: 3, label: 'Vanity & Fixtures', instruction: 'Capture the vanity, sink, and mirror', type: 'detail' },
    { position: 4, label: 'Floor & Toilet', instruction: 'Get the floor condition and toilet', type: 'detail' },
  ],
  bedroom: [
    { position: 1, label: 'Wide Shot', instruction: 'Stand in the doorway and get a wide shot of the room', type: 'wide_shot' },
    { position: 2, label: 'Walls & Windows', instruction: 'Capture the walls and window condition', type: 'detail' },
    { position: 3, label: 'Ceiling', instruction: 'Point up and capture the ceiling — look for water stains', type: 'ceiling' },
  ],
  living_room: [
    { position: 1, label: 'Wide Shot', instruction: 'Stand in the doorway and capture the full room', type: 'wide_shot' },
    { position: 2, label: 'Flooring', instruction: 'Get a shot of the flooring condition', type: 'floor' },
    { position: 3, label: 'Walls & Ceiling', instruction: 'Capture walls and ceiling — look for cracks or damage', type: 'detail' },
  ],
  default: [
    { position: 1, label: 'Wide Shot', instruction: 'Stand in the doorway and get a wide shot of the space', type: 'wide_shot' },
    { position: 2, label: 'Detail Shot', instruction: 'Get a closer look at any notable features or damage', type: 'detail' },
    { position: 3, label: 'Problem Areas', instruction: 'Capture any damage or areas of concern', type: 'problem_area' },
  ],
};

export const DEFAULT_CONTINGENCY_PCT = 15;
