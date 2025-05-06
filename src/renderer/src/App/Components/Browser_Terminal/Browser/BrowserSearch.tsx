import {Button, Input, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {WebviewTag} from 'electron';
import {isEmpty} from 'lodash';
import {useEffect, useState} from 'react';

import {Circle_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons1';
import {ArrowDuo_Icon, CloseSimple_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons5';
import {useWebviewPress} from '../../../Utils/UtilHooks';

type Props = {
  webview: WebviewTag | null;
};
export default function BrowserSearch({webview}: Props) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useWebviewPress(webview, () => setIsOpen(false));

  useEffect(() => {
    if (webview && searchValue) {
      webview.findInPage(searchValue, {findNext: true});
    } else if (webview) {
      webview.stopFindInPage('clearSelection');
    }
  }, [searchValue]);

  const next = () => {
    webview?.findInPage(searchValue, {findNext: false, forward: true});
  };
  const back = () => {
    webview?.findInPage(searchValue, {findNext: false, forward: false});
  };
  const clear = () => {
    setSearchValue('');
    webview?.stopFindInPage('clearSelection');
  };
  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) clear();
    setIsOpen(isOpen);
  };

  return (
    <Popover shadow="sm" isOpen={isOpen} placement="bottom-end" onOpenChange={onOpenChange} showArrow shouldCloseOnBlur>
      <PopoverTrigger>
        <Button size="sm" variant="light" className="cursor-default" isIconOnly>
          <Circle_Icon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="py-3 flex-row items-end gap-x-2">
        <Input value={searchValue} placeholder="Type here..." onValueChange={setSearchValue} autoFocus />
        <div className="flex flex-row mb-1 gap-x-1">
          <Button size="sm" onPress={back} variant="light" isDisabled={isEmpty(searchValue)} isIconOnly>
            <ArrowDuo_Icon className="size-4 rotate-90" />
          </Button>
          <Button size="sm" onPress={next} variant="light" isDisabled={isEmpty(searchValue)} isIconOnly>
            <ArrowDuo_Icon className="size-4 -rotate-90" />
          </Button>
          <Button size="sm" onPress={clear} variant="light" isDisabled={isEmpty(searchValue)} isIconOnly>
            <CloseSimple_Icon className="size-3.5 rotate-90" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
