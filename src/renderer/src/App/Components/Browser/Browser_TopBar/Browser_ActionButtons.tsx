import {Button} from '@heroui/react';
import {WebviewTag} from 'electron';
import {RefObject, useEffect, useState} from 'react';

import {HomeSmile_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons2';
import {Refresh3_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons4';
import {ArrowDuo_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons5';

type Props = {webview: RefObject<WebviewTag | null>; isDomReady: boolean};

export default function Browser_ActionButtons({webview, isDomReady}: Props) {
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [canGoForward, setCanGoForward] = useState<boolean>(false);

  useEffect(() => {
    const ref = webview.current;
    if (!ref) return;

    const updateNavigationState = () => {
      if (isDomReady) {
        setCanGoBack(ref.canGoBack());
        setCanGoForward(ref.canGoForward());
      }
    };

    updateNavigationState();

    ref.addEventListener('did-navigate', updateNavigationState);
    ref.addEventListener('did-navigate-in-page', updateNavigationState);
    ref.addEventListener('did-finish-load', updateNavigationState);
    ref.addEventListener('did-stop-loading', updateNavigationState);

    return () => {
      ref.removeEventListener('did-navigate', updateNavigationState);
      ref.removeEventListener('did-navigate-in-page', updateNavigationState);
      ref.removeEventListener('did-finish-load', updateNavigationState);
      ref.removeEventListener('did-stop-loading', updateNavigationState);
    };
  }, [webview, isDomReady]);

  return (
    <>
      {canGoBack && (
        <Button size="sm" variant="light" className="cursor-default" isIconOnly>
          <ArrowDuo_Icon className="size-4" />
        </Button>
      )}
      {canGoForward && (
        <Button size="sm" variant="light" className="cursor-default" isIconOnly isDisabled>
          <ArrowDuo_Icon className="size-4 rotate-180" />
        </Button>
      )}
      <Button size="sm" variant="light" className="cursor-default" isIconOnly>
        <Refresh3_Icon className="size-4" />
      </Button>

      <Button size="sm" variant="light" className="cursor-default" isIconOnly>
        <HomeSmile_Icon className="size-4" />
      </Button>
    </>
  );
}
