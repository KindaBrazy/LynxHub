import {ReactNode} from 'react';

export type InstalledExtensionsTable = {
  key: string;
  name: ReactNode;
  stars: ReactNode;
  size: ReactNode | string;
  update: ReactNode;
  remove: ReactNode;
  disable: ReactNode;
};
