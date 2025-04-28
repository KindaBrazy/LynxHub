import {Event, Input, WebContents} from 'electron';
import lodash from 'lodash';

import {appWindowChannels, LynxInput} from '../../cross/IpcChannelAndTypes';
import {appManager} from '../index';

const initialKeys: LynxInput = {
  control: false,
  alt: false,
  shift: false,
  key: '',
  meta: false,
  type: '',
};

let prevKeys: LynxInput = initialKeys;
let currentKeys: LynxInput = initialKeys;

const registeredHotkeys: number[] = [];

function sendToRenderer() {
  if (lodash.isEqual(prevKeys, currentKeys)) return;
  prevKeys = currentKeys;
  appManager.getWebContent()?.send(appWindowChannels.hotkeysChange, currentKeys);
}

function onBlur() {
  currentKeys = initialKeys;
  sendToRenderer();
}

function onInput(_event: Event, input: Input) {
  const {control, key, shift, alt, meta, type} = input;
  currentKeys = {control, key: key.toLowerCase(), shift, alt, meta, type};

  sendToRenderer();
}

export default function RegisterHotkeys(contents: WebContents) {
  if (registeredHotkeys.includes(contents.id)) return;
  registeredHotkeys.push(contents.id);

  contents.on('blur', onBlur);
  contents.on('before-input-event', onInput);
}
