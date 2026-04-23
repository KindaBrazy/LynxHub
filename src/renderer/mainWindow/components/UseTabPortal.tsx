import {ReactNode, useEffect, useState} from 'react';
import {UNSAFE_PortalProvider} from 'react-aria';

import {useTabsState} from '../redux/reducers/tabs';

export default function useTabPortal() {
  const activeTab = useTabsState('activeTab');

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [targetTab, setTargetTab] = useState<string | undefined>(undefined);

  const [targetContainer, setTargetContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTargetContainer(document.getElementById(`${activeTab}_wrapper`));
      setTargetTab(activeTab);
    } else {
      setTargetContainer(null);
      setTargetTab(undefined);
    }
  }, [isOpen]);

  const Wrapper = ({children}: {children: ReactNode}) => {
    if (!targetContainer || activeTab !== targetTab) return null;

    return <UNSAFE_PortalProvider getContainer={() => targetContainer}>{children}</UNSAFE_PortalProvider>;
  };

  return {
    isOpen,
    setIsOpen,
    Wrapper,
  };
}
