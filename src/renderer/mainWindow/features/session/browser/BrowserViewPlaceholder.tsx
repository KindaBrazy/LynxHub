import browserIpc from '@lynx_shared/ipc/browser';

import {useElementResizing} from '../../../utils/hooks';

export default function BrowserViewPlaceholder() {
  const containerRef = useElementResizing(browserIpc.send.resizeBrowserView);

  return <div ref={containerRef} className="size-full" />;
}
