export type ScreenShareSources = {
  icon?: string;
  id?: string;
  name: string;
  thumbnail?: string;
  display_id?: string;
};

export type ScreenShareStart = {
  id: string;
  shareAudio: boolean;
  type: 'windows' | 'screens';
};
