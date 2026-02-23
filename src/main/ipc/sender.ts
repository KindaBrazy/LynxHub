import classHolder from '@lynx_main/managers/classHolder';

/**
 * Creates a sender function that sends IPC messages to a specific manager's window.
 * @param managerKey - The key of the manager in classHolder.
 * @returns A function that sends a message on a specific channel.
 */
const createSender = <K extends keyof typeof classHolder>(managerKey: K) => {
  return (channel: string, ...args: any[]) => {
    const manager = classHolder[managerKey];
    // Check if manager exists and has sendMessage method
    if (manager && typeof manager === 'object' && 'sendMessage' in manager) {
      (manager as any).sendMessage(channel, ...args);
    } else {
      // Wait for manager to be initialized if not available yet
      classHolder.waitForClass(managerKey).then(manager => {
        if (manager && typeof manager === 'object' && 'sendMessage' in manager) {
          (manager as any).sendMessage(channel, ...args);
        }
      });
    }
  };
};

const sendToMain = createSender('appManager');
const sendToLinkPreview = createSender('linkPreviewManager');
const sendToContextMenu = createSender('contextMenuManager');

export {sendToContextMenu, sendToLinkPreview, sendToMain};
