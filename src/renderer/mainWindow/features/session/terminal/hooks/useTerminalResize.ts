import {XTermAPI} from '@lynx/components/XTermCore';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {RefObject, useEffect} from 'react';

export function useTerminalResize(xtermRef: RefObject<XTermAPI | null>, currentView: string) {
  const activeTab = useTabsState('activeTab');

  useEffect(() => {
    if (currentView === 'terminal') {
      xtermRef.current?.fit();
    }
  }, [currentView, activeTab, xtermRef]);
}
