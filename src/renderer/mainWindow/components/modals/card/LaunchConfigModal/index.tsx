import {Fragment, useMemo} from 'react';

import {extensionsData} from '../../../../plugins/extensions/loader';
import {useModalsState} from '../../../../redux/reducers/modals';
import LaunchConfig from './LaunchConfig';

const LaunchConfigModal = () => {
  const LaunchConfigExt = useMemo(() => extensionsData.replaceModals.launchConfig, []);

  const cardLaunchConfig = useModalsState('cardLaunchConfig');

  return (
    <>
      {cardLaunchConfig.map(modal => (
        <Fragment key={`${modal.tabID}_modal`}>
          {LaunchConfigExt ? <LaunchConfigExt /> : <LaunchConfig {...modal} />}
        </Fragment>
      ))}
    </>
  );
};

export default LaunchConfigModal;
