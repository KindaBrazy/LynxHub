import {Button} from '@heroui/react';
import {WebviewTag} from 'electron';
import {RefObject} from 'react';

import {LYNXHUB_HOMEPAGE} from '../../../../../../cross/CrossConstants';
import {Stop_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons3';
import Switch_BrowserTerminal from '../../Reusable/Switch_BrowserTerminal';
import AddressInput from './AddressInput';
import Browser_ActionButtons from './Browser_ActionButtons';

type Props = {webview: RefObject<WebviewTag | null>; isDomReady: boolean; currentView: 'browser' | 'terminal'};

export default function Browser_TopBar({webview, isDomReady, currentView}: Props) {
  return (
    <div
      className={
        'h-10 inset-x-0 top-0 absolute bg-white dark:bg-LynxRaisinBlack flex flex-row gap-x-2 px-2 py-1 items-center'
      }>
      <Browser_ActionButtons webview={webview} isDomReady={isDomReady} />
      <AddressInput address={LYNXHUB_HOMEPAGE} />

      <Switch_BrowserTerminal currentView={currentView} />
      <Button size="sm" variant="light" className="cursor-default" isIconOnly>
        <Stop_Icon className="size-4 text-danger" />
      </Button>
    </div>
  );
}
