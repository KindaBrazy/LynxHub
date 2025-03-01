import {CardHeader, Skeleton} from '@heroui/react';
import {Typography} from 'antd';
import {capitalize} from 'lodash';
import {observer} from 'mobx-react-lite';
import {FormEvent, useCallback, useMemo} from 'react';

import {useSettingsState} from '../../../Redux/Reducer/SettingsReducer';
import {useDevInfo, useLoadImage} from '../../../Utils/LocalStorage';
import {useCardData} from '../CardsDataManager';
import Header_Pin from './Header_Pin';

const {Paragraph, Text, Title} = Typography;

const LynxCardHeader = observer(() => {
  const {bgUrl, id, description, title, repoUrl} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');
  const cardsDevImage = useSettingsState('cardsDevImage');
  const cardsDevName = useSettingsState('cardsDevName');
  const cardsRepoInfo = useSettingsState('cardsRepoInfo');
  const cardsDesc = useSettingsState('cardsDesc');

  const modifiedTitle = useMemo(() => {
    return window.localStorage.getItem(`${id}_title_edited`) || title;
  }, [id, title]);

  const allDisabled = useMemo(() => {
    return !cardsDevImage && !cardsDevName && !cardsRepoInfo && !cardsDesc;
  }, [cardsDevImage, cardsDevName, cardsRepoInfo, cardsDesc]);

  const halfDisabled = useMemo(() => {
    return (!cardsDevImage || !cardsDevName) && (!cardsRepoInfo || !cardsDesc);
  }, [cardsDevImage, cardsDevName, cardsRepoInfo, cardsDesc]);

  const bgSrc = useLoadImage(`${id}-card-bg-img`, bgUrl);
  const {name, picUrl} = useDevInfo(repoUrl);
  const devSrc = useLoadImage(`${id}-card-dev-img`, picUrl, 'avatar');

  const onTitleChange = useCallback(
    (e: FormEvent<HTMLSpanElement>) => {
      window.localStorage.setItem(`${id}_title_edited`, e.currentTarget.textContent || title);
    },
    [id],
  );

  return (
    <CardHeader className="flex flex-col p-0">
      <Header_Pin />
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
            ` bg-white hover:shadow-none dark:border-LynxRaisinBlack dark:bg-LynxRaisinBlack`
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
          `${(compactMode || !cardsDevName) && 'mt-3 !text-large font-bold'} ` +
          `${!cardsDesc && (cardsRepoInfo || cardsDevImage) && 'mb-4'} px-5 cursor-text`
        }
        spellCheck="false"
        onInput={onTitleChange}
        ellipsis={{tooltip: modifiedTitle}}
        contentEditable
        suppressContentEditableWarning>
        {modifiedTitle}
      </Text>

      {(cardsDesc || compactMode) && (
        <Paragraph
          type="secondary"
          className="mx-8 mt-3 text-center"
          ellipsis={{rows: 2, tooltip: {title: description, mouseEnterDelay: 0.5}}}>
          {description}
        </Paragraph>
      )}
    </CardHeader>
  );
});
export default LynxCardHeader;
