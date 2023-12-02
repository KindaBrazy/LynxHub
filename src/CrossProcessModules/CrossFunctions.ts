import React from 'react';
import {DefaultA1Dir, DefaultComfyDir, DefaultLSHDir, DefaultOOBADir, DefaultRSXDir, WebuiList} from '../AppState/AppConstants';
import {GetUserConfigData, UpdateSDAppConfig} from '../main/AppManage/AppConfigManager';

export function setInstalledWebUiById(repoUserName: string, setState: React.Dispatch<React.SetStateAction<WebuiList>>): void {
  switch (repoUserName) {
    case 'AUTOMATIC1111':
      setState((prevState) => ({
        AUTOMATIC1111: true,
        LSHQQYTIGER: prevState.LSHQQYTIGER,
        OOBABOOGA: prevState.OOBABOOGA,
        RSXDALV: prevState.RSXDALV,
        COMFYANONYMOUS: prevState.COMFYANONYMOUS,
      }));
      break;
    case 'LSHQQYTIGER':
      setState((prevState) => ({
        AUTOMATIC1111: prevState.AUTOMATIC1111,
        LSHQQYTIGER: true,
        OOBABOOGA: prevState.OOBABOOGA,
        RSXDALV: prevState.RSXDALV,
        COMFYANONYMOUS: prevState.COMFYANONYMOUS,
      }));
      break;
    case 'COMFYANONYMOUS':
      setState((prevState) => ({
        AUTOMATIC1111: prevState.AUTOMATIC1111,
        LSHQQYTIGER: prevState.LSHQQYTIGER,
        OOBABOOGA: prevState.OOBABOOGA,
        RSXDALV: prevState.RSXDALV,
        COMFYANONYMOUS: true,
      }));
      break;
    case 'OOBABOOGA':
      setState((prevState) => ({
        AUTOMATIC1111: prevState.AUTOMATIC1111,
        LSHQQYTIGER: prevState.LSHQQYTIGER,
        OOBABOOGA: true,
        RSXDALV: prevState.RSXDALV,
        COMFYANONYMOUS: prevState.COMFYANONYMOUS,
      }));
      break;
    case 'RSXDALV':
      setState((prevState) => ({
        AUTOMATIC1111: prevState.AUTOMATIC1111,
        LSHQQYTIGER: prevState.LSHQQYTIGER,
        OOBABOOGA: prevState.OOBABOOGA,
        RSXDALV: true,
        COMFYANONYMOUS: prevState.COMFYANONYMOUS,
      }));
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
    case 'COMFYANONYMOUS':
      return installedWebUi.COMFYANONYMOUS;
    case 'OOBABOOGA':
      return installedWebUi.OOBABOOGA;
    case 'RSXDALV':
      return installedWebUi.RSXDALV;
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
  } else if (uiName === 'COMFYANONYMOUS') {
    UpdateSDAppConfig(
      {
        WebUi: {
          ...GetUserConfigData().WebUi,
          COMFYANONYMOUS: {...GetUserConfigData().WebUi.COMFYANONYMOUS, installed: true, localDir: dir},
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
  } else if (uiName === 'RSXDALV') {
    UpdateSDAppConfig(
      {
        WebUi: {
          ...GetUserConfigData().WebUi,
          RSXDALV: {...GetUserConfigData().WebUi.RSXDALV, installed: true, localDir: dir},
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
    case 'COMFYANONYMOUS':
      return DefaultComfyDir;
    case 'OOBABOOGA':
      return DefaultOOBADir;
    case 'RSXDALV':
      return DefaultRSXDir;
    default:
      console.log(`getDefaultDirByID -> No correct repoUserName -> ${uiName}`);
      return '';
  }
}
