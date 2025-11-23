import {ReactNode} from 'react';

export type InstalledExtensionsTable = {
  key: string;
  name: ReactNode;
  size: ReactNode | string;
  update: ReactNode;
  remove: ReactNode;
  disable: ReactNode;
};
