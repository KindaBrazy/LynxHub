import {Divider} from '@heroui/react';
import {isArray, isEmpty} from 'lodash';
import {Dispatch, ReactNode, RefObject, SetStateAction, useEffect} from 'react';

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

export function useInitView(
  setElements: Dispatch<SetStateAction<ReactNode[]>>,
  setWidthSize: Dispatch<SetStateAction<'sm' | 'md' | 'lg'>>,
) {
  const addElement = (element: ReactNode | ReactNode[]) => {
    setElements(prevState => (isArray(element) ? [...prevState, ...element] : [...prevState, element]));
  };

  const addSeperator = (key: string) => {
    setElements(prevState => [...prevState, <Divider key={key} className="my-2" />]);
  };

  const addEmptySpace = (key: string) => {
    setElements(prevState => [...prevState, <div key={key} className="w-full h-2" />]);
  };

  useEffect(() => {
    rendererIpc.contextMenu.onInitView((_e, params, id) => {
      setElements([]);
      const {selectionText, dictionarySuggestions, linkURL, editFlags} = params;
      console.log(params);

      addEmptySpace('starter_space');

      if (!isEmpty(dictionarySuggestions)) {
        addElement([
          <span key={'suggestions_title'} className="ml-2 text-sm mb-1">
            Suggestions
          </span>,
          ...dictionarySuggestions.map(text => (
            <ActionButton
              onPress={() => {
                rendererIpc.contextMenu.hideWindow();
                rendererIpc.contextItems.replaceMisspelling(id, text);
              }}
              title={text}
              className="text-sm"
              key={`${text}_dic`}
            />
          )),
        ]);

        addSeperator('dic_sep');
      }

      if (
        editFlags.canUndo ||
        editFlags.canRedo ||
        editFlags.canCopy ||
        editFlags.canPaste ||
        editFlags.canSelectAll ||
        !isEmpty(linkURL)
      ) {
        addElement(
          <span key={'actions_title'} className="ml-2 text-sm mb-1">
            Actions
          </span>,
        );
      }

      if (!isEmpty(linkURL)) {
        addElement([
          <ActionButton
            onPress={() => {
              rendererIpc.contextMenu.hideWindow();
              rendererIpc.contextItems.newTab(linkURL);
            }}
            key="context_newTab"
            title="Open link in new tab"
            icon={<LibraryDuo_Icon className="size-4" />}
          />,
          <ActionButton
            onPress={() => {
              rendererIpc.contextMenu.hideWindow();
              rendererIpc.contextItems.openExternal(linkURL);
            }}
            key="context_openExternal"
            title="Open link in default browser"
            icon={<ExternalDuo_Icon className="size-4" />}
          />,
        ]);
        setWidthSize('md');
      } else {
        setWidthSize('sm');
      }

      if (editFlags.canUndo) {
        addElement(
          <ActionButton
            onPress={() => {
              rendererIpc.contextMenu.hideWindow();
              rendererIpc.contextItems.undo(id);
            }}
            title="Undo"
            key="context_undo"
            icon={<UndoDuo_Icon className="size-4" />}
          />,
        );
      }
      if (editFlags.canRedo) {
        addElement(
          <ActionButton
            onPress={() => {
              rendererIpc.contextMenu.hideWindow();
              rendererIpc.contextItems.redo(id);
            }}
            title="Redo"
            key="context_redo"
            icon={<UndoDuo_Icon className="size-4 rotate-180" />}
          />,
        );
      }

      if (editFlags.canCopy && !isEmpty(selectionText)) {
        addElement(
          <ActionButton
            onPress={() => {
              rendererIpc.contextMenu.hideWindow();
              rendererIpc.contextItems.copy(id);
            }}
            title="Copy"
            key="context_copy"
            icon={<CopyDuo_Icon className="size-4" />}
          />,
        );
      }

      if (editFlags.canPaste) {
        addElement(
          <ActionButton
            onPress={() => {
              rendererIpc.contextMenu.hideWindow();
              rendererIpc.contextItems.paste(id);
            }}
            title="Paste"
            key="context_paste"
            icon={<DocumentTextDuo_Icon className="size-4" />}
          />,
        );
      }

      if (editFlags.canSelectAll) {
        addElement(
          <ActionButton
            onPress={() => {
              rendererIpc.contextMenu.hideWindow();
              rendererIpc.contextItems.selectAll(id);
            }}
            title="Select All"
            key="context_selectAll"
            icon={<TextSelectionDuo_Icon className="size-4" />}
          />,
        );
      }

      addEmptySpace('end_space');
      rendererIpc.contextMenu.showWindow();
    });

    return () => {
      rendererIpc.contextMenu.offInitView();
    };
  }, []);
}
