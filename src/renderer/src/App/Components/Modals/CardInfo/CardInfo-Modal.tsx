import {
  Button,
  Divider,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  User,
} from '@nextui-org/react';
import {Space} from 'antd';
import {isEmpty, startCase} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {RepoInfoType} from '../../../../../../cross/CrossTypes';
import {validateGitRepoUrl} from '../../../../../../cross/CrossUtils';
import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {useDevInfo} from '../../../Utils/LocalStorage';
import {useInstalledCard} from '../../../Utils/UtilHooks';
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
const CardInfoModal = () => {
  const [data, setData] = useState<RepoInfoType>(initData);
  const [installDir, setInstallDir] = useState<string>('');
  const {cardId, extensionsDir, isOpen, devName, url} = useModalsState('cardInfoModal');
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
    console.log('On Close');
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
      setInstallDir(webUI.dir!);

      const extensionsPath = extensionsDir?.startsWith('/') ? webUI.dir + extensionsDir : extensionsDir;

      rendererIpc.utils.getCardInfo(cardId, webUI.dir!, extensionsPath);
    }
  }, [webUI, cardId, extensionsDir]);

  const haveCardInfo = useMemo(() => {
    return !isEmpty(data.lastUpdate) || !isEmpty(data.releaseTag) || !isEmpty(data.installDate);
  }, [data]);

  const {picUrl} = useDevInfo(url);

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
        <ModalBody className="mt-4 pb-0 scrollbar-hide">
          <Space size="middle" direction="vertical">
            {haveCardInfo && (
              <CardInfoRepo lastUpdate={data.lastUpdate} releaseTag={data.releaseTag} installDate={data.installDate} />
            )}
            <Divider />
            <CardInfoDisk
              installDir={installDir}
              totalSize={data.totalSize}
              supportExtensions={!!extensionsDir}
              extensionsSize={data.extensionsSize}
            />
          </Space>
        </ModalBody>

        <ModalFooter className="border-t border-foreground/10 bg-foreground-100">
          <Button
            onPress={() => {
              onOpenChange(false);
              onClose();
            }}
            color="danger"
            variant="flat"
            fullWidth>
            <span className="font-semibold">Close</span>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CardInfoModal;
