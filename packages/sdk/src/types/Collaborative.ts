export interface CollaborativeState {
  state: string; // Base64 encoded Yjs state
  stateVector: string; // Base64 encoded state vector
}

export interface SyncRequest {
  stateVector: string;
  update?: string; // Base64 encoded update
}

export interface SyncResponse {
  update?: string; // Base64 encoded diff
  stateVector: string;
}

export interface CollaborativeContextType {
  doc: any | null; // Y.Doc
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
}