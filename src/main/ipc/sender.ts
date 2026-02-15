import classHolder from '@lynx_main/managers/classHolder';

const createSender = <K extends keyof typeof classHolder>(managerKey: K) => {
  return (channel: string, ...args: any[]) => {
    const manager = classHolder[managerKey];
    if (manager && typeof manager === 'object' && 'sendMessage' in manager) {
      (manager as any).sendMessage(channel, ...args);
    } else {
      classHolder.waitForClass(managerKey).then(manager => {
        if (manager && typeof manager === 'object' && 'sendMessage' in manager) {
          (manager as any).sendMessage(channel, ...args);
        }
      });
    }
  };
};

const sendToMain = createSender('appManager');
const sendToLP = createSender('linkPreviewManager');
const sendToCM = createSender('contextMenuManager');

export {sendToCM, sendToLP, sendToMain};
