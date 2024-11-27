import {useMemo} from 'react';

import {extensionsData} from './Extensions/ExtensionLoader';

const ExtensionHooks = () => {
  const customHooks = useMemo(() => extensionsData.addCustomHook, []);

  return (
    <>
      {customHooks.map((Hook, index) => (
        <Hook key={index} />
      ))}
    </>
  );
};

export default ExtensionHooks;
