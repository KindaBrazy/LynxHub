import {Button} from '@nextui-org/react';
import {useCallback} from 'react';

import {Pin_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons2';
import rendererIpc from '../../../RendererIpc';
import {useIsPinnedCard} from '../../../Utils/UtilHooks';
import {useCardData} from '../CardsDataManager';

export default function Header_Pin() {
  const {id, installed} = useCardData();
  const isPinned = useIsPinnedCard(id);

  const onPress = useCallback(
    () => rendererIpc.storageUtils.pinnedCards(isPinned ? 'remove' : 'add', id),
    [isPinned, id],
  );

  if (!installed) return null;

  return (
    <Button
      size="sm"
      radius="full"
      onPress={onPress}
      variant={isPinned ? 'solid' : 'flat'}
      className="absolute z-20 top-3 left-3"
      color={isPinned ? 'secondary' : 'default'}
      isIconOnly>
      <Pin_Icon className={`${!isPinned && '-rotate-45'} transition duration-500`} />
    </Button>
  );
}
