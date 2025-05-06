import {Divider} from '@heroui/react';
import {ContextMenuParams, EditFlags} from 'electron';
import {isEmpty} from 'lodash';
import {Dispatch, ReactElement, ReactNode, RefObject, SetStateAction, useEffect} from 'react';

import {
  CopyDuo_Icon,
  DocumentTextDuo_Icon,
  ExternalDuo_Icon,
  LibraryDuo_Icon,
  TextSelectionDuo_Icon,
  UndoDuo_Icon,
} from '../../loading/Backgrounds/SvgIcons';
import rendererIpc from '../../src/App/RendererIpc';

export function useResize(divRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const {width, height} = entries[0].contentRect;
        rendererIpc.contextMenu.resizeWindow({width, height});
      }
    });

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [divRef]);
}

type ActionProps = {icon?: ReactNode; title: string; onPress: () => void; className?: string};

function ActionButton({icon, title, onPress, className}: ActionProps) {
  return (
    <div
      className={
        `w-full hover:bg-foreground-100 transition-colors duration-300 py-2 px-3` +
        ` flex justify-between items-center text-sm ${className}`
      }
      onClick={onPress}>
      {icon || <div />}
      <span>{title}</span>
      <div />
    </div>
  );
}

export function useContextMenuSetup(
  setElements: Dispatch<SetStateAction<ReactNode[]>>,
  setWidthSize: Dispatch<SetStateAction<'sm' | 'md' | 'lg'>>,
) {
  useEffect(() => {
    const createActionHandler = (actionFn: () => void): (() => void) => {
      return () => {
        rendererIpc.contextMenu.hideWindow();
        actionFn();
      };
    };

    const buildSuggestionItems = (suggestions: string[], contextId: number): ReactNode[] => {
      if (isEmpty(suggestions)) return [];

      return [
        <span key="suggestions_title" className="ml-2 text-sm mb-1 font-semibold text-gray-600 dark:text-gray-400 px-2">
          Suggestions
        </span>,
        ...suggestions.map((text, index) => (
          <ActionButton
            onPress={createActionHandler(() => {
              rendererIpc.contextItems.replaceMisspelling(contextId, text);
            })}
            title={text}
            className="text-sm"
            key={`suggestion_${text}_${index}`}
          />
        )),
      ];
    };

    const buildLinkItems = (url: string): ReactNode[] => {
      if (isEmpty(url)) return [];

      return [
        <ActionButton
          onPress={createActionHandler(() => {
            rendererIpc.contextItems.newTab(url);
          })}
          key="context_newTab"
          title="Open link in new tab"
          icon={<LibraryDuo_Icon className="size-4" />}
        />,
        <ActionButton
          onPress={createActionHandler(() => {
            rendererIpc.contextItems.openExternal(url);
          })}
          key="context_openExternal"
          title="Open link in default browser"
          icon={<ExternalDuo_Icon className="size-4" />}
        />,
        <ActionButton
          onPress={createActionHandler(() => {
            navigator.clipboard.writeText(url);
          })}
          key="context_copyLink"
          title="Copy Link Address"
          icon={<CopyDuo_Icon className="size-4" />}
        />,
      ];
    };

    const buildEditItems = (flags: EditFlags, selection: string, contextId: number): ReactNode[] => {
      const items: ReactNode[] = [];

      if (flags.canUndo) {
        items.push(
          <ActionButton
            onPress={createActionHandler(() => {
              rendererIpc.contextItems.undo(contextId);
            })}
            title="Undo"
            key="context_undo"
            icon={<UndoDuo_Icon className="size-4" />}
          />,
        );
      }
      if (flags.canRedo) {
        items.push(
          <ActionButton
            onPress={createActionHandler(() => {
              rendererIpc.contextItems.redo(contextId);
            })}
            title="Redo"
            key="context_redo"
            icon={<UndoDuo_Icon className="size-4 rotate-180" />}
          />,
        );
      }
      if (flags.canCopy && !isEmpty(selection)) {
        items.push(
          <ActionButton
            onPress={createActionHandler(() => {
              rendererIpc.contextItems.copy(contextId);
            })}
            title="Copy"
            key="context_copy"
            icon={<CopyDuo_Icon className="size-4" />}
          />,
        );
      }
      if (flags.canPaste) {
        items.push(
          <ActionButton
            onPress={createActionHandler(() => {
              rendererIpc.contextItems.paste(contextId);
            })}
            title="Paste"
            key="context_paste"
            icon={<DocumentTextDuo_Icon className="size-4" />}
          />,
        );
      }
      if (flags.canSelectAll) {
        items.push(
          <ActionButton
            onPress={createActionHandler(() => {
              rendererIpc.contextItems.selectAll(contextId);
            })}
            title="Select All"
            key="context_selectAll"
            icon={<TextSelectionDuo_Icon className="size-4" />}
          />,
        );
      }
      return items;
    };

    const handleInitView = (_event: any, params: ContextMenuParams, contextId: number) => {
      setElements([]);

      setWidthSize('sm');

      const {selectionText, dictionarySuggestions, linkURL, editFlags} = params;

      const collectedElements: ReactNode[] = [];

      collectedElements.push(<div key="space_start" className="w-full h-2" />);

      const suggestionItems = buildSuggestionItems(dictionarySuggestions, contextId);
      if (suggestionItems.length > 0) {
        collectedElements.push(...suggestionItems);
        collectedElements.push(<Divider className="my-2" key="sep_suggestions" />);
      }

      const hasLinkItems = !isEmpty(linkURL);
      const hasEditItems =
        editFlags.canUndo || editFlags.canRedo || editFlags.canCopy || editFlags.canPaste || editFlags.canSelectAll;
      const needsActionsTitle = hasLinkItems || hasEditItems;

      if (needsActionsTitle) {
        collectedElements.push(
          <span key="actions_title" className="ml-2 text-sm mb-1 font-semibold text-gray-600 dark:text-gray-400 px-2">
            Actions
          </span>,
        );
      }

      if (hasLinkItems) {
        const linkItems = buildLinkItems(linkURL);
        collectedElements.push(...linkItems);
        setWidthSize('md');
      }

      if (hasEditItems) {
        const editItems = buildEditItems(editFlags, selectionText, contextId);
        collectedElements.push(...editItems);

        if (hasLinkItems && editItems.length > 0) {
          const lastActionTitleIndex = collectedElements.findIndex(el => (el as ReactElement)?.key === 'actions_title');

          collectedElements.splice(
            lastActionTitleIndex + 1 + (hasLinkItems ? 3 : 0),
            0,
            <Divider className="my-2" key="sep_link_edit" />,
          );
        }
      }

      collectedElements.push(<div key="space_end" className="w-full h-2" />);

      setElements(collectedElements);

      rendererIpc.contextMenu.showWindow();
    };

    rendererIpc.contextMenu.onInitView(handleInitView);

    return () => {
      rendererIpc.contextMenu.offInitView();
    };
  }, [setElements, setWidthSize]);
}
