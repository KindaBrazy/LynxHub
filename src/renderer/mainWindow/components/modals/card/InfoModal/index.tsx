import {Avatar, Description, Label, Link, Modal} from '@heroui-v3/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import {CardInfoDescriptions} from '@lynx_common/types/plugins/modules';
import {extractGitUrl, getCacheUrl, validateGitRepoUrl} from '@lynx_common/utils';
import {useDebounceBreadcrumb} from '@lynx_shared/sentry/Breadcrumbs';
import {Inbox} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty, startCase} from 'lodash';
import {Fragment, useEffect, useMemo, useState} from 'react';

import {extensionsData} from '../../../../plugins/extensions/loader';
import {useModalsState} from '../../../../redux/reducers/modals';
import {useInstalledCard} from '../../../../utils/hooks';
import TabModal from '../../../TabModal';
import {useTabModalLifecycle} from '../../useTabModalManager';
import CardInfoDescription from './Description';
import useCardInfoApi from './useCardInfoApi';

interface CardInfoModalContentProps {
  cardId: string;
  isOpen: boolean;
  devName: string;
  url: string;
  tabID: string;
}

const CardInfoModalContent = ({cardId, isOpen, devName, url, tabID}: CardInfoModalContentProps) => {
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

  useDebounceBreadcrumb('Card Info Modal: ', [isOpen, cardId]);

  useCardInfoApi(cardId, setOpenFolders, setCardInfoDescriptions, webUI?.dir);

  const {onOpenChange} = useTabModalLifecycle('cardInfo', tabID);

  return (
    <TabModal size="lg" isOpen={isOpen} onOpenChange={onOpenChange} dialogClassName="w-3xl! max-w-3xl!">
      <Modal.CloseTrigger />
      <Modal.Header>
        <Modal.Heading>
          {validateGitRepoUrl(url) && avatarUrl && (
            <div className="inline-flex items-center gap-2">
              <Avatar>
                <Avatar.Image alt={startCase(devName)} src={getCacheUrl(extractGitUrl(url).avatarUrl)} />
                <Avatar.Fallback>
                  {...startCase(devName)
                    .split(' ')
                    .map(item => item.slice(0, 1).toUpperCase())}
                </Avatar.Fallback>
              </Avatar>
              <div className="flex flex-col">
                <Label>{startCase(devName)}</Label>
                <Description>
                  <Link href={url} className="group no-underline hover:underline">
                    {url}
                    <Link.Icon />
                  </Link>
                </Description>
              </div>
            </div>
          )}
        </Modal.Heading>
      </Modal.Header>
      <Modal.Body className="scrollbar-hide">
        {isEmpty(openFolders) && isEmpty(cardInfoDescriptions) ? (
          <EmptyStateCard
            bodyClassName="my-6"
            icon={<Inbox size={40} />}
            className="bg-surface-secondary"
            title="No data available to display!"
          />
        ) : (
          <CardInfoDescription folders={openFolders} descriptions={cardInfoDescriptions} />
        )}
      </Modal.Body>
    </TabModal>
  );
};

const CardInfoModal = () => {
  const CardInfo = useMemo(() => extensionsData.replaceModals.cardInfo, []);

  const cardInfoModal = useModalsState('cardInfoModal');

  return (
    <>
      {cardInfoModal.map(modal => (
        <Fragment key={`${modal.tabID}_modal`}>
          {CardInfo ? <CardInfo /> : <CardInfoModalContent {...modal} />}
        </Fragment>
      ))}
    </>
  );
};

export default CardInfoModal;
