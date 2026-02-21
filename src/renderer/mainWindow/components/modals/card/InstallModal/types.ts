import {FC} from 'react';

/**
 * Represents the current active step/view inside the installation modal body.
 */
export type BodyState =
  | 'starter'
  | 'clone'
  | 'terminal'
  | 'progress'
  | 'progress-bar'
  | 'user-input'
  | 'install-extensions'
  | 'done'
  | 'extension-custom'
  | '';

/**
 * Represents the internal state of the installation modal.
 */
export interface InstallState {
  /** The current active view to display in the modal body. */
  body: BodyState;
  /** The git URL to clone from, if applicable. */
  cloneUrl: string;
  /** Contains the final state information when installation completes. */
  doneAll: {type: 'success' | 'error'; title: string; description?: string};
  /** Whether the cloning process has been initiated and should start. */
  startClone: boolean;
  /** If true, prevents the user from selecting a custom installation directory. */
  disableSelectDir: boolean;
  /** A custom React component provided by an extension to render in the modal. */
  extensionCustomContent: FC | undefined;
  /** A list of custom React components provided by an extension for user input. */
  extensionUserInput: FC[] | undefined;
  /** A unique key used to force re-render of the terminal component. */
  terminalKey: number;
}
