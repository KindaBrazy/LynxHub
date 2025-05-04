import {Button, Divider} from '@heroui/react';
import {isArray, isEmpty} from 'lodash';
import {Dispatch, ReactNode, RefObject, SetStateAction, useEffect} from 'react';

import rendererIpc from '../../src/App/RendererIpc';
import {Copy_Icon} from '../../src/assets/icons/SvgIcons/SvgIcons1';

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

export function useInitView(setElements: Dispatch<SetStateAction<ReactNode[]>>) {
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    rendererIpc.contextMenu.hideWindow();
  };

  const addElement = (element: ReactNode | ReactNode[]) => {
    setElements(prevState => (isArray(element) ? [...prevState, ...element] : [...prevState, element]));
  };

  const addSeperator = (key: string) => {
    setElements(prevState => [...prevState, <Divider key={key} className="my-2" />]);
  };

  useEffect(() => {
    rendererIpc.contextMenu.onInitView((_e, params) => {
      setElements([]);
      const {selectionText, dictionarySuggestions} = params;

      if (!isEmpty(dictionarySuggestions)) {
        addElement(
          dictionarySuggestions.map(dic => (
            <Button radius="none" variant="light" key={`${dic}_dic`} fullWidth>
              {dic}
            </Button>
          )),
        );

        addSeperator('dic_sep');
      }

      if (!isEmpty(selectionText)) {
        addElement(
          <Button
            radius="none"
            variant="light"
            key="context_copy"
            endContent={<div />}
            className="justify-between"
            startContent={<Copy_Icon />}
            onPress={() => copyText(selectionText)}
            fullWidth>
            Copy
          </Button>,
        );
      }

      rendererIpc.contextMenu.showWindow();
    });

    return () => {
      rendererIpc.contextMenu.offInitView();
    };
  }, []);
}
