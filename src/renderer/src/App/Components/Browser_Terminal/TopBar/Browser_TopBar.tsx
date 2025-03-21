import {WebviewTag} from 'electron';
import {RefObject} from 'react';

import {LYNXHUB_HOMEPAGE} from '../../../../../../cross/CrossConstants';
import AddressInput from '../Browser/AddressInput';
import Browser_ActionButtons from '../Browser/Browser_ActionButtons';

type Props = {webview: RefObject<WebviewTag | null>; isDomReady: boolean};

export default function Browser_TopBar({webview, isDomReady}: Props) {
  return (
    <>
      <Browser_ActionButtons webview={webview} isDomReady={isDomReady} />
      <AddressInput address={LYNXHUB_HOMEPAGE} />
    </>
  );
}
