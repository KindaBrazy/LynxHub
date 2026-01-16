import {Button, CardFooter} from '@heroui/react';
import {memo, useCallback, useMemo} from 'react';

import {DownloadDuo_Icon, Pin_Icon, PinLine_Icon, PlayDuo_Icon} from '../../../shared/assets/icons';
import AddBreadcrumb_Renderer from '../../../shared/sentry/Breadcrumbs';
import {useIsPinnedCard} from '../../hooks/utils';
import {extensionsData} from '../../plugins/extensions/loader';
import {useAppState} from '../../redux/reducers/app';
import rendererIpc from '../../services/RendererIpc';
import ShinyText from '../ShinyText';
import InstalledMenu from './menu/Installed';
import UninstalledMenu from './menu/Uninstalled';
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
        {!isRunning &&
          (isInstalled ? (
            ReplaceMenu ? (
              <ReplaceMenu useCardStore={useCardStore} />
            ) : (
              <InstalledMenu />
            )
          ) : (
            <UninstalledMenu />
          ))}
        {isInstalled && (
          <Button
            className={
              `shrink-0 transition duration-400 group-hover:opacity-100 opacity-0 ` +
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
            'group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 opacity-0 transition duration-400'
          }>
          {isInstalled ? <PlayDuo_Icon className="size-4 text-primary" /> : <DownloadDuo_Icon className="size-4" />}
        </div>
      )}
    </CardFooter>
  );
});

export default Footer;
