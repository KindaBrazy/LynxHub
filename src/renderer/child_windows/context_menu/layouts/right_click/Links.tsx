import {Divider} from '@heroui/react';
import rendererIpc from '@lynx/ipc';
import {Export, Link, SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';

import {ActionButton, createActionHandler} from './Utils';

type Props = {url: string};
export function Links({url}: Props) {
  if (!url) return null;

  return (
    <>
      <ActionButton
        onPress={createActionHandler(() => {
          rendererIpc.contextItems.newTab(url);
        })}
        key="context_newTab"
        title="Open link in new tab"
        icon={<SquareTopDown className="size-4" />}
      />
      <ActionButton
        onPress={createActionHandler(() => {
          rendererIpc.contextItems.openExternal(url);
        })}
        key="context_openExternal"
        title="Open link in default browser"
        icon={<Export className="size-4" />}
      />
      <ActionButton
        onPress={createActionHandler(() => {
          navigator.clipboard.writeText(url);
        })}
        key="context_copyLink"
        title="Copy Link Address"
        icon={<Link className="size-4" />}
      />
      <Divider className="my-2" key="sep_link_image" />
    </>
  );
}
