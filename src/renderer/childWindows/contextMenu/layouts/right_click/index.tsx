import {Divider} from '@heroui/react';
import {memo} from 'react';

import {useContextState} from '../../redux/reducer';
import {Edit} from './Edit';
import {Image} from './Image';
import {Links} from './Links';
import Navigation from './Navigation';
import PageActions from './PageActions';
import {Suggestions} from './Suggestions';
import TextSelection from './TextSelection';

const RightClick = memo(() => {
  const {id, navigationHistory, contextMenuParams} = useContextState('rightClick');
  const {hasLinkItems, hasImageItems, hasTextSelection, hasEditItems, isActionsAvailable} =
    useContextState('rightClickParams');

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
});

export default RightClick;
