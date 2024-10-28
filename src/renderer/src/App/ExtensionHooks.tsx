import {useExtensions} from './Extensions/ExtensionsContext';

export default function ExtensionHooks() {
  const {customHooks} = useExtensions();
  return (
    <>
      {customHooks.map((Hook, index) => (
        <Hook key={index} />
      ))}
    </>
  );
}
