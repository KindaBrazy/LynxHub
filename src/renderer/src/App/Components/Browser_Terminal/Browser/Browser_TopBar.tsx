import {WebviewTag} from 'electron';
import {RefObject} from 'react';

import {LYNXHUB_HOMEPAGE} from '../../../../../../cross/CrossConstants';
import AddressInput from './AddressInput';
import Browser_ActionButtons from './Browser_ActionButtons';
import Browser_Zoom from './Browser_Zoom';

type Props = {webview: RefObject<WebviewTag | null>; isDomReady: boolean; id: string};

export default function Browser_TopBar({webview, isDomReady, id}: Props) {
  return (
    <>
      <Browser_ActionButtons webview={webview} isDomReady={isDomReady} />
      <AddressInput address={LYNXHUB_HOMEPAGE} />
      <Browser_Zoom id={id} />
    </>
  );
}
