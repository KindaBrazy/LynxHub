import {browserChannels} from '@lynx_cross/consts/ipc';

import lynxIpc from './lynxIpc';

const browserIpc = {
  onLinkHover: (callback: (url: string) => void) => lynxIpc.on(browserChannels.onLinkHover, callback),
  resizeLinkPreview: (width: number) => lynxIpc.send(browserChannels.resizeLinkPreview, width),
};

export default browserIpc;
