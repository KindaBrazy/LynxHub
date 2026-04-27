import {useMemo} from 'react';

import {extensionsData} from '../../../../../plugins/extensions/loader';
import {CommonProps} from '../../about/types';
import LaunchConfig from './LaunchConfig';

const LaunchConfigModal = (props: CommonProps) => {
  const LaunchConfigExt = useMemo(() => extensionsData.replaceModals.launchConfig, []);

  return LaunchConfigExt ? <LaunchConfigExt /> : <LaunchConfig {...props} />;
};

export default LaunchConfigModal;
