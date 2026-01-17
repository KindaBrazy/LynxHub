import {Divider} from '@heroui/react';
import rendererIpc from '@lynx/ipc';
import {ClipboardText, Copy, Scissors, TextSelection, UndoLeftRound} from '@solar-icons/react-perf/BoldDuotone';
import type {EditFlags} from 'electron';
import {isEmpty} from 'lodash';

import {ActionButton, createActionHandler} from './Utils';

type Props = {flags: EditFlags; selection: string; id: number};
export function Edit({flags, selection, id}: Props) {
  const {canUndo, canCut, canRedo, canPaste, canSelectAll, canCopy} = flags;

  return (
    <>
      {canUndo && (
        <ActionButton
          onPress={createActionHandler(() => {
            rendererIpc.contextItems.undo(id);
          })}
          title="Undo"
          key="context_undo"
          icon={<UndoLeftRound className="size-4" />}
        />
      )}
      {canRedo && (
        <ActionButton
          onPress={createActionHandler(() => {
            rendererIpc.contextItems.redo(id);
          })}
          title="Redo"
          key="context_redo"
          icon={<UndoLeftRound className="size-4 scale-x-[-1]" />}
        />
      )}
      {canCut && !isEmpty(selection) && (
        <ActionButton
          onPress={createActionHandler(() => {
            rendererIpc.contextItems.cut(id);
          })}
          title="Cut"
          key="context_cut"
          icon={<Scissors className="size-4" />}
        />
      )}
      {canCopy && !isEmpty(selection) && (
        <ActionButton
          onPress={createActionHandler(() => {
            rendererIpc.contextItems.copy(id);
          })}
          title="Copy"
          key="context_copy"
          icon={<Copy className="size-4" />}
        />
      )}
      {canPaste && (
        <ActionButton
          onPress={createActionHandler(() => {
            rendererIpc.contextItems.paste(id);
          })}
          title="Paste"
          key="context_paste"
          icon={<ClipboardText className="size-4" />}
        />
      )}
      {canSelectAll && (
        <ActionButton
          onPress={createActionHandler(() => {
            rendererIpc.contextItems.selectAll(id);
          })}
          title="Select All"
          key="context_selectAll"
          icon={<TextSelection className="size-4" />}
        />
      )}
      <Divider className="my-2" key="sep_edit_page" />
    </>
  );
}
