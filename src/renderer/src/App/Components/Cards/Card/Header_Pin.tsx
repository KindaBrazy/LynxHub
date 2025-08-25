import {Button} from '@heroui/react';
import {useCallback} from 'react';

import AddBreadcrumb_Renderer from '../../../../../Breadcrumbs';
import {Pin_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../../RendererIpc';
import {useIsPinnedCard} from '../../../Utils/UtilHooks';
import {useCardStore} from './LynxCard-Wrapper';

export default function Header_Pin() {
  const id = useCardStore(state => state.id);
  const installed = useCardStore(state => state.installed);

  const isPinned = useIsPinnedCard(id);

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Pin AI: id:${id} , ${isPinned ? 'remove' : 'add'}`);
    rendererIpc.storageUtils.pinnedCards(isPinned ? 'remove' : 'add', id);
  }, [isPinned, id]);

  if (!installed) return null;

  return (
    <Button
      size="sm"
      radius="full"
      onPress={onPress}
      variant={isPinned ? 'solid' : 'flat'}
      className="absolute z-20 top-3 left-3"
      isIconOnly>
      <Pin_Icon className={`${!isPinned && '-rotate-45'} transition duration-500`} />
    </Button>
  );
}
