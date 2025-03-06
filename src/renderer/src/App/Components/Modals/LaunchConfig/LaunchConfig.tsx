import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs} from '@heroui/react';
import {message} from 'antd';
import {Key, memo, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {ChosenArgumentsData} from '../../../../../../cross/CrossTypes';
import {modalActions, useModalsState} from '../../../Redux/Reducer/ModalsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {modalMotionProps} from '../../../Utils/Constants';
import CardArguments from './Arguments/CardArguments';
import CustomRun from './CustomRun/CustomRun';
import CardPreLaunch from './PreLaunch/CardPreLaunch';

const tabs = {
  arguments: 'arguments',
  customRun: 'custom-run',
  preLaunch: 'preLaunch',
};

/** Manage card launch configurations: pre-open paths, commands, arguments, etc. */
const LaunchConfig = memo(() => {
  const {isOpen, title, haveArguments, id, tabID} = useModalsState('cardLaunchConfig');
  const activeTab = useTabsState('activeTab');
  const [isSavingArgs, setIsSavingArgs] = useState<boolean>(false);
  const [chosenArguments, setChosenArguments] = useState<ChosenArgumentsData>({activePreset: '', data: []});
  const [currentTab, setCurrentTab] = useState<Key>(haveArguments ? tabs.arguments : tabs.customRun);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setCurrentTab(haveArguments ? tabs.arguments : tabs.customRun);
  }, [isOpen]);

  const onClose = useCallback(() => {
    dispatch(modalActions.closeModal('cardLaunchConfig'));
  }, [dispatch]);

  const saveArguments = useCallback(() => {
    setIsSavingArgs(true);
    const fakeDelay = 300;
    rendererIpc.storageUtils
      .setCardArguments(id, chosenArguments)
      .then(() => {
        setTimeout(() => {
          message.success(`Preset and arguments saved successfully.`);
        }, fakeDelay);
      })
      .catch(() => {
        setTimeout(() => {
          message.error(`An error occurred while saving the preset and arguments.`);
        }, fakeDelay);
      })
      .finally(() => {
        setTimeout(() => {
          setIsSavingArgs(false);
        }, fakeDelay);
      });
  }, [id, chosenArguments]);

  const show = useMemo(() => (activeTab === tabID ? 'flex' : 'hidden'), [activeTab, tabID]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={false}
      scrollBehavior="inside"
      motionProps={modalMotionProps}
      className="z-40 max-w-[80%] border-2 border-foreground/10 dark:border-foreground/5"
      classNames={{backdrop: `!top-10 ${show}`, wrapper: `!top-10 scrollbar-hide ${show}`}}
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
            fullWidth
            disableAnimation>
            {haveArguments && <Tab title="Arguments" key={tabs.arguments} className="cursor-default" />}
            <Tab title="Custom Run" key={tabs.customRun} className="cursor-default" />
            <Tab title="Pre Launch" key={tabs.preLaunch} className="cursor-default" />
          </Tabs>
        </ModalHeader>

        <ModalBody className="scrollbar-hide">
          {haveArguments && currentTab === tabs.arguments && (
            <CardArguments chosenArguments={chosenArguments} setChosenArguments={setChosenArguments} />
          )}
          {currentTab === tabs.customRun && <CustomRun />}
          {currentTab === tabs.preLaunch && <CardPreLaunch />}
        </ModalBody>

        <ModalFooter>
          {currentTab === tabs.arguments && (
            <Button variant="light" color="success" onPress={saveArguments} isLoading={isSavingArgs}>
              {!isSavingArgs && 'Save Arguments'}
            </Button>
          )}
          <Button color="warning" variant="light" onPress={onClose} className="cursor-default">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default LaunchConfig;
