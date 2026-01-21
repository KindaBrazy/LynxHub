import classHolder from '../core/class_holder';

const sendToMain = (channel: string, ...args: any[]) => {
  const {appManager} = classHolder;
  if (appManager) {
    appManager.sendMessage(channel, ...args);
  } else {
    console.error('Failed to send message: appManager is undefined');
  }
};

const sendToLP = (channel: string, ...args: any[]) => {
  const {linkPreviewManager} = classHolder;
  if (linkPreviewManager) {
    linkPreviewManager.sendMessage(channel, ...args);
  } else {
    console.error('Failed to send message: appManager is undefined');
  }
};

export {sendToLP, sendToMain};
