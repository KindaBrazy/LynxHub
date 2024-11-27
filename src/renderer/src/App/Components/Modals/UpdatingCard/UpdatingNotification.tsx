import {Button} from '@nextui-org/react';
import {Descriptions, notification} from 'antd';
import {isEmpty} from 'lodash';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {PullResult} from 'simple-git';

import {GitProgressCallback} from '../../../../../../cross/IpcChannelAndTypes';
import {cardsActions, useCardsState} from '../../../Redux/AI/CardsReducer';
import {modalActions} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import UpdateDetails from './UpdateDetails';

/** Modal to display the updated card result and info */
const UpdatingNotification = () => {
  const updatingCards = useCardsState('updatingCards');
  const dispatch = useDispatch<AppDispatch>();

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
          btn: (
            <>
              <Button
                onPress={() => {
                  if ('summary' in result) {
                    dispatch(
                      modalActions.openUpdateDetails({
                        details: result,
                        title: `${card.title} (${card.devName}) Update Details.`,
                      }),
                    );
                  }
                  notification.destroy(`${card.devName}-updateDetails`);
                }}
                variant="light"
                color="success"
                className="cursor-default">
                Details
              </Button>
              <Button
                onPress={() => {
                  notification.destroy(`${card.devName}-updateDetails`);
                }}
                color="danger"
                variant="light"
                className="cursor-default">
                Close
              </Button>
            </>
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
          key: `${card.devName}-updateDetails`,
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
  }, [updatingCards, dispatch]);

  return (
    <>
      <UpdateDetails />
    </>
  );
};

export default UpdatingNotification;
