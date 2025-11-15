import {createContext, PropsWithChildren, useContext, useMemo} from 'react';

const SettingsSearchQueryContext = createContext<string>('');

export const SettingsSearchQueryProvider = ({value, children}: PropsWithChildren<{value: string}>) => {
  const normalized = useMemo(() => value.trim(), [value]);
  return <SettingsSearchQueryContext.Provider value={normalized}>{children}</SettingsSearchQueryContext.Provider>;
};

export const useSettingsSearchQuery = (): string => {
  return useContext(SettingsSearchQueryContext);
};
