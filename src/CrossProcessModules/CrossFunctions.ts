import React from 'react';
import {DefaultA1Dir, DefaultLSHDir, WebuiList} from '../AppState/AppConstants';
import {GetUserConfigData, UpdateAppConfig} from '../main/AppManage/AppConfigManager';

export function setInstalledWebUiById(repoUserName: string, setState: React.Dispatch<React.SetStateAction<WebuiList>>): void {
  switch (repoUserName) {
    case 'AUTOMATIC1111':
      setState((prevState) => ({AUTOMATIC1111: true, LSHQQYTIGER: prevState.LSHQQYTIGER}));
      break;
    case 'LSHQQYTIGER':
      setState((prevState) => ({AUTOMATIC1111: prevState.AUTOMATIC1111, LSHQQYTIGER: true}));
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
    default:
      console.log(`No correct repoUserName -> ${repoUserName}`);
      return false;
  }
}

export function saveInstalledUiConfig(uiName: string, dir: string) {
  if (uiName === 'AUTOMATIC1111') {
    UpdateAppConfig(
      {
        WebUi: {
          ...GetUserConfigData().WebUi,
          AUTOMATIC1111: {...GetUserConfigData().WebUi.AUTOMATIC1111, installed: true, localDir: dir},
        },
      },
      true,
    );
  } else if (uiName === 'LSHQQYTIGER') {
    UpdateAppConfig(
      {
        WebUi: {
          ...GetUserConfigData().WebUi,
          LSHQQYTIGER: {...GetUserConfigData().WebUi.LSHQQYTIGER, installed: true, localDir: dir},
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
    default:
      console.log(`getDefaultDirByID -> No correct repoUserName -> ${uiName}`);
      return '';
  }
}
