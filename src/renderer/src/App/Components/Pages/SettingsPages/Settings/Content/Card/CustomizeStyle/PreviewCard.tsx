import {Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader} from '@heroui/react';
import {Divider, Typography} from 'antd';
import {useMemo} from 'react';

import {Download_Icon} from '../../../../../../../../assets/icons/SvgIcons/SvgIcons1';
import {Fork_Icon, MenuDots_Icon, Pin_Icon, Play_Icon} from '../../../../../../../../assets/icons/SvgIcons/SvgIcons2';
import {Star_Icon, User_Icon} from '../../../../../../../../assets/icons/SvgIcons/SvgIcons3';
import {useAppState} from '../../../../../../../Redux/Reducer/AppReducer';
import {useSettingsState} from '../../../../../../../Redux/Reducer/SettingsReducer';

const loremText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt' +
  ' ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation' +
  ' ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit' +
  ' in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat' +
  ' cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

export default function PreviewCard() {
  const darkMode = useAppState('darkMode');
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

  return (
    <Card
      className={
        ` ${compactMode ? 'w-[230px]' : 'w-[277px]'} h-fit cursor-default shadow-md !transition ` +
        ` mx-4 border-1 border-foreground/10 duration-300 hover:shadow-xl dark:bg-[#3d3d3d]`
      }>
      <CardHeader className="flex flex-col p-0">
        <div
          className={
            `${darkMode ? 'darkPattern' : 'lightPattern'} ` +
            `${compactMode ? 'h-16' : allDisabled ? 'h-16' : halfDisabled ? 'h-20' : 'h-24'} w-full`
          }
        />
        <Button
          size="sm"
          radius="full"
          variant="flat"
          color="default"
          className="absolute z-20 top-3 left-3"
          isIconOnly>
          <Pin_Icon className="transition duration-500 -rotate-45" />
        </Button>

        {!compactMode && cardsDevImage && (
          <div
            className={
              `z-10 -mt-10 size-20 shrink-0 self-center overflow-hidden rounded-full` +
              ` border-1 border-white shadow-[0px_6px_5px_-3px_rgba(0,0,0,0.6)] transition duration-500` +
              ` bg-white hover:shadow-none dark:border-LynxRaisinBlack dark:bg-LynxRaisinBlack`
            }>
            <User_Icon className="size-full p-2 dark:bg-LynxRaisinBlack/70 bg-white/70" />
          </div>
        )}

        {!compactMode && cardsDevName && (
          <Typography.Title level={5} className={`mt-3 self-center !text-lg`}>
            Developer Name
          </Typography.Title>
        )}

        <Typography.Text
          className={
            `${(compactMode || !cardsDevName) && 'mt-3 !text-large font-bold'} ` +
            `${!cardsDesc && (cardsRepoInfo || cardsDevImage) && 'mb-4'} `
          }>
          Project Title
        </Typography.Text>

        {(cardsDesc || compactMode) && (
          <Typography.Paragraph
            type="secondary"
            className="mx-8 mt-3 text-center"
            ellipsis={{rows: 2, tooltip: loremText}}>
            {loremText}
          </Typography.Paragraph>
        )}
      </CardHeader>
      {!compactMode && cardsRepoInfo && (
        <CardBody className="flex flex-row items-center justify-center gap-x-2 bg-[#f7f7f7] text-xs dark:bg-[#292929]">
          <div className="flex flex-col items-center justify-center">
            <span className="font-bold">77K</span>
            <div className="flex flex-row items-center">
              <Star_Icon className="fill-yellow-500 mx-1" />
              <span>Stars</span>
            </div>
          </div>

          <Divider type="vertical" />

          <div className="flex flex-col items-center justify-center">
            <span className="font-bold">7.7K</span>

            <div className="flex flex-row items-center">
              <Fork_Icon className="mx-1" />
              <span>Forks</span>
            </div>
          </div>

          <Divider type="vertical" />

          <div className="flex flex-col items-center justify-center">
            <span className="font-bold">777MB</span>

            <div className="flex flex-row items-center">
              <Download_Icon className="mx-1" />
              <span>Size</span>
            </div>
          </div>
        </CardBody>
      )}
      <CardFooter>
        <ButtonGroup fullWidth>
          <Button
            color="primary"
            size={compactMode ? 'sm' : 'md'}
            className="z-[11] hover:scale-[1.03]"
            startContent={<Play_Icon className={compactMode ? `size-4` : 'size-5'} />}
            fullWidth
          />
          <Button
            size={compactMode ? 'sm' : 'md'}
            className="cursor-default bg-foreground-200 dark:bg-foreground-100"
            startContent={<MenuDots_Icon className="size-[1.3rem] m-2 rotate-90" />}
            isIconOnly
          />
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
