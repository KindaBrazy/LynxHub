import {Button, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, User} from '@heroui/react';
import {useInstalledCard} from '@lynx/hooks/utils';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {modalActions, useModalsState} from '@lynx/redux/reducers/modals';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {CardInfoDescriptions} from '@lynx_common/types/plugins/modules';
import {extractGitUrl, getCacheUrl, validateGitRepoUrl} from '@lynx_common/utils';
import {useDebounceBreadcrumb} from '@lynx_shared/sentry/Breadcrumbs';
import {Result} from 'antd';
import {isEmpty, startCase} from 'lodash';
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {useTabModalLifecycle} from '../../useTabModalManager';
import CardInfoDescription from './Description';
import useCardInfoApi from './useCardInfoApi';

type Props = {cardId: string; isOpen: boolean; devName: string; url: string; tabID: string};

const CardInfoModalNew = ({cardId, isOpen, devName, url, tabID}: Props) => {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();
  const webUI = useInstalledCard(cardId);

  const [openFolders, setOpenFolders] = useState<string[] | undefined>(undefined);
  const [cardInfoDescriptions, setCardInfoDescriptions] = useState<CardInfoDescriptions>(undefined);

  useEffect(() => {
    if (!isOpen) {
      setOpenFolders(undefined);
      setCardInfoDescriptions(undefined);
    }
  }, [isOpen]);

  const avatarUrl = useMemo(() => getCacheUrl(extractGitUrl(url).avatarUrl), [url]);

  useDebounceBreadcrumb('Card Git Manager Modal: ', [isOpen, cardId]);

  useCardInfoApi(cardId, setOpenFolders, setCardInfoDescriptions, webUI?.dir);

  const {onOpenChange, show} = useTabModalLifecycle('cardInfo', tabID);

  const onClose = useCallback(() => {
    dispatch(modalActions.setInfoCardId({cardID: '', tabID: activeTab}));
  }, [dispatch]);

  return (
    <Modal
      classNames={{
        backdrop: `top-10! ${show}`,
        wrapper: `top-10! scrollbar-hide ${show}`,
        base: 'pb-0!',
      }}
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      isDismissable={false}
      scrollBehavior="inside"
      onOpenChange={onOpenChange}
      className="overflow-hidden border-2 border-foreground-100 drop-shadow-lg"
      hideCloseButton>
      <ModalContent className="pb-4">
        <ModalHeader className="bg-foreground-100 shadow-md">
          {validateGitRepoUrl(url) && avatarUrl && (
            <User
              description={
                <Link size="sm" href={url} isExternal>
                  {url}
                </Link>
              }
              name={startCase(devName)}
              avatarProps={{src: avatarUrl}}
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
