import {useMemo} from 'react';

import {extensionsData} from '../../../../../plugins/extensions/loader';
import {CommonProps} from '../../about/types';
import LaunchConfig from './LaunchConfig';

const LaunchConfigModal = ({state}: CommonProps) => {
  const LaunchConfigExt = useMemo(() => extensionsData.replaceModals.launchConfig, []);

  if (!state.isOpen) return null;

  return LaunchConfigExt ? <LaunchConfigExt /> : <LaunchConfig state={state} />;
};

export default LaunchConfigModal;
