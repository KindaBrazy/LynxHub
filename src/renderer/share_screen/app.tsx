import {StyleProvider} from '@ant-design/cssinjs';
import {Button, Card, CardBody, CardHeader, Image, Switch, Tab, Tabs} from '@heroui/react';
import {Result} from 'antd';
import isEmpty from 'lodash/isEmpty';
import {useMemo, useState} from 'react';

import {
  MonitorDuo_Icon,
  RecordDuo_Icon,
  Share_Icon,
  VolumeDuo_Icon,
  VolumeMuteDuo_Icon,
  WindowFrameDuo_Icon,
} from './SvgIcons';

type WindowItem = {
  id: number;
  title: string;
  thumbnail: string;
};

type ScreenItem = {
  id: number;
  title: string;
  thumbnail: string;
  isPrimary: boolean;
};

type TabType = 'windows' | 'screens';
type ShareItem = WindowItem | ScreenItem;

type ScreenShareDialogProps = {
  siteName?: string;
  onShare?: (item: ShareItem, audio: boolean) => void;
  onCancel?: () => void;
};

export default function ScreenShare({siteName = 'example.com', onShare, onCancel}: ScreenShareDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>('windows');
  const [selectedItem, setSelectedItem] = useState<ShareItem | null>(null);
  const [shareAudio, setShareAudio] = useState<boolean>(false);
  const [isDarkMode] = useState<boolean>(false);

  const mockWindows: WindowItem[] = useMemo(
    () => [
      {id: 1, title: 'Google Chrome - YouTube', thumbnail: `https://picsum.photos/seed/${Math.random()}/180/80/?blur`},
      {id: 2, title: 'Visual Studio Code', thumbnail: `https://picsum.photos/seed/${Math.random()}/180/80/?blur`},
      {id: 3, title: 'Discord', thumbnail: `https://picsum.photos/seed/${Math.random()}/180/80/?blur`},
      {id: 4, title: 'Spotify', thumbnail: `https://picsum.photos/seed/${Math.random()}/180/80/?blur`},
      {id: 5, title: 'Figma', thumbnail: `https://picsum.photos/seed/${Math.random()}/180/80/?blur`},
      {id: 6, title: 'Terminal', thumbnail: `https://picsum.photos/seed/${Math.random()}/180/80/?blur`},
    ],
    [],
  );

  const mockScreens: ScreenItem[] = useMemo(
    () => [
      {
        id: 1,
        title: 'Built-in Display',
        thumbnail: `https://picsum.photos/seed/${Math.random()}/180/80/?blur`,
        isPrimary: true,
      },
      {
        id: 2,
        title: 'External Monitor',
        thumbnail: `https://picsum.photos/seed/${Math.random()}/180/80/?blur`,
        isPrimary: false,
      },
    ],
    [],
  );

  const handleItemSelect = (item: ShareItem): void => {
    setSelectedItem(item);
  };

  const handleShare = (): void => {
    if (selectedItem) {
      console.log('Sharing:', {item: selectedItem, audio: shareAudio});
      onShare?.(selectedItem, shareAudio);
    }
  };

  const handleCancel = (): void => {
    console.log('Share cancelled');
    onCancel?.();
  };

  const renderThumbnail = (item: ShareItem) => (
    <Card
      key={item.id}
      onPress={() => handleItemSelect(item)}
      className={` shadow-md border-1 border-foreground-200`}
      isPressable>
      <CardHeader className="p-0 relative">
        <Image radius="none" src={item.thumbnail} className="h-20 w-full object-cover rounded-t-lg" />
        {selectedItem?.id === item.id && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/70 animate-appearance-in z-10">
            <RecordDuo_Icon className="size-4 animate-appearance-in" />
          </div>
        )}
      </CardHeader>

      <CardBody
        className={
          'py-2 px-3 text-center  border-t border-foreground-100 bg-foreground-50 flex flex-row gap-x-2 items-center'
        }>
        <Image
          radius="sm"
          className="size-6"
          classNames={{wrapper: 'shrink-0'}}
          src={`https://picsum.photos/seed/${Math.random()}/30/30`}
        />
        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
      </CardBody>
    </Card>
  );

  const currentData: ShareItem[] = activeTab === 'windows' ? mockWindows : mockScreens;

  return (
    <StyleProvider layer>
      <main className={`${isDarkMode && 'dark'} text-foreground`}>
        <div className={'w-[620px] h-[480px] dark:bg-LynxRaisinBlack flex flex-col scrollbar-hide overflow-hidden'}>
          {/* Header */}
          <div className="px-4 py-2 border-b border-foreground-200 draggable">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Share your screen</h2>
            </div>
            <p className="mt-0.5 text-sm text-foreground-600">
              {`You're`} about to share your screen {shareAudio ? 'and audio ' : ''}with{' '}
              <span className="font-medium text-blue-600">{siteName}</span>
            </p>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-1.5">
            <Tabs size="sm" color="secondary" fullWidth>
              <Tab
                title={
                  <div className="flex items-center space-x-2">
                    <WindowFrameDuo_Icon className="size-4" />
                    <span>Application Window</span>
                  </div>
                }
                onClick={() => setActiveTab('windows')}
              />
              <Tab
                title={
                  <div className="flex items-center space-x-2">
                    <MonitorDuo_Icon className="size-4" />
                    <span>Entire Screen</span>
                  </div>
                }
                onClick={() => setActiveTab('screens')}
              />
            </Tabs>
          </div>

          {/* Audio Toggle */}
          <div className="px-6 py-2">
            <Switch
              size="sm"
              isSelected={shareAudio}
              onValueChange={setShareAudio}
              classNames={{label: 'flex flex-row items-center gap-x-1.5'}}>
              {shareAudio ? (
                <VolumeDuo_Icon className="size-[0.9rem]" />
              ) : (
                <VolumeMuteDuo_Icon className="size-[0.9rem]" />
              )}{' '}
              Share audio
            </Switch>
          </div>

          {/* Content Area */}
          <div className="flex-1 pl-6 pr-1 overflow-hidden">
            <div className="h-full overflow-y-auto pr-2 pb-4 pt-2">
              {isEmpty(currentData) ? (
                <div>
                  <Result title={<span className="text-foreground">No window found!</span>} />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">{currentData.map(item => renderThumbnail(item))}</div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-foreground-200 bg-foreground-100">
            <div className="flex justify-end gap-x-3">
              <Button size="sm" variant="flat" color="warning" onPress={handleCancel}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={handleShare}
                isDisabled={!selectedItem}
                startContent={<Share_Icon className="size-4" />}>
                Share
              </Button>
            </div>
          </div>
        </div>
      </main>
    </StyleProvider>
  );
}
