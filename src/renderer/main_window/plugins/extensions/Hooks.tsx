import {useMemo} from 'react';

import {extensionsData} from './loader';

const Hooks = () => {
  const customHooks = useMemo(() => extensionsData.addCustomHook, []);

  return (
    <>
      {customHooks.map((Hook, index) => (
        <Hook key={index} />
      ))}
    </>
  );
};

export default Hooks;
