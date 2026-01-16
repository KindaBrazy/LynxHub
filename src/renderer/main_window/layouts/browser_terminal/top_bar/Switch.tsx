import {Button} from '@heroui/react';
import {useDispatch} from 'react-redux';

import {Terminal_Icon, Web_Icon} from '../../../../shared/assets/icons';
import {cardsActions} from '../../../redux/reducers/cards';
import {useTabsState} from '../../../redux/reducers/tabs';
import {AppDispatch} from '../../../redux/store';

type Props = {currentView: 'browser' | 'terminal'};
export default function Switch({currentView}: Props) {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

  const onPress = () => {
    dispatch(cardsActions.toggleRunningCardView({tabId: activeTab}));
  };

  return (
    <Button size="sm" variant="light" onPress={onPress} className="cursor-default">
      {currentView === 'browser' ? <Terminal_Icon className="size-4" /> : <Web_Icon className="size-4" />}
    </Button>
  );
}
