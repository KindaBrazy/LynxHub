import {useMemo} from 'react';
import {Outlet} from 'react-router';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useCardsState} from '../../Redux/AI/CardsReducer';
import RunningCardView from '../RunningCardView/RunningCardView';

export default function AppPages() {
  const {isRunning} = useCardsState('runningCard');
  const Container = useMemo(() => extensionsData.runningAI.container, []);

  return isRunning ? Container ? <Container /> : <RunningCardView /> : <Outlet />;
}
