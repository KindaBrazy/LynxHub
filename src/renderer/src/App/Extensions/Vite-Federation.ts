// @ts-ignore-next-line
import {__federation_method_getRemote, __federation_method_setRemote} from '__federation__';
import {ReactNode} from 'react';

type RemotesConfig = {
  format?: 'esm' | 'systemjs' | 'var';
  from?: 'vite' | 'webpack';
  url: string;
};

type SetRemoteModule = (remotesName: string, remotesConfig: RemotesConfig) => void;

type GetRemoteModule = (
  remoteName: string,
  componentName: string,
) => Promise<{
  StatusBar: {
    (): ReactNode;
    Start: () => ReactNode;
    Center: () => ReactNode;
    End: () => ReactNode;
  };
}>;

export const setRemote: SetRemoteModule = __federation_method_setRemote;
export const getRemote: GetRemoteModule = __federation_method_getRemote;
