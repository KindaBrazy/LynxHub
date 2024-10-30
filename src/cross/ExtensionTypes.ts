import {ComponentProps, FC, ReactNode} from 'react';
import {RouteObject} from 'react-router-dom';

// -----------------------------------------------> Elements & Props
export type ElementProps = ComponentProps<'div'>;

export type FcProp = FC<ElementProps>;

export type ContainerElements = {
  start: FcProp[];
  center: FcProp[];
  end: FcProp[];
};

// -----------------------------------------------> Status Bar
export type StatusBarComponent = {
  Container?: (elements: ContainerElements) => ReactNode;
  Start?: FcProp;
  Center?: FcProp;
  End?: FcProp;
};

export type ExtensionStatusBar =
  | {
      Container?: (elements: ContainerElements) => ReactNode;
      add: ContainerElements;
    }
  | undefined;

// -----------------------------------------------> Modals
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

// -----------------------------------------------> Title Bar
export type TitleBarComponent = {
  AddStart?: FcProp;

  ReplaceCenter?: FcProp;
  AddCenter?: FcProp;

  ReplaceEnd?: FcProp;
  AddEnd?: FcProp;
};

export type ExtensionTitleBar =
  | {
      AddStart?: FcProp[];

      ReplaceCenter?: FcProp;
      AddCenter?: FcProp[];

      ReplaceEnd?: FcProp;
      AddEnd?: FcProp[];
    }
  | undefined;

// -----------------------------------------------> Nav Bar
export type NavBarComponent = {
  NavBar?: FC;
  ContentButtons?: FC;
  SettingsButtons?: FC;
  AddContentButton?: FC;
  AddSettingsButton?: FC;
};

export type ExtensionNavBar =
  | {
      NavBar?: FC;
      ContentButtons?: FC;
      SettingsButtons?: FC;
      AddContentButton?: FC[];
      AddSettingsButton?: FC[];
    }
  | undefined;

// -----------------------------------------------> Nav Bar
export type RunningAIComponent = {
  Container?: FC;
  Terminal?: FC;
  Browser?: FC;
};

export type ExtensionRunningAI = RunningAIComponent | undefined;

// -----------------------------------------------> Background
export type ExtensionAppBackground = (() => ReactNode) | undefined;

// -----------------------------------------------> Background

export type ExtensionPages = {
  HomePage?: FC;
  ImageGenerationPage?: FC;
  TextGenerationPage?: FC;
  AudioGenerationPage?: FC;
  ModulesPage?: FC;
  SettingsPage?: FC;
  DashboardPage?: FC;
};

// -----------------------------------------------> Final Export
export type ExtensionImport = {
  StatusBar?: StatusBarComponent;
  TitleBar?: TitleBarComponent;
  NavBar?: NavBarComponent;
  RunningAI?: RunningAIComponent;
  Background?: ExtensionAppBackground;
  RoutePage?: RouteObject[];
  Pages?: ExtensionPages;
  CustomHook?: FcProp;
  Modals?: ModalsComponent;
};
