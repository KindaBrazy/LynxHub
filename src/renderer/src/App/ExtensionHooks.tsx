import {extensionsData} from './Extensions/ExtensionLoader';

export default function ExtensionHooks() {
  return (
    <>
      {extensionsData.addCustomHook.map((Hook, index) => (
        <Hook key={index} />
      ))}
    </>
  );
}
