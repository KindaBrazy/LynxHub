import {Link} from '@nextui-org/react';
import {Descriptions, DescriptionsProps} from 'antd';
import {useMemo} from 'react';

import {useModalsState} from '../../../Redux/AI/ModalsReducer';
import {getDeveloperProfileUrl} from '../../../Utils/UtilFunctions';

/** Repository developer information */
export default function CardInfoDev() {
  const {devName, url} = useModalsState('cardInfoModal');

  const developer: DescriptionsProps['items'] = useMemo(
    () => [
      {children: <span>{devName}</span>, key: 1, label: 'Name'},
      {
        children: (
          <Link
            size="sm"
            color="foreground"
            href={getDeveloperProfileUrl(url)}
            className="transition-colors duration-300 hover:text-secondary-500"
            isExternal
            showAnchorIcon>
            {getDeveloperProfileUrl(url)}
          </Link>
        ),
        key: 2,
        label: 'GitHub Profile',
      },
    ],
    [devName, url],
  );

  return <Descriptions size="small" title="Developer" items={developer} layout="vertical" />;
}
