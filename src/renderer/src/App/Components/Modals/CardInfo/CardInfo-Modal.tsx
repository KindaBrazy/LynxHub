import {Divider, Modal, ModalBody, ModalContent, ModalHeader, Spinner} from '@nextui-org/react';
import {Space} from 'antd';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {RepoInfoType} from '../../../../../../cross/CrossTypes';
import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {useInstalledCard} from '../../../Utils/UtilHooks';
import CardInfoDev from './CardInfo-Dev';
import CardInfoDisk from './CardInfo-Disk';
import CardInfoRepo from './CardInfo-Repo';

export const progressElem = (label: string) => (
  <Spinner size="sm" label={label} className="flex-row space-x-1" classNames={{label: 'text-opacity-70'}} />
);

const initData = {
  extensionsSize: '',
  installDate: '',
  lastUpdate: '',
  releaseTag: '',
  totalSize: '',
};

/** Displaying information about card (Disk usage, developer, repository details) */
export default function CardInfoModal() {
  const [data, setData] = useState<RepoInfoType>(initData);
  const [installDir, setInstallDir] = useState<string>('');
  const {cardId, extensionsDir, isOpen, title} = useModalsState('cardInfoModal');
  const webUI = useInstalledCard(cardId);

  const dispatch = useDispatch<AppDispatch>();

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
    setData(initData);
  }, [dispatch]);

  useEffect(() => {
    setData(initData);
    rendererIpc.utils.offCardInfo();

    if (!isEmpty(cardId)) {
      rendererIpc.utils.onCardInfo((_, cardInfo) => {
        if (cardInfo.id === cardId) {
          if (cardInfo.type === 'repo' && 'releaseTag' in cardInfo.data) {
            const {installDate, lastUpdate, releaseTag} = cardInfo.data;
            setData(prevState => ({...prevState, installDate, lastUpdate, releaseTag}));
          } else if (cardInfo.type === 'disk' && 'totalSize' in cardInfo.data) {
            const {extensionsSize, totalSize} = cardInfo.data;
            setData(prevState => ({...prevState, extensionsSize, totalSize}));
          }
        }
      });
    }
  }, [cardId]);

  useEffect(() => {
    if (webUI) {
      setInstallDir(webUI.dir);

      const extensionsPath = extensionsDir?.startsWith('/') ? webUI.dir + extensionsDir : extensionsDir;

      rendererIpc.utils.getCardInfo(cardId, webUI.dir, extensionsPath);
    }
  }, [webUI, cardId, extensionsDir]);

  return (
    <Modal
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
      backdrop="transparent"
      scrollBehavior="inside"
      onOpenChange={onOpenChange}
      className="border-2 border-foreground/5 bg-foreground-100 drop-shadow-lg"
      classNames={{backdrop: 'top-10', closeButton: 'cursor-default', wrapper: 'top-10 scrollbar-hide'}}>
      <ModalContent className="pb-4">
        <ModalHeader className="justify-center border-b border-foreground/20 shadow-md">{title}</ModalHeader>
        <ModalBody className="mb-2 mt-4 scrollbar-hide">
          <Space size="middle" direction="vertical">
            <CardInfoDev />
            <Divider />
            <CardInfoRepo lastUpdate={data.lastUpdate} releaseTag={data.releaseTag} installDate={data.installDate} />
            <Divider />
            <CardInfoDisk
              installDir={installDir}
              totalSize={data.totalSize}
              supportExtensions={!!extensionsDir}
              extensionsSize={data.extensionsSize}
            />
          </Space>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
