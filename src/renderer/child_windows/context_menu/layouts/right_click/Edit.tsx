import {Divider} from '@heroui/react';
import contextItemsIpc from '@lynx/ipc/context_items';
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
            contextItemsIpc.undo(id);
          })}
          title="Undo"
          key="context_undo"
          icon={<UndoLeftRound className="size-4" />}
        />
      )}
      {canRedo && (
        <ActionButton
          onPress={createActionHandler(() => {
            contextItemsIpc.redo(id);
          })}
          title="Redo"
          key="context_redo"
          icon={<UndoLeftRound className="size-4 scale-x-[-1]" />}
        />
      )}
      {canCut && !isEmpty(selection) && (
        <ActionButton
          onPress={createActionHandler(() => {
            contextItemsIpc.cut(id);
          })}
          title="Cut"
          key="context_cut"
          icon={<Scissors className="size-4" />}
        />
      )}
      {canCopy && !isEmpty(selection) && (
        <ActionButton
          onPress={createActionHandler(() => {
            contextItemsIpc.copy(id);
          })}
          title="Copy"
          key="context_copy"
          icon={<Copy className="size-4" />}
        />
      )}
      {canPaste && (
        <ActionButton
          onPress={createActionHandler(() => {
            contextItemsIpc.paste(id);
          })}
          title="Paste"
          key="context_paste"
          icon={<ClipboardText className="size-4" />}
        />
      )}
      {canSelectAll && (
        <ActionButton
          onPress={createActionHandler(() => {
            contextItemsIpc.selectAll(id);
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
