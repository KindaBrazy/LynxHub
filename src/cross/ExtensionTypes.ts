import {ComponentProps, FC, ReactNode} from 'react';

export type ElementProps = ComponentProps<'div'>;
export type ElementComp = (props: ElementProps) => ReactNode;

export type ContainerElements = {
  start: ElementComp[];
  center: ElementComp[];
  end: ElementComp[];
};

export type StatusBarComponent = {
  Container?: (elements: ContainerElements) => ReactNode;
  Start?: ElementComp;
  Center?: ElementComp;
  End?: ElementComp;
};

export type ModalsComponent = {
  UpdateApp?: FC;
  LaunchConfig?: FC;
  CardExtensions?: FC;
  UpdatingNotification?: FC;
  CardInfoModal?: FC;
  InstallUIModal?: FC;
  InstallModal?: FC;
  UninstallCard?: FC;
  WarningModal?: FC;
};

export const MODAL_KEYS = [
  'UpdateApp',
  'UpdatingNotification',
  'InstallModal',
  'InstallUIModal',
  'CardInfoModal',
  'WarningModal',
  'CardExtensions',
  'UninstallCard',
  'LaunchConfig',
] as const;

export type TitleBarComponent = {
  AddStart?: ElementComp;

  ReplaceCenter?: ElementComp;
  AddCenter?: ElementComp;

  ReplaceEnd?: ElementComp;
  AddEnd?: ElementComp;
};

export type ExtensionStatusBar =
  | {
      Container?: (elements: ContainerElements) => ReactNode;
      add: ContainerElements;
    }
  | undefined;

export type ExtensionModal =
  | {
      UpdateApp?: FC;
      LaunchConfig?: FC;
      CardExtensions?: FC;
      UpdatingNotification?: FC;
      CardInfoModal?: FC;
      InstallUIModal?: FC;
      InstallModal?: FC;
      UninstallCard?: FC;
      WarningModal?: FC;
    }
  | undefined;

export type ExtensionTitleBar =
  | {
      AddStart?: ElementComp[];

      ReplaceCenter?: ElementComp;
      AddCenter?: ElementComp[];

      ReplaceEnd?: ElementComp;
      AddEnd?: ElementComp[];
    }
  | undefined;

export type ExtensionAppBackground = (() => ReactNode) | undefined;

export type ExtensionImport = {
  StatusBar?: StatusBarComponent;
  TitleBar?: TitleBarComponent;
  Background?: ExtensionAppBackground;
  CustomHook?: ElementComp;
  Modals?: ModalsComponent;
};
