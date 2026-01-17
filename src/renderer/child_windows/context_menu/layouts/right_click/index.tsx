import {Divider} from '@heroui/react';
import rendererIpc from '@lynx/ipc';
import type {ContextMenuParams} from 'electron';
import {isEmpty} from 'lodash';
import {useEffect, useMemo, useState} from 'react';

import {MenuTypes} from '../../consts';
import {CommonProps, NavHistory} from '../../types';
import {Edit} from './Edit';
import {Image} from './Image';
import {Links} from './Links';
import Navigation from './Navigation';
import PageActions from './PageActions';
import {Suggestions} from './Suggestions';
import TextSelection from './TextSelection';

export default function RightClick({setSelectedLayout, setWidthSize, show}: CommonProps) {
  const [contextMenuParams, setContextMenuParams] = useState<ContextMenuParams | undefined>(undefined);
  const [navigationHistory, setNavigationHistory] = useState<NavHistory>({canGoBack: false, canGoForward: false});
  const [id, setId] = useState<number>(0);

  const {hasLinkItems, hasImageItems, hasEditItems, hasTextSelection, isActionsAvailable} = useMemo(() => {
    const hasLinkItems = !isEmpty(contextMenuParams?.linkURL);
    const hasImageItems = contextMenuParams?.mediaType === 'image';
    const hasTextSelection = !isEmpty(contextMenuParams?.selectionText);
    const hasEditItems =
      contextMenuParams?.editFlags.canUndo ||
      contextMenuParams?.editFlags.canRedo ||
      contextMenuParams?.editFlags.canCut ||
      contextMenuParams?.editFlags.canCopy ||
      contextMenuParams?.editFlags.canPaste ||
      contextMenuParams?.editFlags.canSelectAll;

    const isActionsAvailable = hasLinkItems || hasEditItems || hasImageItems || hasTextSelection;

    return {
      hasLinkItems,
      hasImageItems,
      hasTextSelection,
      hasEditItems,
      isActionsAvailable,
    };
  }, [contextMenuParams]);

  useEffect(() => {
    if (hasLinkItems || hasImageItems || hasTextSelection) {
      setWidthSize('md');
    }
  }, [hasLinkItems, hasImageItems, hasTextSelection, contextMenuParams]);

  useEffect(() => {
    const offInitView = rendererIpc.contextMenu.onInitView((_, params, navHistory, contextId) => {
      setContextMenuParams(params);
      setNavigationHistory(navHistory);
      setId(contextId);

      setWidthSize('sm');
      setSelectedLayout(MenuTypes.RightClick);

      rendererIpc.contextMenu.showWindow();
    });

    return () => offInitView();
  }, []);

  if (!show) return null;

  return (
    <>
      <div key="space_start" className="w-full h-2" />
      <Navigation id={id} navHistory={navigationHistory} />
      <Divider key="sep_nav" className="my-1" />

      {contextMenuParams && (
        <>
          <Suggestions id={id} suggestions={contextMenuParams?.dictionarySuggestions || []} />
          {isActionsAvailable && (
            <span key="actions_title" className="ml-2 text-sm mb-1 font-semibold text-gray-600 dark:text-gray-400 px-2">
              Actions
            </span>
          )}

          {hasLinkItems && <Links url={contextMenuParams.linkURL} />}
          {hasImageItems && <Image id={id} url={contextMenuParams.srcURL} />}
          {hasTextSelection && <TextSelection selection={contextMenuParams.selectionText} />}
          {hasEditItems && (
            <Edit id={id} flags={contextMenuParams.editFlags} selection={contextMenuParams.selectionText} />
          )}

          <span
            key="page_actions_title"
            className="ml-2 text-sm mb-1 font-semibold text-gray-600 dark:text-gray-400 px-2">
            Page
          </span>
          <PageActions id={id} x={contextMenuParams.x} y={contextMenuParams.y} />
        </>
      )}

      <div key="space_end" className="w-full h-2" />
    </>
  );
}
