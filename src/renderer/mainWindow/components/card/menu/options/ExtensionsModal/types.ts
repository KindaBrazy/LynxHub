import {ReactNode} from 'react';

export type InstalledExtensionsTable = {
  key: string;
  name: ReactNode;
  size: ReactNode | string;
  update: ReactNode;
  remove: ReactNode;
  disable: ReactNode;
};

export type ExtensionsInfo = {
  title: string;
  description: string;
  url: string;
  stars?: number;
};
