import {memo} from 'react';

import {useContextState} from '../../redux/reducer';
import {Edit} from './Edit';
import {Image} from './Image';
import {Links} from './Links';
import Navigation from './Navigation';
import PageActions from './PageActions';
import Separator from './Separator';
import {Suggestions} from './Suggestions';
import TextSelection from './TextSelection';

/**
 * Main component for the Right Click Context Menu.
 * Orchestrates the display of different menu sections based on context (links, images, text, etc.).
 */
const RightClick = memo(function RightClick() {
  const {id, navigationHistory, contextMenuParams} = useContextState('rightClick');
  const {hasLinkItems, hasImageItems, hasTextSelection, hasEditItems} = useContextState('rightClickParams');

  // If no params, we shouldn't render much, but the structure implies we might show navigation?
  // Actually, without contextMenuParams, most things are hidden.
  // Navigation seems independent of contextMenuParams in the original code,
  // but logically it usually appears with a page.

  return (
    <div className="overflow-hidden px-1.5 flex flex-col gap-y-1 py-2">
      <Navigation id={id} navHistory={navigationHistory} />
      <Separator />

      {contextMenuParams && (
        <>
          <Suggestions id={id} suggestions={contextMenuParams?.dictionarySuggestions || []} />

          {hasLinkItems && <Links url={contextMenuParams.linkURL} />}
          {hasImageItems && <Image id={id} url={contextMenuParams.srcURL} />}
          {hasTextSelection && <TextSelection selection={contextMenuParams.selectionText} />}
          {hasEditItems && (
            <Edit id={id} flags={contextMenuParams.editFlags} selection={contextMenuParams.selectionText} />
          )}

          <PageActions id={id} x={contextMenuParams.x} y={contextMenuParams.y} />
        </>
      )}
    </div>
  );
});

export default RightClick;
