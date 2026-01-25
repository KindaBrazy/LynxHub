import {Button, CardFooter} from '@heroui/react';
import ShinyText from '@lynx/components/ShinyText';
import {useIsPinnedCard} from '@lynx/hooks/utils';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useAppState} from '@lynx/redux/reducers/app';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {Pin} from '@solar-icons/react-perf/Bold';
import {Download} from '@solar-icons/react-perf/BoldDuotone';
import {Play} from '@solar-icons/react-perf/BoldDuotone';
import {Pin as PinLine} from '@solar-icons/react-perf/LineDuotone';
import {memo, useCallback, useMemo} from 'react';

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
    storageUtilsIpc.invoke.pinnedCards(isPinned ? 'remove' : 'add', id);
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
            {isPinned ? <Pin className="size-3" /> : <PinLine className="size-3" />}
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
          {isInstalled ? <Play className="size-4 text-primary" /> : <Download className="size-4" />}
        </div>
      )}
    </CardFooter>
  );
});

export default Footer;
