import {isArray} from 'lodash';
import {FC} from 'react';

import {extensionRendererApi} from './ExtensionLoader';

export const eventUtil_TerminalPreCommands = (id: string, job: (preCommands: string[]) => void) => {
  const preCommands: string[] = [];
  let doneAdd: number = 0;

  const listenerCount = extensionRendererApi.events.getListenerCount('card_install_command_before_terminal_action');
  if (listenerCount > 0) {
    extensionRendererApi.events.emit('card_install_command_before_terminal_action', {
      id,
      addCommand: commands => {
        if (isArray(commands)) {
          preCommands.push(...commands);
        } else {
          preCommands.push(commands);
        }
        doneAdd += 1;

        if (doneAdd === listenerCount) {
          job(preCommands);
        }
      },
    });
  } else {
    job(preCommands);
  }
};

export const eventUtil_CardStartPreCommands = (id: string, job: (preCommands: string[]) => void) => {
  const preCommands: string[] = [];
  let doneAdd: number = 0;

  const listenerCount = extensionRendererApi.events.getListenerCount('card_start_pre_commands');
  if (listenerCount > 0) {
    extensionRendererApi.events.emit('card_start_pre_commands', {
      id,
      addCommand: commands => {
        if (isArray(commands)) {
          preCommands.push(...commands);
        } else {
          preCommands.push(commands);
        }
        doneAdd += 1;

        if (doneAdd === listenerCount) {
          job(preCommands);
        }
      },
    });
  } else {
    job(preCommands);
  }
};

export const eventUtil_CollectUserInputs = (id: string, job: (elements: FC[]) => void) => {
  const elements: FC[] = [];
  let doneAdd: number = 0;

  const listenerCount = extensionRendererApi.events.getListenerCount('card_collect_user_input');
  if (listenerCount > 0) {
    extensionRendererApi.events.emit('card_collect_user_input', {
      id,
      addElements: element => {
        elements.push(...element);
        doneAdd += 1;

        if (doneAdd === listenerCount) {
          job(elements);
        }
      },
    });
  } else {
    job(elements);
  }
};

export const eventUtil_UninstallPreCommands = (id: string, job: (preCommands: string[]) => void) => {
  const preCommands: string[] = [];
  const LINE_ENDING = window.osPlatform === 'win32' ? '\r' : '\n';
  let doneAdd: number = 0;

  const listenerCount = extensionRendererApi.events.getListenerCount('card_uninstall_pre_commands');
  if (listenerCount > 0) {
    extensionRendererApi.events.emit('card_uninstall_pre_commands', {
      id,
      addCommand: commands => {
        if (isArray(commands)) {
          preCommands.push(...commands.map(command => `${command}${LINE_ENDING}`));
        } else {
          preCommands.push(`${commands}${LINE_ENDING}`);
        }
        doneAdd += 1;

        if (doneAdd === listenerCount) {
          job(preCommands);
        }
      },
    });
  } else {
    job(preCommands);
  }
};
