import {Divider} from '@heroui/react';
import {
  ArrowLeft,
  ArrowRight,
  ClipboardText,
  Copy,
  Export,
  GalleryCircle,
  GalleryDownload,
  GalleryWide,
  Link,
  MagniferBug,
  Refresh,
  Scissors,
  SquareTopDown,
  TextSelection,
  UndoLeftRound,
} from '@solar-icons/react-perf/BoldDuotone';
import {ContextMenuParams, EditFlags} from 'electron';
import {isEmpty} from 'lodash';
import {ReactNode, useEffect} from 'react';

import rendererIpc from '../../src/App/RendererIpc';
import {SetElementsType, SetWidthSizeType} from './ContextHooks';

type ActionProps = {icon?: ReactNode; title: string; onPress: () => void; className?: string};

function ActionButton({icon, title, onPress, className}: ActionProps) {
  return (
    <div
      className={
        `w-full hover:bg-foreground-200 transition-colors duration-300 py-2 px-3` +
        ` flex justify-between items-center text-sm ${className} cursor-pointer`
      }
      onClick={onPress}>
      {icon || <div />}
      <span>{title}</span>
      <div />
    </div>
  );
}

type NavProps = {icon?: ReactNode; onPress?: () => void; className?: string; isDisabled?: boolean};

function NavButton({icon, onPress, className, isDisabled}: NavProps) {
  return (
    <div
      className={
        `size-full flex items-center rounded-lg justify-center transition-colors duration-150` +
        ` ${isDisabled ? 'opacity-50' : 'hover:bg-foreground-200 cursor-pointer'} ${className}`
      }
      onClick={isDisabled ? undefined : onPress}>
      {icon}
    </div>
  );
}

