import {CardHeader, Skeleton} from '@nextui-org/react';
import {Typography} from 'antd';
import {startCase} from 'lodash';
import {observer} from 'mobx-react-lite';

import {useSettingsState} from '../../../Redux/App/SettingsReducer';
import {useDevInfo, useLoadImage} from '../../../Utils/LocalStorage';
import {useCardData} from '../CardsDataManager';

const {Paragraph, Text, Title} = Typography;

const LynxCardHeader = observer(() => {
  const {bgUrl, id, description, title, repoUrl} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');

  const bgSrc = useLoadImage(`${id}-card-bg-img`, bgUrl);
  const {name, picUrl} = useDevInfo(repoUrl);
  const devSrc = useLoadImage(`${id}-card-dev-img`, picUrl, 'avatar');

  return (
    <CardHeader className="flex flex-col pb-0">
      <Skeleton isLoaded={!!bgSrc} className={`absolute top-0 ${compactMode ? 'h-16' : 'h-24'} w-full`}>
        {bgSrc}
      </Skeleton>

      <div
        className={
          `z-10 size-20 shrink-0 self-center overflow-hidden ${compactMode ? 'mt-3' : 'mt-11'} rounded-full ` +
          ` border-1 border-white shadow-[0px_6px_5px_-3px_rgba(0,0,0,0.6)] transition duration-500` +
          ` bg-white hover:shadow-none dark:border-black dark:bg-LynxRaisinBlack`
        }>
        <Skeleton isLoaded={!!devSrc} className="size-full">
          {devSrc}
        </Skeleton>
      </div>

      <Title level={5} ellipsis={{tooltip: name}} className="mt-1 self-center !text-lg">
        {startCase(name)}
      </Title>

      <Text ellipsis={{tooltip: title}} className="mb-2 self-center">
        {startCase(title)}
      </Text>

      {!compactMode && (
        <Paragraph className="mx-3" type="secondary" ellipsis={{rows: 2, tooltip: description}}>
          {description}
        </Paragraph>
      )}
    </CardHeader>
  );
});
export default LynxCardHeader;
