import {Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Chip} from '@nextui-org/react';
import {Space, Typography} from 'antd';
import {useMemo} from 'react';

import {getIconByName} from '../../../../../../../assets/icons/SvgIconsContainer';
import {useAppState} from '../../../../../../Redux/App/AppReducer';
import {useSettingsState} from '../../../../../../Redux/App/SettingsReducer';

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
        ` mx-4 border-1 border-foreground/10 duration-300 hover:shadow-xl dark:bg-[#323232]`
      }>
      <CardHeader className="flex flex-col p-0">
        <div
          className={
            `${darkMode ? 'darkPattern' : 'lightPattern'} ` +
            `${compactMode ? 'h-16' : allDisabled ? 'h-16' : halfDisabled ? 'h-20' : 'h-24'} w-full`
          }
        />

        {!compactMode && cardsDevImage && (
          <div
            className={
              `z-10 -mt-10 size-20 shrink-0 self-center overflow-hidden rounded-full` +
              ` border-1 border-white shadow-[0px_6px_5px_-3px_rgba(0,0,0,0.6)] transition duration-500` +
              ` bg-white hover:shadow-none dark:border-black dark:bg-LynxRaisinBlack`
            }>
            {getIconByName('User', {className: 'size-full p-2 dark:bg-LynxRaisinBlack/70 bg-white/70'})}
          </div>
        )}

        {!compactMode && cardsDevName && (
          <Typography.Title level={5} className={`mt-3 self-center !text-lg`}>
            Developer Name
          </Typography.Title>
        )}

        <Typography.Text
          className={
            `${(compactMode || !cardsDevName) && 'mt-3 !text-large'} ` +
            `${!cardsDesc && (cardsRepoInfo || cardsDevImage) && 'mb-4'} `
          }>
          Project Title
        </Typography.Text>

        {(cardsDesc || compactMode) && (
          <Typography.Paragraph type="secondary" className="mx-3 mt-1" ellipsis={{rows: 2, tooltip: loremText}}>
            {loremText}
          </Typography.Paragraph>
        )}
      </CardHeader>
      {!compactMode && cardsRepoInfo && (
        <CardBody className="bg-[#f7f7f7] dark:bg-[#292929]">
          <Space wrap>
            <Chip
              size="sm"
              radius="sm"
              variant="flat"
              className="transition duration-500 hover:bg-black/0"
              startContent={getIconByName('Star', {className: 'fill-yellow-400 mx-1'})}>
              Stars: 7.7K
            </Chip>
            <Chip
              size="sm"
              radius="sm"
              variant="flat"
              className="transition duration-500 hover:bg-black/0"
              startContent={getIconByName('Fork', {className: 'mx-1'})}>
              Forks: 0.7K
            </Chip>
            <Chip
              size="sm"
              radius="sm"
              variant="flat"
              className="transition duration-500 hover:bg-black/0"
              startContent={getIconByName('Issue', {className: 'mx-1'})}>
              Issues: 7
            </Chip>
            <Chip
              size="sm"
              radius="sm"
              variant="flat"
              className="transition duration-500 hover:bg-black/0"
              startContent={getIconByName('Download', {className: 'mx-1'})}>
              Size: 77MB
            </Chip>
          </Space>
        </CardBody>
      )}
      <CardFooter>
        <ButtonGroup className="mb-1" fullWidth>
          <Button
            startContent={getIconByName('Download2', {
              className: compactMode ? 'size-5 text-white' : 'size-6 text-white',
            })}
            variant="solid"
            color={'secondary'}
            size={compactMode ? 'sm' : 'md'}
            className="z-[11] hover:scale-[1.03]"
          />
          <Button
            className="cursor-default"
            size={compactMode ? 'sm' : 'md'}
            startContent={getIconByName('Document', {className: `size-full ${compactMode ? 'm-2' : 'm-2.5'}`})}
            isIconOnly
          />
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
