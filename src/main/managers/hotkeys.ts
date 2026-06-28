import {LynxInput} from '@lynx_common/types/ipc';
import {applicationIpc} from '@lynx_main/ipc/application';
import {Event, Input, WebContents} from 'electron';

import classHolder from './classHolder';

const initialKeys: LynxInput = {
  control: false,
  alt: false,
  shift: false,
  key: '',
  meta: false,
  type: '',
};

let prevKey = '';
let prevType = '';
let prevModifiers = '';

const registeredHotkeys: number[] = [];

/**
 * Generates a string representation of modifier keys for efficient comparison.
 * @param control - Control key state
 * @param shift - Shift key state
 * @param alt - Alt key state
 * @param meta - Meta/Command key state
 * @returns Short string representing modifiers (e.g., "csam")
 */
function getModifierString(control: boolean, shift: boolean, alt: boolean, meta: boolean): string {
  return `${control ? 'c' : ''}${shift ? 's' : ''}${alt ? 'a' : ''}${meta ? 'm' : ''}`;
}

/**
 * Sends hotkey input to the renderer process if it differs from the previous input.
 * Uses fast string comparison to avoid unnecessary IPC calls.
 * @param input - The input event data
 * @param isHotkey - Whether this input is a registered hotkey
 */
function sendToRenderer(input: LynxInput, isHotkey: boolean) {
  const {key, type, control, shift, alt, meta} = input;
  const modifiers = getModifierString(control, shift, alt, meta);

  // Fast string comparison instead of deep object comparison
  // Bypass duplicate check for hotkeys so they can be triggered repeatedly (e.g. Ctrl+T, Ctrl+W)
  if (!isHotkey && key === prevKey && type === prevType && modifiers === prevModifiers) return;

  prevKey = key;
  prevType = type;
  prevModifiers = modifiers;

  applicationIpc.send.onHotkeysChange(input);
}

/**
 * Resets tracked keys when the window loses focus.
 * Ensures stuck keys are cleared.
 */
function onBlur() {
  prevKey = '';
  prevType = '';
  prevModifiers = '';
  applicationIpc.send.onHotkeysChange(initialKeys);
}

/**
 * Handles input events from WebContents.
 * Normalizes input and sends it to the renderer.
 * @param event - Electron event
 * @param input - Input data from Electron
 */
function onInput(event: Event, input: Input) {
  const {control, key, shift, alt, meta, type} = input;
  const lowerKey = key.toLowerCase();

  const storageManager = classHolder.storageManager;
  const hotkeys = storageManager?.getData('app')?.hotkeys || [];

  const isHotkey = hotkeys.some(h => {
    if (!h.key) return false;
    return (
      h.key.toLowerCase() === lowerKey &&
      !!h.control === control &&
      !!h.shift === shift &&
      !!h.alt === alt &&
      !!h.meta === meta
    );
  });

  if (isHotkey) {
    event.preventDefault();
  }

  const currentKeys: LynxInput = {control, key: lowerKey, shift, alt, meta, type};
  sendToRenderer(currentKeys, isHotkey);
}

/**
 * Registers global hotkey listeners for a given WebContents instance.
 * Tracks registered instances to prevent duplicate listeners.
 * @param contents - The WebContents to listen to
 */
export default function RegisterHotkeys(contents: WebContents) {
  if (registeredHotkeys.includes(contents.id)) return;
  registeredHotkeys.push(contents.id);

  contents.on('blur', onBlur);
  contents.on('before-input-event', onInput);

  // Clean up listeners when WebContents is destroyed to prevent memory leak
  contents.on('destroyed', () => {
    const index = registeredHotkeys.indexOf(contents.id);
    if (index !== -1) {
      registeredHotkeys.splice(index, 1);
    }
    // Note: Event listeners attached to `contents` are automatically removed by Electron when destroyed.
    // We only need to remove the ID from our tracking array.
  });
}
