import {StyleProvider} from '@ant-design/cssinjs';
import {Button, Card, CardBody, CardHeader, Image, Switch, Tab, Tabs} from '@heroui/react';
import {Result} from 'antd';
import isEmpty from 'lodash/isEmpty';
import {useEffect, useState} from 'react';

import {screenShareChannels} from '../../cross/ScreenShareConsts';
import {ScreenShareSources, ScreenShareStart} from '../../cross/ScreenShareTypes';
import {
  MonitorDuo_Icon,
  RecordDuo_Icon,
  Share_Icon,
  VolumeDuo_Icon,
  VolumeMuteDuo_Icon,
  WindowFrameDuo_Icon,
} from './SvgIcons';

type TabType = 'windows' | 'screens';

const ipc = window.electron.ipcRenderer;

export default function ScreenShare() {
  const [activeTab, setActiveTab] = useState<TabType>('windows');
  const [selectedItem, setSelectedItem] = useState<string | undefined>(undefined);
  const [shareAudio, setShareAudio] = useState<boolean>(false);
  const [isDarkMode] = useState<boolean>(false);
  const [mockWindows, setMockWindows] = useState<ScreenShareSources[]>([]);
  const [mockScreens, setMockScreens] = useState<ScreenShareSources[]>([]);

  const currentData: ScreenShareSources[] = activeTab === 'windows' ? mockWindows : mockScreens;

  useEffect(() => {
    ipc.invoke(screenShareChannels.getScreenSources).then((result: ScreenShareSources[]) => {
      console.log(result);
      setMockScreens(result);
    });
    ipc.invoke(screenShareChannels.getWindowSources).then((result: ScreenShareSources[]) => {
      console.log(result);
      setMockWindows(result);
    });
  }, []);

  const handleShare = (): void => {
    if (selectedItem) {
      const result: ScreenShareStart = {id: selectedItem, shareAudio: shareAudio, type: activeTab};
      console.log('Sharing:', result);
      ipc.send(screenShareChannels.startShare, result);
    }
  };

  const handleCancel = (): void => {
    console.log('Share cancelled');
    ipc.send(screenShareChannels.cancel);
  };

  const renderThumbnail = (item: ScreenShareSources) => (
    <Card
      key={item.id}
      className={` shadow-md border-1 border-foreground-200`}
      onPress={() => setSelectedItem(activeTab === 'windows' ? item.id : item.display_id)}
      isPressable>
      <CardHeader className="p-0 relative">
        <Image radius="none" alt={item.name} src={item.thumbnail} className="h-20 w-full object-cover" />
        {selectedItem === (activeTab === 'windows' ? item.id : item.display_id) && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/70 animate-appearance-in z-10">
            <RecordDuo_Icon className="size-4 animate-appearance-in" />
          </div>
        )}
      </CardHeader>

      <CardBody
        className={
          'py-2 px-3 text-center  border-t border-foreground-100 bg-foreground-50 flex flex-row gap-x-2 items-center'
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
