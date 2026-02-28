export type PhotoType = 'standard' | 'wide_shot' | 'detail' | 'problem_area' | 'ceiling' | 'floor';
export type SyncStatus = 'pending' | 'uploading' | 'uploaded' | 'analyzed' | 'error';

export interface Photo {
  id: string;
  roomId: string;
  propertyId: string;
  storagePath?: string;
  localUri?: string;
  thumbnailPath?: string;
  photoPosition: number;
  photoType: PhotoType;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  aiAnalyzed: boolean;
  syncStatus: SyncStatus;
  createdAt: string;
}
