import {Divider} from '@heroui/react';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {MagniferBug} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

import {ActionButton, createActionHandler} from './Utils';

type Props = {selection: string};

const TextSelection = memo(({selection}: Props) => {
  if (!selection) return null;

  return (
    <>
      <ActionButton
        onPress={createActionHandler(() => {
          contextMenuIpc.send.rightClickItems.searchWithGoogle(selection);
        })}
        key="context_searchGoogle"
        title={`Search with Google`}
        icon={<MagniferBug className="size-4" />}
      />
      <Divider className="my-2" key="sep_text_edit" />
    </>
  );
});

export default TextSelection;
