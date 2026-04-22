import {addToast, Button, closeToast} from '@heroui/react';
import gitIpc from '@lynx_shared/ipc/git';
import {Documents} from '@solar-icons/react-perf/BoldDuotone';
import {CheckRead} from '@solar-icons/react-perf/LineDuotone';
import {isEmpty} from 'lodash';
import {LucideReplace, Minus, Plus} from 'lucide-react';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {PullResult} from 'simple-git';

import {cardsActions, useCardsState} from '../../../../../redux/reducers/cards';
import {modalActions} from '../../../../../redux/reducers/modals';
import {useTabsState} from '../../../../../redux/reducers/tabs';
import {AppDispatch} from '../../../../../redux/store';
import DescriptionGrid from '../../../../DescriptionGrid';

/**
 * Hook to listen for git update progress and show notifications.
 */
export function useUpdatingProgress() {
  const updatingCards = useCardsState('updatingCards');
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');

  useEffect(() => {
    if (isEmpty(updatingCards)) return;

    const removeListener = gitIpc.onProgress((id, state, progress) => {
      if (!id) return;

      const card = updatingCards.find(value => value.id === id);
      if (!card) return;

      if (state === 'Failed') {
        addToast({
          color: 'danger',
          classNames: {
            base: `right-3 bottom-3 gap-y-2 cursor-default`,
          },
          title: <span className="whitespace-pre-line">Failed to Update {card.title}</span>,
          description:
            typeof progress === 'string' ? <span className="whitespace-pre-line">{progress}</span> : undefined,
        });

        dispatch(cardsActions.removeUpdatingCard(card.id));
      } else if (state === 'Completed' && progress) {
        const {
          summary: {changes, insertions, deletions},
        } = progress as PullResult;
        const toastID = addToast({
          color: 'success',
          classNames: {
            base: `right-3 bottom-3 cursor-default`,
            description: 'size-full',
          },
          title: (
            <div className="flex items-center gap-x-2">
              <CheckRead size={25} />
              <span className="whitespace-pre-line">{card.title} Updated Successfully.</span>
            </div>
          ),
          timeout: 0,
          shouldShowTimeoutProgress: true,
          hideIcon: true,
          description: (
            <div className="flex flex-col items-start">
              <DescriptionGrid
                items={[
                  {
                    key: 'Insertions',
                    label: (
                      <div className="flex flex-col items-center gap-y-1">
                        <Plus className="size-4 text-success" />
                        <span>{insertions}</span>
                      </div>
                    ),
                    content: 2,
                  },
                  {
                    key: 'Deletions',
                    label: (
                      <div className="flex flex-col items-center gap-y-1">
                        <Minus className="size-4 text-danger" />
                        <span>{deletions}</span>
                      </div>
                    ),
                    content: 50,
                  },
                  {
                    key: 'Changes',
                    label: (
                      <div className="flex flex-col items-center gap-y-1">
                        <LucideReplace className="size-4 text-primary" />
                        <span>{changes}</span>
                      </div>
                    ),
                    content: 360,
                  },
                ]}
                columns={3}
                className="shadow-none w-full bg-transparent"
                itemClassName="bg-white dark:bg-LynxNearBlack text-center"
              />
              <Button
                onPress={() => {
                  if ('summary' in progress) {
                    dispatch(
                      modalActions.openUpdateDetails({
                        details: progress,
                        title: `${card.title} (${card.devName}) Update Details.`,
                        tabID: activeTab,
                      }),
                    );
                    if (toastID) closeToast(toastID);
                  }
                }}
                variant="flat"
                color="success"
                startContent={<Documents size={15} />}
                fullWidth>
                Details
              </Button>
            </div>
          ),
        });
        dispatch(cardsActions.removeUpdatingCard(card.id));
        dispatch(cardsActions.removeUpdateAvailable(card.id));
      }
    });

    return () => removeListener();
  }, [updatingCards, dispatch, activeTab]);
}
