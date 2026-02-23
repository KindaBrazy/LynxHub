import {Button, Card, CardBody, Spinner, Switch, Tab, Tabs} from '@heroui/react';
import {ScreenShareSources, ScreenShareStart} from '@lynx_common/types/shareScreen';
import shareScreenIpc from '@lynx_shared/ipc/shareScreen';
import {Monitor, Screencast, VolumeLoud, WindowFrame} from '@solar-icons/react-perf/BoldDuotone';
import isEmpty from 'lodash/isEmpty';
import {X} from 'lucide-react';
import {Key, useState} from 'react';

import {SourceCard} from './SourceCard';
import {useScreenSources} from './useScreenSources';

type TabType = 'windows' | 'screens';

/**
 * Main application component for the Share Screen window.
 * Allows users to select a window or screen to share.
 */
export default function ScreenShare() {
  const [activeTab, setActiveTab] = useState<TabType>('windows');
  const [selectedItem, setSelectedItem] = useState<string | undefined>(undefined);
  const [shareAudio, setShareAudio] = useState<boolean>(false);

  // Custom hook to fetch sources
  const {isLoading, screens, windows} = useScreenSources();

  const currentData: ScreenShareSources[] = activeTab === 'windows' ? windows : screens;

  const handleShare = (): void => {
    if (selectedItem) {
      const result: ScreenShareStart = {
        id: selectedItem,
        shareAudio: shareAudio,
        type: activeTab,
      };
      shareScreenIpc.startShare(result);
    }
  };

  const handleCancel = (): void => {
    shareScreenIpc.cancel();
  };

  const handleTabChange = (key: Key) => {
    setActiveTab(key as TabType);
    setSelectedItem(undefined); // Reset selection when switching tabs
  };

  const renderEmptyState = () => (
    <div className="flex size-full flex-col items-center justify-center gap-4">
      <Card className="w-full max-w-sm border-none bg-transparent shadow-none">
        <CardBody className="items-center text-center">
          <Monitor className="mb-4 size-12 text-default-300" />
          <h3 className="text-lg font-medium text-foreground">Nothing to share</h3>
          <p className="text-small text-default-500">No {activeTab} available to capture.</p>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <main>
      <div className={'h-120 w-155 flex flex-col overflow-hidden scrollbar-hide dark:bg-LynxRaisinBlack'}>
        {/* Header */}
        <div className="border-b border-foreground-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Select window or screen to share</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-1.5">
          <Tabs size="sm" color="secondary" selectedKey={activeTab} onSelectionChange={handleTabChange} fullWidth>
            <Tab
              title={
                <div className="flex items-center space-x-2">
                  <WindowFrame className="size-4" />
                  <span>Application Window</span>
                </div>
              }
              key="windows"
            />
            <Tab
              title={
                <div className="flex items-center space-x-2">
                  <Monitor className="size-4" />
                  <span>Entire Screen</span>
                </div>
              }
              key="screens"
            />
          </Tabs>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden pl-6 pr-1">
          {isLoading ? (
            <div className="flex size-full items-center justify-center">
              <Spinner size="lg" label="Detecting available windows and screens..." />
            </div>
          ) : (
            <div className="h-full overflow-y-auto pb-4 pr-2 pt-2">
              {isEmpty(currentData) ? (
                renderEmptyState()
              ) : (
                <div className="flex flex-row flex-wrap items-center justify-center gap-4">
                  {currentData.map(item => (
                    <SourceCard
                      item={item}
                      key={item.id}
                      isScreen={activeTab === 'screens'}
                      isSelected={selectedItem === (activeTab === 'windows' ? item.id : item.displayId)}
                      onSelect={() => setSelectedItem(activeTab === 'windows' ? item.id : item.displayId)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-foreground-200 bg-foreground-100 px-4 py-2">
          <div className="flex justify-between gap-x-3">
            <Switch
              classNames={{
                label: 'flex flex-row items-center gap-x-1.5',
                startContent: 'size-[0.65rem]',
                endContent: 'size-[0.65rem]',
              }}
              size="sm"
              endContent={<X />}
              isSelected={shareAudio}
              startContent={<VolumeLoud />}
              onValueChange={setShareAudio}>
              Share audio
            </Switch>
            <div className="flex justify-between gap-x-3">
              <Button size="sm" color="warning" variant="light" onPress={handleCancel}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={handleShare}
                isDisabled={!selectedItem}
                startContent={<Screencast className="size-4" />}>
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
