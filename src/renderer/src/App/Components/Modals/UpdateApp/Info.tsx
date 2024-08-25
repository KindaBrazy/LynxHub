import {Button, Card, Collapse, CollapseProps, Descriptions, Empty, Typography} from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import {isEmpty} from 'lodash';

import {APP_BUILD_NUMBER, APP_VERSION, RELEASES_PAGE} from '../../../../../../cross/CrossConstants';
import {AppUpdateInfo} from '../../../../../../cross/CrossTypes';
import {getIconByName} from '../../../../assets/icons/SvgIconsContainer';

type Props = {items: CollapseProps['items']; updateInfo: AppUpdateInfo | undefined};

/** Information and release notes about update  */
export default function Info({updateInfo, items}: Props) {
  return (
    <>
      <Descriptions size="small" layout="vertical" className="w-full text-center" bordered>
        <DescriptionsItem label="Version">
          <Typography.Text code>
            <span className="font-JetBrainsMono">{APP_VERSION}</span>
            <span className="font-JetBrainsMono text-foreground-300">{' -> '}</span>
            <span className="font-JetBrainsMono text-success">{updateInfo?.currentVersion}</span>
          </Typography.Text>
        </DescriptionsItem>
        <DescriptionsItem label="Build Number">
          <Typography.Text code>
            <span className="font-JetBrainsMono">{APP_BUILD_NUMBER}</span>
            <span className="font-JetBrainsMono text-foreground-300">{' -> '}</span>
            <span className="font-JetBrainsMono text-success">{updateInfo?.currentBuild}</span>
          </Typography.Text>
        </DescriptionsItem>
        <DescriptionsItem label="Release Date">
          <Typography.Text className="text-success" code>
            <span className="font-JetBrainsMono">{updateInfo?.releaseDate}</span>
          </Typography.Text>
        </DescriptionsItem>
      </Descriptions>
      <Card
        size="small"
        bordered={false}
        title="Release Notes"
        classNames={{title: 'text-center'}}
        className="mt-2 flex w-full cursor-default flex-col justify-center"
        hoverable>
        {isEmpty(items) ? (
          <>
            <Empty description="No notes found 😔" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            <Button
              onClick={() => {
                window.open(RELEASES_PAGE);
              }}
              type="link"
              iconPosition="end"
              icon={getIconByName('ExternalLink')}
              block>
              Releases Page
            </Button>
          </>
        ) : (
          <Collapse size="small" items={items} defaultActiveKey={['0']} className="font-JetBrainsMono" />
        )}
      </Card>
    </>
  );
}
