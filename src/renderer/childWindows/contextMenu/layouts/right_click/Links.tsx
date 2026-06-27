import applicationIpc from '@lynx_shared/ipc/application';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {Export, Link, SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

import Separator from './Separator';
import {ActionButton, createActionHandler} from './Utils';

type LinksProps = {
  /** The URL to perform actions on */
  url: string;
};

/**
 * Component that renders context menu actions for links.
 * Includes options to open in new tab, open in default browser, and copy link.
 */
export const Links = memo(function Links({url}: LinksProps) {
  if (!url) return null;

  return (
    <>
      <ActionButton
        onPress={createActionHandler(() => {
          contextMenuIpc.send.rightClickItems.newTab(url);
        })}
        title="Open link in new tab"
        icon={<SquareTopDown className="size-3.5" />}
      />
      <ActionButton
        onPress={createActionHandler(() => {
          applicationIpc.send.openUrlDefaultBrowser(url);
        })}
        title="Open link in default browser"
        icon={<Export className="size-4" />}
      />
      <ActionButton
        onPress={createActionHandler(async () => {
          try {
            await navigator.clipboard.writeText(url);
          } catch (e) {
            console.error('Failed to copy link address:', e);
          }
        })}
        title="Copy Link Address"
        icon={<Link className="size-4" />}
      />
      <Separator />
    </>
  );
});
