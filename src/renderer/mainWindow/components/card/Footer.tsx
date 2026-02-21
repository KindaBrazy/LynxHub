import {Button, CardFooter} from '@heroui/react';
import ShinyText from '@lynx/components/ShinyText';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useAppState} from '@lynx/redux/reducers/app';
import {useIsPinnedCard} from '@lynx/utils/hooks';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {Pin} from '@solar-icons/react-perf/Bold';
import {Download, Play} from '@solar-icons/react-perf/BoldDuotone';
import {Pin as PinLine} from '@solar-icons/react-perf/LineDuotone';
import {memo, useCallback, useMemo} from 'react';

import InstalledMenu from './menu/Installed';
import UninstalledMenu from './menu/Uninstalled';
import {useCardStore} from './store';

type Props = {
  isRunning: boolean;
  updatingExtensions: boolean;
  updating: boolean;
  updateCount: string;
  id: string;
};

/**
 * Footer component for the Card.
 * Displays actions like Pin, Play, Download, and status text.
 */
const Footer = memo(({isRunning, updatingExtensions, updating, updateCount, id}: Props) => {
  const darkMode = useAppState('darkMode');

  const isInstalled = useCardStore((state) => state.installed);
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
            isIconOnly
            className={
              `shrink-0 -translate-x-2 opacity-0 transition duration-400 ` +
              `group-hover:translate-x-0 group-hover:opacity-100`
            }
            radius="full"
            size="sm"
            variant="light"
            onPress={onPress}>
            {isPinned ? <Pin className="size-3" /> : <PinLine className="size-3" />}
          </Button>
        )}
      </div>
      {updating ? (
        <ShinyText
          className="text-xs font-bold text-success/70"
          darkMode={darkMode}
          speed={2}
          text="Updating"
        />
      ) : updatingExtensions ? (
        <ShinyText
          className="text-xs font-bold text-secondary/70"
          darkMode={darkMode}
          speed={2}
          text={`Updating Extensions ${updateCount}`}
        />
      ) : isRunning ? (
        <ShinyText
          className="text-xs font-bold text-primary/70"
          darkMode={darkMode}
          speed={2}
          text="Running"
        />
      ) : (
        <div
          className={
            'translate-y-2 opacity-0 transition duration-400 group-hover:translate-y-0 group-hover:opacity-100'
          }>
          {isInstalled ? <Play className="size-4 text-primary" /> : <Download className="size-4" />}
        </div>
      )}
    </CardFooter>
  );
});

export default Footer;
