import {StyleProvider} from '@ant-design/cssinjs';
import {Button, Card, CardBody, CardHeader, Image, Spinner, Switch, Tab, Tabs} from '@heroui/react';
import {Result} from 'antd';
import isEmpty from 'lodash/isEmpty';
import {useEffect, useState} from 'react';

import {screenShareChannels} from '../../cross/ScreenShareConsts';
import {ScreenShareSources, ScreenShareStart} from '../../cross/ScreenShareTypes';
import {CloseSimple_Icon} from '../src/assets/icons/SvgIcons/SvgIcons';
import {MonitorDuo_Icon, RecordDuo_Icon, Share_Icon, VolumeDuo_Icon, WindowFrameDuo_Icon} from './SvgIcons';

type TabType = 'windows' | 'screens';

const ipc = window.electron.ipcRenderer;

type Props = {isDarkMode: boolean};

export default function ScreenShare({isDarkMode}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('windows');
  const [selectedItem, setSelectedItem] = useState<string | undefined>(undefined);
  const [shareAudio, setShareAudio] = useState<boolean>(false);
  const [mockWindows, setMockWindows] = useState<ScreenShareSources[]>([]);
  const [mockScreens, setMockScreens] = useState<ScreenShareSources[]>([]);

  const [isLoadingSources, setIsLoadingSources] = useState<boolean>(true);

  const currentData: ScreenShareSources[] = activeTab === 'windows' ? mockWindows : mockScreens;

  useEffect(() => {
    setIsLoadingSources(true);

    Promise.all([ipc.invoke(screenShareChannels.getScreenSources), ipc.invoke(screenShareChannels.getWindowSources)])
      .then(([screens, windows]) => {
        setMockScreens(screens);
        setMockWindows(windows);
      })
      .finally(() => {
        setIsLoadingSources(false);
      })
      .catch(() => {
        ipc.send(screenShareChannels.cancel);
      });
  }, []);

  const handleShare = (): void => {
    if (selectedItem) {
      const result: ScreenShareStart = {id: selectedItem, shareAudio: shareAudio, type: activeTab};
      ipc.send(screenShareChannels.startShare, result);
    }
  };

  const handleCancel = (): void => {
    ipc.send(screenShareChannels.cancel);
  };

  const renderThumbnail = (item: ScreenShareSources) => (
    <Card
      className={
        `shadow-md border border-foreground-200 animate-appearance-in ` +
        `${activeTab === 'screens' ? 'max-w-full' : 'max-w-64'} h-fit`
      }
      key={item.id}
      onPress={() => setSelectedItem(activeTab === 'windows' ? item.id : item.display_id)}
      isPressable>
      <CardHeader className="p-0 relative overflow-hidden">
        <img alt={item.name} src={item.thumbnail} className="size-full object-cover" />
        {selectedItem === (activeTab === 'windows' ? item.id : item.display_id) && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/70 animate-appearance-in z-10">
            <RecordDuo_Icon className="size-4 animate-appearance-in" />
          </div>
        )}
      </CardHeader>

      <CardBody
        className={
          'overflow-hidden px-3 text-center max-h-12 border-t border-foreground-100' +
          ' bg-foreground-50 flex flex-row gap-x-2 items-center'
        }>
        {item.icon && <Image radius="sm" src={item.icon} className="size-6" classNames={{wrapper: 'shrink-0'}} />}
        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
      </CardBody>
    </Card>
  );

  return (
    <StyleProvider layer>
      <main className={`${isDarkMode && 'dark'} text-foreground`}>
        <div className={'w-[620px] h-[480px] dark:bg-LynxRaisinBlack flex flex-col scrollbar-hide overflow-hidden'}>
          {/* Header */}
          <div className="px-4 py-2 border-b border-foreground-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Select window or screen to share</h2>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 py-1.5">
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

          {/* Content Area */}
          <div className="flex-1 pl-6 pr-1 overflow-hidden">
            {isLoadingSources ? (
              <div className="flex size-full items-center justify-center">
                <Spinner size="lg" label="Detecting available windows and screens..." />
              </div>
            ) : (
              <div className="h-full overflow-y-auto pr-2 pb-4 pt-2">
                {isEmpty(currentData) ? (
                  <div className="size-full items-center flex justify-center">
                    <Result title={<span className="text-foreground">Nothing to share</span>} />
                  </div>
                ) : (
                  <div className="flex flex-row flex-wrap gap-4 items-center justify-center">
                    {currentData.map(item => renderThumbnail(item))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-foreground-200 bg-foreground-100">
            <div className="flex justify-between gap-x-3">
              <Switch
                classNames={{
                  label: 'flex flex-row items-center gap-x-1.5',
                  startContent: 'size-[0.65rem]',
                  endContent: 'size-[0.65rem]',
                }}
                size="sm"
                isSelected={shareAudio}
                onValueChange={setShareAudio}
                startContent={<VolumeDuo_Icon />}
                endContent={<CloseSimple_Icon />}>
                Share audio
              </Switch>
              <div className="flex justify-between gap-x-3">
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
        </div>
      </main>
    </StyleProvider>
  );
}
