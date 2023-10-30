import React from 'react';
import {DefaultA1Dir, DefaultLSHDir, DefaultOOBADir, WebuiList} from '../AppState/AppConstants';
import {GetUserConfigData, UpdateSDAppConfig} from '../main/AppManage/AppConfigManager';

export function setInstalledWebUiById(repoUserName: string, setState: React.Dispatch<React.SetStateAction<WebuiList>>): void {
  switch (repoUserName) {
    case 'AUTOMATIC1111':
      setState((prevState) => ({AUTOMATIC1111: true, LSHQQYTIGER: prevState.LSHQQYTIGER, OOBABOOGA: prevState.OOBABOOGA}));
      break;
    case 'LSHQQYTIGER':
      setState((prevState) => ({AUTOMATIC1111: prevState.AUTOMATIC1111, LSHQQYTIGER: true, OOBABOOGA: prevState.OOBABOOGA}));
      break;
    case 'OOBABOOGA':
      setState((prevState) => ({AUTOMATIC1111: prevState.AUTOMATIC1111, LSHQQYTIGER: prevState.LSHQQYTIGER, OOBABOOGA: true}));
      break;
    default:
      console.log(`No correct repoUserName -> ${repoUserName}`);
      break;
  }
}

export function getIsInstalledById(repoUserName: string, installedWebUi: WebuiList): boolean {
  switch (repoUserName) {
    case 'AUTOMATIC1111':
      return installedWebUi.AUTOMATIC1111;
    case 'LSHQQYTIGER':
      return installedWebUi.LSHQQYTIGER;
    case 'OOBABOOGA':
      return installedWebUi.OOBABOOGA;
    default:
      console.log(`No correct repoUserName -> ${repoUserName}`);
      return false;
  }
}

export function saveInstalledUiConfig(uiName: string, dir: string) {
  if (uiName === 'AUTOMATIC1111') {
    UpdateSDAppConfig(
      {
        WebUi: {
          ...GetUserConfigData().WebUi,
          AUTOMATIC1111: {...GetUserConfigData().WebUi.AUTOMATIC1111, installed: true, localDir: dir},
        },
      },
      true,
    );
  } else if (uiName === 'LSHQQYTIGER') {
    UpdateSDAppConfig(
      {
        WebUi: {
          ...GetUserConfigData().WebUi,
          LSHQQYTIGER: {...GetUserConfigData().WebUi.LSHQQYTIGER, installed: true, localDir: dir},
        },
      },
      true,
    );
  } else if (uiName === 'OOBABOOGA') {
    UpdateSDAppConfig(
      {
        WebUi: {
          ...GetUserConfigData().WebUi,
          OOBABOOGA: {...GetUserConfigData().WebUi.OOBABOOGA, installed: true, localDir: dir},
        },
      },
      true,
    );
  }
}

export function getDefaultDirByID(uiName: string) {
  switch (uiName) {
    case 'AUTOMATIC1111':
      return DefaultA1Dir;
    case 'LSHQQYTIGER':
      return DefaultLSHDir;
    case 'OOBABOOGA':
      return DefaultOOBADir;
    default:
      console.log(`getDefaultDirByID -> No correct repoUserName -> ${uiName}`);
      return '';
  }
}
