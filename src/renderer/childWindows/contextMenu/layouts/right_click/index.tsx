import {Separator} from '@heroui-v3/react';
import {memo} from 'react';

import {useContextState} from '../../redux/reducer';
import {Edit} from './Edit';
import {Image} from './Image';
import {Links} from './Links';
import Navigation from './Navigation';
import PageActions from './PageActions';
import {Suggestions} from './Suggestions';
import TextSelection from './TextSelection';

/**
 * Main component for the Right Click Context Menu.
 * Orchestrates the display of different menu sections based on context (links, images, text, etc.).
 */
const RightClick = memo(function RightClick() {
  const {id, navigationHistory, contextMenuParams} = useContextState('rightClick');
  const {hasLinkItems, hasImageItems, hasTextSelection, hasEditItems, isActionsAvailable} =
    useContextState('rightClickParams');

  // If no params, we shouldn't render much, but the structure implies we might show navigation?
  // Actually, without contextMenuParams, most things are hidden.
  // Navigation seems independent of contextMenuParams in the original code,
  // but logically it usually appears with a page.

  return (
    <div className="overflow-hidden">
      <div className="w-full h-2" />
      <Navigation id={id} navHistory={navigationHistory} />
      <Separator className="my-1" />

      {contextMenuParams && (
        <>
          <Suggestions id={id} suggestions={contextMenuParams?.dictionarySuggestions || []} />

          {isActionsAvailable && (
            <span className="ml-2 text-sm mb-1 font-semibold text-gray-600 dark:text-gray-400 px-2">Actions</span>
          )}

          {hasLinkItems && <Links url={contextMenuParams.linkURL} />}
          {hasImageItems && <Image id={id} url={contextMenuParams.srcURL} />}
          {hasTextSelection && <TextSelection selection={contextMenuParams.selectionText} />}
          {hasEditItems && (
            <Edit id={id} flags={contextMenuParams.editFlags} selection={contextMenuParams.selectionText} />
          )}

          <span className="ml-2 text-sm mb-1 font-semibold text-gray-600 dark:text-gray-400 px-2">Page</span>
          <PageActions id={id} x={contextMenuParams.x} y={contextMenuParams.y} />
        </>
      )}

      <div className="w-full h-2" />
    </div>
  );
});

export default RightClick;
