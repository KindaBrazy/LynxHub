import {Button} from '@heroui/react';
import {Descriptions, notification} from 'antd';
import {isEmpty} from 'lodash';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {PullResult} from 'simple-git';

import {GitProgressCallback} from '../../../../../../cross/IpcChannelAndTypes';
import {cardsActions, useCardsState} from '../../../Redux/Reducer/CardsReducer';
import {modalActions} from '../../../Redux/Reducer/ModalsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import UpdateDetails from './UpdateDetails';

/** Modal to display the updated card result and info */
const UpdatingNotification = () => {
  const updatingCards = useCardsState('updatingCards');
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');

  useEffect(() => {
    if (isEmpty(updatingCards)) return;

    const onProgress: GitProgressCallback = (_, id, state, result) => {
      if (!id) return;

      const card = updatingCards.find(value => value.id === id);
      if (!card) return;

      notification.destroy(`${card.devName}-update-error`);

      if (state === 'Failed') {
        notification.error({
          key: `${card.devName}-update-error`,
          description: <div className="whitespace-pre-line">{typeof result === 'string' && result}</div>,
          message: (
            <div className="whitespace-pre-line">
              Failed to Update {card.title} ({card.devName})
            </div>
          ),
        });

        dispatch(cardsActions.removeUpdatingCard(card.id));
      } else if (state === 'Completed' && result) {
        const {
          summary: {changes, insertions, deletions},
        } = result as PullResult;
        notification.success({
          closeIcon: null,
          actions: (
            <div className="flex flex-row gap-x-2">
              <Button
                onPress={() => {
                  if ('summary' in result) {
                    dispatch(
                      modalActions.openUpdateDetails({
                        details: result,
                        title: `${card.title} (${card.devName}) Update Details.`,
                        tabID: activeTab,
                      }),
                    );
                  }
                  notification.destroy(`${card.devName}-updateDetails`);
                }}
                size="sm"
                variant="light"
                color="success">
                Details
              </Button>
              <Button
                onPress={() => {
                  notification.destroy(`${card.devName}-updateDetails`);
                }}
                size="sm"
                color="danger"
                variant="light"
                className="cursor-default">
                Close
              </Button>
            </div>
          ),
          description: (
            <Descriptions
              items={[
                {children: insertions, label: 'Insertions'},
                {children: deletions, label: 'Deletions'},
                {children: changes, label: 'Changes'},
              ]}
              column={2}
              size="small"
            />
          ),
          duration: 0,
          key: `${card.devName}-updateDetails`,
          className: 'dark:bg-foreground-100 !shadow-medium !overflow-hidden rounded-xl',
          message: (
            <span className="font-semibold">
              {card.title} ({card.devName}) Updated Successfully
            </span>
          ),
        });
        dispatch(cardsActions.removeUpdatingCard(card.id));
        dispatch(cardsActions.removeUpdateAvailable(card.id));
      }
    };

    rendererIpc.git.offProgress();
    rendererIpc.git.onProgress(onProgress);

    return () => {
      rendererIpc.git.offProgress();
    };
  }, [updatingCards, dispatch, activeTab]);

  return (
    <>
      <UpdateDetails />
    </>
  );
};

export default UpdatingNotification;