export default function useRightClickMenu(setElements: SetElementsType, setWidthSize: SetWidthSizeType) {
  useEffect(() => {
    const createActionHandler = (actionFn: () => void): (() => void) => {
      return () => {
        rendererIpc.contextMenu.hideWindow();
        actionFn();
      };
    };

    const buildNavigationItems = (
      navHistory: {
        canGoBack: boolean;
        canGoForward: boolean;
      },
      contextId: number,
    ): ReactNode[] => {
      return [
        <div
          key="navItems"
          className="w-full flex flex-row items-center justify-center h-8 px-2 overflow-hidden gap-x-1">
          <NavButton
            onPress={createActionHandler(() => {
              rendererIpc.contextItems.navigate(contextId, 'back');
            })}
            isDisabled={!navHistory.canGoBack}
            icon={<ArrowLeft className="size-5" />}
          />
          <NavButton
            onPress={createActionHandler(() => {
              rendererIpc.contextItems.navigate(contextId, 'forward');
            })}
            isDisabled={!navHistory.canGoForward}
            icon={<ArrowRight className="size-5" />}
          />
          <NavButton
            onPress={createActionHandler(() => {
              rendererIpc.contextItems.navigate(contextId, 'refresh');
            })}
            icon={<Refresh className="size-4" />}
          />
        </div>,
      ];
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
          icon={<SquareTopDown className="size-4" />}
        />,
        <ActionButton
          onPress={createActionHandler(() => {
            rendererIpc.contextItems.openExternal(url);
          })}
          key="context_openExternal"
          title="Open link in default browser"
          icon={<Export className="size-4" />}
        />,
        <ActionButton
          onPress={createActionHandler(() => {
            navigator.clipboard.writeText(url);
          })}
          key="context_copyLink"
          title="Copy Link Address"
          icon={<Link className="size-4" />}
        />,
      ];
    };

    const buildImageItems = (id: number, srcURL: string): ReactNode[] => {
      if (isEmpty(srcURL)) return [];

      return [
        <ActionButton
          onPress={createActionHandler(() => {
            rendererIpc.contextItems.newTab(srcURL);
          })}
          key="context_openImageTab"
          title="Open Image in New Tab"
          icon={<GalleryWide className="size-4" />}
        />,
        <ActionButton
          onPress={createActionHandler(() => {
            rendererIpc.contextItems.copyImage(srcURL);
          })}
          title="Copy Image"
          key="context_copyImage"
          icon={<Copy className="size-4" />}
        />,
        <ActionButton
          onPress={createActionHandler(() => {
            rendererIpc.contextItems.downloadImage(id, srcURL);
          })}
          title="Save Image"
          key="context_saveImage"
          icon={<GalleryDownload className="size-4" />}
        />,
        <ActionButton
          onPress={createActionHandler(() => {
            navigator.clipboard.writeText(srcURL);
          })}
          title="Copy Image Address"
          key="context_copyImageAddress"
          icon={<Link className="size-4" />}
        />,
        <ActionButton
          onPress={createActionHandler(() => {
            rendererIpc.contextItems.newTab(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(srcURL)}`);
          })}
          key="context_searchImage"
          title="Search Web for Image"
          icon={<GalleryCircle className="size-4" />}
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
            icon={<UndoLeftRound className="size-4" />}
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
            icon={<UndoLeftRound className="size-4 scale-x-[-1]" />}
          />,
        );
      }
      if (flags.canCut && !isEmpty(selection)) {
        items.push(
          <ActionButton
            onPress={createActionHandler(() => {
              rendererIpc.contextItems.cut(contextId);
            })}
            title="Cut"
            key="context_cut"
            icon={<Scissors className="size-4" />}
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
            icon={<Copy className="size-4" />}
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
            icon={<ClipboardText className="size-4" />}
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
            icon={<TextSelection className="size-4" />}
          />,
        );
      }
      return items;
    };

    const buildTextSelectionItems = (selection: string): ReactNode[] => {
      if (isEmpty(selection)) return [];

      return [
        <ActionButton
          onPress={createActionHandler(() => {
            rendererIpc.contextItems.searchWithGoogle(selection);
          })}
          title={`Search with Google`}
          key="context_searchGoogle"
          icon={<MagniferBug className="size-4" />}
        />,
      ];
    };

    const handleInitView = (
      _event: any,
      params: ContextMenuParams,
      navHistory: {
        canGoBack: boolean;
        canGoForward: boolean;
      },
      contextId: number,
    ) => {
      setElements([]);

      setWidthSize('sm');

      const {selectionText, dictionarySuggestions, linkURL, editFlags, mediaType, srcURL} = params;

      const collectedElements: ReactNode[] = [];

      collectedElements.push(<div key="space_start" className="w-full h-2" />);

      collectedElements.push(...buildNavigationItems(navHistory, contextId));
      collectedElements.push(<Divider key="sep_nav" className="my-1" />);

      const suggestionItems = buildSuggestionItems(dictionarySuggestions, contextId);
      if (suggestionItems.length > 0) {
        collectedElements.push(...suggestionItems);
        collectedElements.push(<Divider className="my-2" key="sep_suggestions" />);
      }

      const hasLinkItems = !isEmpty(linkURL);
      const hasImageItems = mediaType === 'image';
      const hasTextSelection = !isEmpty(selectionText);
      const hasEditItems =
        editFlags.canUndo || editFlags.canRedo || editFlags.canCut || editFlags.canCopy || editFlags.canPaste || editFlags.canSelectAll;
      const needsActionsTitle = hasLinkItems || hasEditItems || hasImageItems || hasTextSelection;

      if (needsActionsTitle) {
        collectedElements.push(
          <span key="actions_title" className="ml-2 text-sm mb-1 font-semibold text-gray-600 dark:text-gray-400 px-2">
            Actions
          </span>,
        );
      }

      let previousActionSectionAdded = false;

      if (hasLinkItems) {
        const linkItems = buildLinkItems(linkURL);
        collectedElements.push(...linkItems);
        setWidthSize('md');
        previousActionSectionAdded = true;
      }

      if (hasImageItems) {
        if (previousActionSectionAdded) {
          collectedElements.push(<Divider className="my-2" key="sep_link_image" />);
        }
        const imageItems = buildImageItems(contextId, srcURL);
        collectedElements.push(...imageItems);
        setWidthSize('md');
        previousActionSectionAdded = true;
      }

      if (hasTextSelection) {
        if (previousActionSectionAdded) {
          collectedElements.push(<Divider className="my-2" key="sep_image_text" />);
        }
        const textSelectionItems = buildTextSelectionItems(selectionText);
        collectedElements.push(...textSelectionItems);
        setWidthSize('md');
        previousActionSectionAdded = true;
      }

      if (hasEditItems) {
        if (previousActionSectionAdded) {
          collectedElements.push(<Divider className="my-2" key="sep_text_edit" />);
        }
        const editItems = buildEditItems(editFlags, selectionText, contextId);
        collectedElements.push(...editItems);
      }

      collectedElements.push(<div key="space_end" className="w-full h-2" />);

      setElements(collectedElements);

      rendererIpc.contextMenu.showWindow();
    };

    const offInitView = rendererIpc.contextMenu.onInitView(handleInitView);

    return () => offInitView();
  }, [setElements, setWidthSize]);
}
