import {Button, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, User} from '@heroui/react';
import {Result} from 'antd';
import {isEmpty, startCase} from 'lodash';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {validateGitRepoUrl} from '../../../../../../cross/CrossUtils';
import {CardInfoDescriptions} from '../../../Modules/types';
import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import {useDevInfo} from '../../../Utils/LocalStorage';
import {useInstalledCard} from '../../../Utils/UtilHooks';
import CardInfoDescription from './CardInfo-Description';
import useCardInfoApi from './UseCardInfoApi';

/** Displaying information about card (Disk usage, developer, repository details) */
const CardInfoModalNew = () => {
  const {cardId, isOpen, devName, url} = useModalsState('cardInfoModal');
  const dispatch = useDispatch<AppDispatch>();
  const webUI = useInstalledCard(cardId);

  const [openFolders, setOpenFolders] = useState<string[] | undefined>(undefined);
  const [cardInfoDescriptions, setCardInfoDescriptions] = useState<CardInfoDescriptions>(undefined);

  const {picUrl} = useDevInfo(url);

  useCardInfoApi(cardId, setOpenFolders, setCardInfoDescriptions, webUI?.dir);

  const onOpenChange = useCallback(
    (isOpen: boolean) =>
      dispatch(
        modalActions.setIsOpen({
          isOpen,
          modalName: 'cardInfoModal',
        }),
      ),
    [dispatch],
  );

  const onClose = useCallback(() => {
    dispatch(modalActions.setInfoCardId(''));
  }, [dispatch]);

  return (
    <Modal
      classNames={{
        backdrop: '!top-10',
        wrapper: '!top-10 scrollbar-hide',
        base: '!pb-0',
      }}
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
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
            variant="light"
            className="cursor-default">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CardInfoModalNew;
