import {CardHeader, Skeleton} from '@nextui-org/react';
import {Typography} from 'antd';
import {capitalize} from 'lodash';
import {observer} from 'mobx-react-lite';
import {useMemo} from 'react';

import {useSettingsState} from '../../../Redux/App/SettingsReducer';
import {useDevInfo, useLoadImage} from '../../../Utils/LocalStorage';
import {useCardData} from '../CardsDataManager';

const {Paragraph, Text, Title} = Typography;

const LynxCardHeader = observer(() => {
  const {bgUrl, id, description, title, repoUrl} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');
  const cardsDevImage = useSettingsState('cardsDevImage');
  const cardsDevName = useSettingsState('cardsDevName');
  const cardsRepoInfo = useSettingsState('cardsRepoInfo');
  const cardsDesc = useSettingsState('cardsDesc');

  const allDisabled = useMemo(() => {
    return !cardsDevImage && !cardsDevName && !cardsRepoInfo && !cardsDesc;
  }, [cardsDevImage, cardsDevName, cardsRepoInfo, cardsDesc]);

  const halfDisabled = useMemo(() => {
    return (!cardsDevImage || !cardsDevName) && (!cardsRepoInfo || !cardsDesc);
  }, [cardsDevImage, cardsDevName, cardsRepoInfo, cardsDesc]);

  const bgSrc = useLoadImage(`${id}-card-bg-img`, bgUrl);
  const {name, picUrl} = useDevInfo(repoUrl);
  const devSrc = useLoadImage(`${id}-card-dev-img`, picUrl, 'avatar');

  return (
    <CardHeader className="flex flex-col p-0">
      <Skeleton
        isLoaded={!!bgSrc}
        className={`${compactMode ? 'h-16' : allDisabled ? 'h-16' : halfDisabled ? 'h-20' : 'h-24'} ` + ` w-full`}>
        {bgSrc}
      </Skeleton>

      {!compactMode && cardsDevImage && (
        <div
          className={
            `z-10 -mt-10 size-20 shrink-0 self-center overflow-hidden rounded-full ` +
            ` border-1 border-white shadow-[0px_6px_5px_-3px_rgba(0,0,0,0.6)] transition duration-500` +
            ` bg-white hover:shadow-none dark:border-black dark:bg-LynxRaisinBlack`
          }>
          <Skeleton isLoaded={!!devSrc} className="size-full">
            {devSrc}
          </Skeleton>
        </div>
      )}

      {!compactMode && cardsDevName && (
        <Title level={5} ellipsis={{tooltip: name}} className="mt-3 self-center !text-lg">
          {capitalize(name)}
        </Title>
      )}

      <Text
        className={
          `${(compactMode || !cardsDevName) && 'mt-3 !text-large'} ` +
          `${!cardsDesc && (cardsRepoInfo || cardsDevImage) && 'mb-4'} px-5`
        }
        ellipsis={{tooltip: title}}>
        {title}
      </Text>

      {(cardsDesc || compactMode) && (
        <Paragraph type="secondary" className="mx-3 mt-1 text-center" ellipsis={{rows: 2, tooltip: description}}>
          {description}
        </Paragraph>
      )}
    </CardHeader>
  );
});
export default LynxCardHeader;
