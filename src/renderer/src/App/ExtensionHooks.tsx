import {useMemo} from 'react';

import {extensionsData} from './Extensions/ExtensionLoader';

export default function ExtensionHooks() {
  const customHooks = useMemo(() => extensionsData.addCustomHook, []);

  return (
    <>
      {customHooks.map((Hook, index) => (
        <Hook key={index} />
      ))}
    </>
  );
}
