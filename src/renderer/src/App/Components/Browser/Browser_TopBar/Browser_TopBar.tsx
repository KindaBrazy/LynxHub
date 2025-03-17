import {Button} from '@heroui/react';
import {WebviewTag} from 'electron';
import {RefObject} from 'react';

import {LYNXHUB_HOMEPAGE} from '../../../../../../cross/CrossConstants';
import {Terminal_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons3';
import AddressInput from './AddressInput';
import Browser_ActionButtons from './Browser_ActionButtons';

type Props = {webview: RefObject<WebviewTag | null>; isDomReady: boolean};

export default function Browser_TopBar({webview, isDomReady}: Props) {
  return (
    <div
      className={
        'h-10 inset-x-0 top-0 absolute bg-white dark:bg-LynxRaisinBlack flex flex-row gap-x-2 px-2 py-1 items-center'
      }>
      <Browser_ActionButtons webview={webview} isDomReady={isDomReady} />
      <AddressInput address={LYNXHUB_HOMEPAGE} />

      <Button size="sm" variant="light" className="cursor-default">
        <Terminal_Icon className="size-4" />
      </Button>
    </div>
  );
}
