import {Divider} from '@heroui/react';
import rendererIpc from '@lynx/ipc';
import {Copy, GalleryCircle, GalleryDownload, GalleryWide, Link} from '@solar-icons/react-perf/BoldDuotone';

import {ActionButton, createActionHandler} from './Utils';

type Props = {id: number; url: string};
export function Image({id, url}: Props) {
  if (!url) return null;

  return (
    <>
      <ActionButton
        onPress={createActionHandler(() => {
          rendererIpc.contextItems.newTab(url);
        })}
        key="context_openImageTab"
        title="Open Image in New Tab"
        icon={<GalleryWide className="size-4" />}
      />
      <ActionButton
        onPress={createActionHandler(() => {
          rendererIpc.contextItems.copyImage(url);
        })}
        title="Copy Image"
        key="context_copyImage"
        icon={<Copy className="size-4" />}
      />
      <ActionButton
        onPress={createActionHandler(() => {
          rendererIpc.contextItems.downloadImage(id, url);
        })}
        title="Save Image"
        key="context_saveImage"
        icon={<GalleryDownload className="size-4" />}
      />
      <ActionButton
        onPress={createActionHandler(() => {
          navigator.clipboard.writeText(url);
        })}
        title="Copy Image Address"
        key="context_copyImageAddress"
        icon={<Link className="size-4" />}
      />
      <ActionButton
        onPress={createActionHandler(() => {
          rendererIpc.contextItems.newTab(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`);
        })}
        key="context_searchImage"
        title="Search Web for Image"
        icon={<GalleryCircle className="size-4" />}
      />
      <Divider className="my-2" key="sep_image_text" />
    </>
  );
}
