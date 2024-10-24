// @ts-ignore-next-line
import {__federation_method_getRemote, __federation_method_setRemote} from '__federation__';

import {ExtensionImport} from './ExtensionTypes';

type RemotesConfig = {
  format?: 'esm' | 'systemjs' | 'var';
  from?: 'vite' | 'webpack';
  url: string;
};

type SetRemoteModule = (remotesName: string, remotesConfig: RemotesConfig) => void;

type GetRemoteModule = (remoteName: string, componentName: string) => Promise<ExtensionImport>;

export const setRemote: SetRemoteModule = __federation_method_setRemote;
export const getRemote: GetRemoteModule = __federation_method_getRemote;
