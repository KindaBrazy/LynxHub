import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs} from '@heroui/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import {ChosenArgumentsData} from '@lynx_common/types';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {useDebounceBreadcrumb} from '@lynx_shared/sentry/Breadcrumbs';
import {Diskette} from '@solar-icons/react-perf/BoldDuotone';
import {Key, memo, useCallback, useEffect, useState} from 'react';

import {modalMotionProps} from '../../../../utils/constants';
import {useTabModalLifecycle} from '../../useTabModalManager';
import CardArguments from './Arguments';
import CustomRun from './CustomRun';
import CardPreLaunch from './PreLaunch';

const tabs = {
  arguments: 'arguments',
  customRun: 'custom-run',
  preLaunch: 'preLaunch',
};

type Props = {
  isOpen: boolean;
  tabID: string;
  haveArguments: boolean;
  title: string;
  id: string;
};

const LaunchConfig = memo(({isOpen, title, haveArguments, id, tabID}: Props) => {
  const [isSavingArgs, setIsSavingArgs] = useState<boolean>(false);
  const [chosenArguments, setChosenArguments] = useState<ChosenArgumentsData>({activePreset: '', data: []});
  const [currentTab, setCurrentTab] = useState<Key>(haveArguments ? tabs.arguments : tabs.customRun);

  useDebounceBreadcrumb('Card Launch Config Modal: ', [isOpen, title]);
  useDebounceBreadcrumb('Card Launch Config Tabs Modal: ', [currentTab]);

  useEffect(() => {
    setCurrentTab(haveArguments ? tabs.arguments : tabs.customRun);
  }, [isOpen, haveArguments]);

  const {onOpenChange, show} = useTabModalLifecycle('cardLaunchConfig', tabID);

  const saveArguments = useCallback(() => {
    setIsSavingArgs(true);
    const fakeDelay = 300;
    storageUtilsIpc.invoke
      .setCardArguments(id, chosenArguments)
      .then(() => {
        setTimeout(() => {
          topToast.success('Preset and arguments saved successfully.');
        }, fakeDelay);
      })
      .catch(() => {
        setTimeout(() => {
          topToast.danger('An error occurred while saving the preset and arguments.');
        }, fakeDelay);
      })
      .finally(() => {
        setTimeout(() => {
          setIsSavingArgs(false);
        }, fakeDelay);
      });
  }, [id, chosenArguments]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      isDismissable={false}
      scrollBehavior="inside"
      onOpenChange={onOpenChange}
      motionProps={modalMotionProps}
      className="z-40 max-w-[80%] border-2 border-foreground/10 dark:border-foreground/5"
      classNames={{backdrop: `top-10! ${show}`, wrapper: `top-10! scrollbar-hide ${show}`}}
      hideCloseButton>
      <ModalContent>
        <ModalHeader className="flex-col gap-y-2 pb-0 text-center">
          {title || 'Launch Config'}

          <Tabs
            variant="solid"
            color="secondary"
            className="z-10 my-3"
            onSelectionChange={setCurrentTab}
            selectedKey={currentTab.toString()}
            fullWidth>
            {haveArguments && <Tab title="Arguments" key={tabs.arguments} className="cursor-default" />}
            <Tab title="Custom Run" key={tabs.customRun} className="cursor-default" />
            <Tab title="Pre Launch" key={tabs.preLaunch} className="cursor-default" />
          </Tabs>
        </ModalHeader>

        <ModalBody className="scrollbar-hide">
          {haveArguments && currentTab === tabs.arguments && (
            <CardArguments
              id={id}
              tabId={tabID}
              chosenArguments={chosenArguments}
              setChosenArguments={setChosenArguments}
            />
          )}
          {currentTab === tabs.customRun && <CustomRun id={id} />}
          {currentTab === tabs.preLaunch && <CardPreLaunch id={id} />}
        </ModalBody>

        <ModalFooter>
          {currentTab === tabs.arguments && (
            <Button
              variant="light"
              color="success"
              onPress={saveArguments}
              isLoading={isSavingArgs}
              startContent={<Diskette className="size-4" />}>
              {!isSavingArgs && 'Save Arguments'}
            </Button>
          )}
          <Button color="warning" variant="light" onPress={handleClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default LaunchConfig;
