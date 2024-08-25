import {Link} from '@nextui-org/react';
import {Descriptions, DescriptionsProps} from 'antd';
import {useMemo} from 'react';

import {useModalsState} from '../../../Redux/AI/ModalsReducer';
import LynxTooltip from '../../Reusable/LynxTooltip';
import {progressElem} from './CardInfo-Modal';

type Props = {
  installDate: string;
  lastUpdate: string;
  releaseTag: string;
};

/** Repository information. */
export default function CardInfoRepo({installDate, lastUpdate, releaseTag}: Props) {
  const url = useModalsState('cardInfoModal').url;

  const releasePage = useMemo(() => {
    return `${url}/releases/tag/${releaseTag}`;
  }, [releaseTag]);

  const repository: DescriptionsProps['items'] = useMemo(
    () => [
      {
        children: installDate ? <span>{installDate}</span> : progressElem(''),
        key: 1,
        label: (
          <LynxTooltip content="Folder Creation Date">
            <span className="transition-opacity duration-500 hover:opacity-80">Installed On</span>
          </LynxTooltip>
        ),
      },
      {
        children: lastUpdate ? <span>{lastUpdate}</span> : progressElem(''),
        key: 2,
        label: (
          <LynxTooltip content="Last Commit Date">
            <span className="transition-opacity duration-500 hover:opacity-80">Last Updated</span>
          </LynxTooltip>
        ),
      },
      {
        children: releaseTag ? <span>{releaseTag}</span> : progressElem(''),
        key: 3,
        label: (
          <LynxTooltip content="Latest Release Tag">
            <span className="transition-opacity duration-500 hover:opacity-80">Update Tag</span>
          </LynxTooltip>
        ),
      },
      {
        children:
          releaseTag === 'No tag found' || releaseTag === '' ? (
            '---'
          ) : (
            <Link
              size="sm"
              href={releasePage}
              color="foreground"
              className="transition-colors duration-300 hover:text-secondary-500"
              isExternal>
              {releasePage}
            </Link>
          ),
        key: 4,
        label: 'Release Notes',
      },
    ],
    [installDate, lastUpdate, releaseTag, releasePage],
  );

  return <Descriptions column={2} size="small" layout="vertical" title="Repository" items={repository} />;
}
