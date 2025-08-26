import {Button, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, User} from '@heroui/react';
import {Result} from 'antd';
import {isEmpty, startCase} from 'lodash';
import {Fragment, useCallback, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {validateGitRepoUrl} from '../../../../../../cross/CrossUtils';
import {CardInfoDescriptions} from '../../../../../../cross/plugin/ModuleTypes';
import {useDebounceBreadcrumb} from '../../../../../Breadcrumbs';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {modalActions, useModalsState} from '../../../Redux/Reducer/ModalsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import {REMOVE_MODAL_DELAY} from '../../../Utils/Constants';
import {useDevInfo} from '../../../Utils/LocalStorage';
import {useInstalledCard} from '../../../Utils/UtilHooks';
import CardInfoDescription from './CardInfo-Description';
import useCardInfoApi from './UseCardInfoApi';

type Props = {cardId: string; isOpen: boolean; devName: string; url: string; tabID: string};

const CardInfoModalNew = ({cardId, isOpen, devName, url, tabID}: Props) => {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();
  const webUI = useInstalledCard(cardId);

  const [openFolders, setOpenFolders] = useState<string[] | undefined>(undefined);
  const [cardInfoDescriptions, setCardInfoDescriptions] = useState<CardInfoDescriptions>(undefined);

  const {picUrl} = useDevInfo(url);

  useDebounceBreadcrumb('Card Git Manager Modal: ', [isOpen, cardId]);

  useCardInfoApi(cardId, setOpenFolders, setCardInfoDescriptions, webUI?.dir);

  const onOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        dispatch(modalActions.closeCardInfo({tabID: activeTab}));
        setTimeout(() => {
          dispatch(modalActions.removeCardInfo({tabID: activeTab}));
        }, REMOVE_MODAL_DELAY);
      }
    },
    [dispatch, activeTab],
  );

  const onClose = useCallback(() => {
    dispatch(modalActions.setInfoCardId({cardID: '', tabID: activeTab}));
  }, [dispatch]);

  const show = useMemo(() => (activeTab === tabID ? 'flex' : 'hidden'), [activeTab, tabID]);

  return (
    <Modal
      classNames={{
        backdrop: `!top-10 ${show}`,
        wrapper: `!top-10 scrollbar-hide ${show}`,
        base: '!pb-0',
      }}
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      isDismissable={false}
      scrollBehavior="inside"
      onOpenChange={onOpenChange}
      className="overflow-hidden border-2 border-foreground/5 drop-shadow-lg"
      hideCloseButton>
      <ModalContent className="pb-4">
        <ModalHeader className="border-b border-foreground/20 bg-foreground-100 shadow-md">
          {validateGitRepoUrl(url) && picUrl && (
            <User
              description={
                <Link size="sm" href={url} isExternal>
                  {url}
                </Link>
              }
              name={startCase(devName)}
              avatarProps={{src: picUrl}}
            />
          )}
        </ModalHeader>
        <ModalBody className="my-4 pb-0 scrollbar-hide">
          {isEmpty(openFolders) && isEmpty(cardInfoDescriptions) ? (
            <Result title="No data available to show!" />
          ) : (
            <CardInfoDescription folders={openFolders} descriptions={cardInfoDescriptions} />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            onPress={() => {
              onOpenChange(false);
              onClose();
            }}
            color="warning"
            variant="light">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const CardInfoModal = () => {
  const CardInfo = useMemo(() => extensionsData.replaceModals.cardInfo, []);

  const cardInfoModal = useModalsState('cardInfoModal');

  return (
    <>
      {cardInfoModal.map(modal => (
        <Fragment key={`${modal.tabID}_modal`}>{CardInfo ? <CardInfo /> : <CardInfoModalNew {...modal} />}</Fragment>
      ))}
    </>
  );
};

export default CardInfoModal;
