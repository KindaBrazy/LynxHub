/**
 * Type declarations for the `__federation__` virtual module injected by
 * `@originjs/vite-plugin-federation` at build time.
 *
 * These two methods are the sole runtime API for Module Federation in Vite:
 * - `setRemote` — registers a remote entry URL under a given name before import.
 * - `getRemote` — dynamically imports a named export from a registered remote.
 *
 * The concrete signatures here match exactly how they are cast and used in
 * `plugins/extensions/index.ts`.
 */
declare module '__federation__' {
  /** Registers a remote module so it can be retrieved by `getRemote`. */
  export const __federation_method_setRemote: (
    remoteName: string,
    config: {format?: 'esm' | 'systemjs' | 'var'; from?: 'vite' | 'webpack'; url: string},
  ) => void;

  /** Dynamically imports a named export from a previously registered remote. */
  export const __federation_method_getRemote: (remoteName: string, exportName: string) => Promise<any>;
}
