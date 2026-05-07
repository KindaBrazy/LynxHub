import {UseOverlayStateReturn} from '@heroui/react';
import gitIpc from '@lynx_shared/ipc/git';
import {Documents} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash-es';
import {LucideReplace, Minus, Plus} from 'lucide-react';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {PullResult} from 'simple-git';

import {bottomToast} from '../../../layouts/ToastProviders';
import {cardsActions, useCardsState} from '../../../redux/reducers/cards';
import {AppDispatch} from '../../../redux/store';

/**
 * Hook to listen for git update progress and show notifications.
 */
export function useUpdatingProgress(
  modalState: UseOverlayStateReturn,
  setTitle: (title: string) => void,
  setDetails: (details: PullResult) => void,
) {
  const updatingCards = useCardsState('updatingCards');
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isEmpty(updatingCards)) return;

    const removeListener = gitIpc.onProgress((id, state, progress) => {
      if (!id) return;

      const card = updatingCards.find(value => value.id === id);
      if (!card) return;

      if (state === 'Failed') {
        bottomToast.danger(<span className="whitespace-pre-line">Failed to Update {card.title}</span>, {
          description:
            typeof progress === 'string' ? <span className="whitespace-pre-line">{progress}</span> : undefined,
        });

        dispatch(cardsActions.removeUpdatingCard(card.id));
      } else if (state === 'Completed' && progress) {
        const {
          summary: {changes, insertions, deletions},
        } = progress as PullResult;

        const toastID = bottomToast.success(
          <span className="whitespace-pre-line">{card.title} Updated Successfully.</span>,
          {
            timeout: 0,
            description: (
              <div className="flex gap-x-4 my-4">
                <div className="flex flex-col items-center gap-y-1 bg-surface-secondary rounded-2xl p-2 w-20">
                  <Plus className="size-4 text-success" />
                  <span>{insertions}</span>
                </div>
                <div className="flex flex-col items-center gap-y-1 bg-surface-secondary rounded-2xl p-2 w-20">
                  <Minus className="size-4 text-danger" />
                  <span>{deletions}</span>
                </div>
                <div className="flex flex-col items-center gap-y-1 bg-surface-secondary rounded-2xl p-2 w-20">
                  <LucideReplace className="size-4 text-accent" />
                  <span>{changes}</span>
                </div>
              </div>
            ),
            actionProps: {
              children: (
                <>
                  <Documents size={15} />
                  Details
                </>
              ),
              onPress: () => {
                if ('summary' in progress) {
                  setDetails(progress);
                  setTitle(`${card.title} (${card.devName}) Update Details.`);
                  modalState.open();
                  if (toastID) bottomToast.close(toastID);
                }
              },
            },
          },
        );
        dispatch(cardsActions.removeUpdatingCard(card.id));
        dispatch(cardsActions.removeUpdateAvailable(card.id));
      }
    });

    return () => removeListener();
  }, [updatingCards, dispatch]);
}
