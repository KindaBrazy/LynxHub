import {LynxInput} from '@lynx_common/types/ipc';
import {Event, Input, WebContents} from 'electron';

import {applicationIpc} from '../ipc/application';

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

// Fast string-based comparison instead of deep object comparison
function getModifierString(control: boolean, shift: boolean, alt: boolean, meta: boolean): string {
  return `${control ? 'c' : ''}${shift ? 's' : ''}${alt ? 'a' : ''}${meta ? 'm' : ''}`;
}

function sendToRenderer(input: LynxInput) {
  const {key, type, control, shift, alt, meta} = input;
  const modifiers = getModifierString(control, shift, alt, meta);

  // Fast string comparison instead of lodash isEqual
  if (key === prevKey && type === prevType && modifiers === prevModifiers) return;

  prevKey = key;
  prevType = type;
  prevModifiers = modifiers;

  applicationIpc.send.onHotkeysChange(input);
}

function onBlur() {
  prevKey = '';
  prevType = '';
  prevModifiers = '';
  applicationIpc.send.onHotkeysChange(initialKeys);
}

function onInput(_event: Event, input: Input) {
  const {control, key, shift, alt, meta, type} = input;
  const lowerKey = key.toLowerCase();

  const currentKeys: LynxInput = {control, key: lowerKey, shift, alt, meta, type};
  sendToRenderer(currentKeys);
}

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
    // Listeners are automatically removed when WebContents is destroyed,
    // but we need to clean up our tracking array
  });
}
