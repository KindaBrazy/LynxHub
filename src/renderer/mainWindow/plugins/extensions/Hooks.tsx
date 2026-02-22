import { extensionsData } from './loader';

/**
 * Renders all custom hooks registered by loaded extensions.
 *
 * Extensions can call `addCustomHook` on the renderer API to inject arbitrary
 * hook-based logic (e.g. side-effects, global state subscriptions) into the
 * React tree without needing to modify the core application. Each registered
 * hook component is mounted here at the root level.
 *
 * The `extensionsData.addCustomHook` array is populated synchronously during
 * extension initialization (before React renders), so it never changes after
 * mount — no memoization or state is needed.
 */
const ExtensionCustomHooks = () => {
  const customHooks = extensionsData.addCustomHook;

  return (
    <>
      {customHooks.map((Hook, index) => (
        <Hook key={index} />
      ))}
    </>
  );
};

export default ExtensionCustomHooks;
