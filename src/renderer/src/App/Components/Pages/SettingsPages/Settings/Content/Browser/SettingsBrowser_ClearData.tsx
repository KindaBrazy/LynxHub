import {Button} from '@heroui/react';
import {useState} from 'react';

import {BroomDuo_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../../../../../RendererIpc';

export default function SettingsBrowser_ClearData() {
  const [isCacheLoading, setIsCacheLoading] = useState(false);
  const [isCookiesLoading, setIsCookiesLoading] = useState(false);

  const clearCache = () => {
    setIsCacheLoading(true);

    rendererIpc.browser.clearCache();
    setTimeout(() => {
      setIsCacheLoading(false);
    }, 300);
  };

  const clearCookies = () => {
    setIsCookiesLoading(true);

    rendererIpc.browser.clearCookies();
    setTimeout(() => {
      setIsCookiesLoading(false);
    }, 300);
  };

  return (
    <>
      <Button
        variant="flat"
        color="warning"
        onPress={clearCache}
        isLoading={isCacheLoading}
        startContent={<BroomDuo_Icon />}
        fullWidth>
        Clear Cache
      </Button>
      <Button
        variant="flat"
        color="warning"
        onPress={clearCookies}
        isLoading={isCookiesLoading}
        startContent={<BroomDuo_Icon />}
        fullWidth>
        Clear Cookies
      </Button>
    </>
  );
}
