import {Link} from '@nextui-org/react';
import {Descriptions, DescriptionsProps} from 'antd';
import {isEmpty} from 'lodash';
import {useMemo} from 'react';

import {GitHub_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons2';
import {useModalsState} from '../../../Redux/AI/ModalsReducer';
import LynxTooltip from '../../Reusable/LynxTooltip';

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

  const repository: DescriptionsProps['items'] = useMemo(() => {
    const result: DescriptionsProps['items'] = [];

    if (!isEmpty(installDate)) {
      result.push({
        children: <span>{installDate}</span>,
        key: 1,
        label: (
          <LynxTooltip content="Folder Creation Date">
            <span className="transition-opacity duration-500 hover:opacity-80">Installed On</span>
          </LynxTooltip>
        ),
      });
    }

    if (!isEmpty(lastUpdate)) {
      result.push({
        children: <span>{lastUpdate}</span>,
        key: 2,
        label: (
          <LynxTooltip content="Last Commit Date">
            <span className="transition-opacity duration-500 hover:opacity-80">Last Updated</span>
          </LynxTooltip>
        ),
      });
    }

    if (!isEmpty(releaseTag)) {
      result.push({
        children: <span>{releaseTag}</span>,
        key: 3,
        label: (
          <LynxTooltip content="Latest Release Tag">
            <span className="transition-opacity duration-500 hover:opacity-80">Update Tag</span>
          </LynxTooltip>
        ),
      });
    }

    if (!isEmpty(releaseTag) && releaseTag !== 'No tag found') {
      result.push({
        children: (
          <Link
            size="sm"
            href={releasePage}
            color="foreground"
            className="transition-colors duration-300 hover:text-primary"
            isExternal>
            {releasePage}
          </Link>
        ),
        key: 4,
        label: 'Release Notes',
      });
    }

    return result;
  }, [installDate, lastUpdate, releaseTag, releasePage]);

  return (
    <Descriptions
      title={
        <div className="flex flex-row items-center gap-x-2">
          <div>{<GitHub_Icon />}</div>
          <span>Repository</span>
        </div>
      }
      column={2}
      size="small"
      layout="vertical"
      items={repository}
    />
  );
}
