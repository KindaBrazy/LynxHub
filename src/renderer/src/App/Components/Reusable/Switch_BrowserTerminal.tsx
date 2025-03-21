import {Button} from '@heroui/react';
import {useDispatch} from 'react-redux';

import {Terminal_Icon, Web_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';
import {cardsActions} from '../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';

type Props = {currentView: 'browser' | 'terminal'};
export default function Switch_BrowserTerminal({currentView}: Props) {
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
