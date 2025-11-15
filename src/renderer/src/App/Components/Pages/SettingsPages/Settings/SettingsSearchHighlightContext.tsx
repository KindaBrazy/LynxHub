import {PropsWithChildren, createContext, useContext} from 'react';

const SettingsSearchHighlightContext = createContext<string[] | undefined>(undefined);

export const SettingsSearchHighlightProvider = ({value, children}: PropsWithChildren<{value?: string[] | undefined}>) => {
  return <SettingsSearchHighlightContext.Provider value={value}>{children}</SettingsSearchHighlightContext.Provider>;
};

export const useSettingsSearchHighlightWords = () => {
  return useContext(SettingsSearchHighlightContext) ?? [];
};
