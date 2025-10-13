import {Button, CardFooter} from '@heroui/react';
import {PlayDuo_Icon} from '@lynx_extension/renderer/Components/SvgIcons';
import {memo, useCallback, useMemo} from 'react';

import AddBreadcrumb_Renderer from '../../../../../Breadcrumbs';
import {DownloadDuo_Icon, Pin_Icon, PinLine_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {useAppState} from '../../../Redux/Reducer/AppReducer';
import rendererIpc from '../../../RendererIpc';
import {useIsPinnedCard} from '../../../Utils/UtilHooks';
import ShinyText from '../../Reusable/ShinyText';
import InstalledMenu from './Menu/InstalledMenu';
import UninstalledMenu from './Menu/UninstalledMenu';
import {useCardStore} from './Wrapper';

type Props = {isRunning: boolean; updatingExtensions: boolean; updating: boolean; updateCount: string; id: string};
const Footer = memo(({isRunning, updatingExtensions, updating, updateCount, id}: Props) => {
  const darkMode = useAppState('darkMode');

  const isInstalled = useCardStore(state => state.installed);
  const isPinned = useIsPinnedCard(id);

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Pin AI: id:${id} , ${isPinned ? 'remove' : 'add'}`);
    rendererIpc.storageUtils.pinnedCards(isPinned ? 'remove' : 'add', id);
  }, [isPinned, id]);

  const ReplaceMenu = useMemo(() => extensionsData.cards.customize.menu.replace, []);

  return (
    <CardFooter className="justify-between">
      <div className="flex flex-row items-center gap-x-2">
        {isInstalled ? (
          ReplaceMenu ? (
            <ReplaceMenu useCardStore={useCardStore} />
          ) : (
            <InstalledMenu />
          )
        ) : (
          <UninstalledMenu />
        )}
        {isInstalled && (
          <Button
            className={
              `shrink-0 transition duration-500 group-hover:opacity-100 opacity-0 ` +
              `group-hover:translate-x-0 -translate-x-2`
            }
            size="sm"
            radius="full"
            variant="light"
            onPress={onPress}
            isIconOnly>
            {isPinned ? <Pin_Icon className="size-3" /> : <PinLine_Icon className="size-3" />}
          </Button>
        )}
      </div>
      {updating ? (
        <ShinyText speed={2} text="Updating" darkMode={darkMode} className="font-bold text-xs text-success/70" />
      ) : updatingExtensions ? (
        <ShinyText
          speed={2}
          darkMode={darkMode}
          text={`Updating Extensions ${updateCount}`}
          className="font-bold text-xs text-secondary/70"
        />
      ) : isRunning ? (
        <ShinyText speed={2} text="Running" darkMode={darkMode} className="font-bold text-xs text-primary/70" />
      ) : (
        <div
          className={
            'group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 opacity-0 transition duration-500'
          }>
          {isInstalled ? <PlayDuo_Icon className="size-4 text-primary" /> : <DownloadDuo_Icon className="size-4" />}
        </div>
      )}
    </CardFooter>
  );
});

export default Footer;
