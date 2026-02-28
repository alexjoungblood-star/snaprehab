export type RoomType =
  | 'exterior_front'
  | 'exterior_rear'
  | 'exterior_left'
  | 'exterior_right'
  | 'exterior_roof'
  | 'exterior_foundation'
  | 'exterior_driveway'
  | 'exterior_garage'
  | 'kitchen'
  | 'bathroom'
  | 'bedroom'
  | 'living_room'
  | 'dining_room'
  | 'laundry'
  | 'basement'
  | 'attic'
  | 'hallway'
  | 'office'
  | 'garage_interior'
  | 'utility'
  | 'hvac'
  | 'electrical_panel'
  | 'water_heater'
  | 'other';

export type RoomStatus = 'pending' | 'photos_taken' | 'analyzed' | 'items_selected' | 'completed';

export interface Room {
  id: string;
  propertyId: string;
  roomType: RoomType;
  roomLabel?: string;
  floorLevel: number;
  sortOrder: number;
  status: RoomStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  exterior_front: 'Front Exterior',
  exterior_rear: 'Rear Exterior',
  exterior_left: 'Left Side',
  exterior_right: 'Right Side',
  exterior_roof: 'Roof',
  exterior_foundation: 'Foundation',
  exterior_driveway: 'Driveway/Walkways',
  exterior_garage: 'Garage (Exterior)',
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  bedroom: 'Bedroom',
  living_room: 'Living Room',
  dining_room: 'Dining Room',
  laundry: 'Laundry',
  basement: 'Basement',
  attic: 'Attic',
  hallway: 'Hallway',
  office: 'Office',
  garage_interior: 'Garage (Interior)',
  utility: 'Utility Room',
  hvac: 'HVAC System',
  electrical_panel: 'Electrical Panel',
  water_heater: 'Water Heater',
  other: 'Other',
};

export const ROOM_TYPE_ICONS: Record<RoomType, string> = {
  exterior_front: 'home-outline',
  exterior_rear: 'home-outline',
  exterior_left: 'home-outline',
  exterior_right: 'home-outline',
  exterior_roof: 'layers-outline',
  exterior_foundation: 'cube-outline',
  exterior_driveway: 'car-outline',
  exterior_garage: 'car-outline',
  kitchen: 'restaurant-outline',
  bathroom: 'water-outline',
  bedroom: 'bed-outline',
  living_room: 'tv-outline',
  dining_room: 'cafe-outline',
  laundry: 'shirt-outline',
  basement: 'arrow-down-outline',
  attic: 'arrow-up-outline',
  hallway: 'resize-outline',
  office: 'desktop-outline',
  garage_interior: 'car-outline',
  utility: 'construct-outline',
  hvac: 'thermometer-outline',
  electrical_panel: 'flash-outline',
  water_heater: 'flame-outline',
  other: 'ellipsis-horizontal-outline',
};
