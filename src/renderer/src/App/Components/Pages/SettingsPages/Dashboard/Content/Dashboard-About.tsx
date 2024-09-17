import {Card, Divider, message, Typography} from 'antd';
import {useCallback} from 'react';

import {
  APP_BUILD_NUMBER,
  APP_DETAILED_DESCRIPTION,
  APP_ICON_TRANSPARENT,
  APP_NAME,
  APP_VERSION_V,
  DISCORD_SERVER,
  EMAIL,
  LICENSE_NAME,
  LICENSE_PAGE,
} from '../../../../../../../../cross/CrossConstants';
import {getIconByName} from '../../../../../../assets/icons/SvgIconsContainer';
import SettingsSection from '../../Settings/SettingsPage-ContentSection';

const {Title, Paragraph, Text} = Typography;
export const DashboardAboutId = 'settings_about_elem';

/** Information about application and developer */
export default function DashboardAbout() {
  const copyText = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    message.success(`Copied to clipboard : ${text}`);
  }, []);

  return (
    <SettingsSection icon="Info" title="About" id={DashboardAboutId} itemsCenter>
      <div className="flex flex-col space-y-3">
        <div>
          <Title level={4} className="flex flex-row items-center justify-center space-x-3">
            <img alt="App Icon" className="size-6" src={APP_ICON_TRANSPARENT} />
            <span>{APP_NAME}</span>
            <Text code>{APP_VERSION_V}</Text>
            <Text className="!mx-0" code>
              Build:{APP_BUILD_NUMBER}
            </Text>
          </Title>
          <Paragraph className="mt-6">{APP_DETAILED_DESCRIPTION}</Paragraph>
        </div>

        <div>
          <Divider dashed>
            <div className="flex flex-row items-center space-x-1">
              {getIconByName('CallChat')}
              <span>Contact</span>
            </div>
          </Divider>
          <div className="flex flex-row items-center justify-center space-x-2">
            <Card
              size="small"
              onClick={() => copyText(EMAIL)}
              classNames={{body: 'flex flex-row items-center justify-center space-x-2'}}
              hoverable>
              {getIconByName('Gmail', {className: 'size-4'})}
              <span>{EMAIL}</span>
              {getIconByName('Copy')}
            </Card>
            <Card
              size="small"
              onClick={() => window.open(DISCORD_SERVER)}
              classNames={{body: 'flex flex-row items-center justify-center space-x-2'}}
              hoverable>
              {getIconByName('DiscordColor', {className: 'size-4'})}
              <span>Discord Server</span>
              {getIconByName('ExternalLink')}
            </Card>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <Divider dashed>
            <div className="flex items-center">
              {getIconByName('Scales')}
              <span>License</span>
            </div>
          </Divider>
          <Paragraph>
            <Card
              size="small"
              onClick={() => window.open(LICENSE_PAGE)}
              classNames={{body: 'flex flex-row items-center justify-center space-x-2'}}
              hoverable>
              <span>{LICENSE_NAME}</span>
              {getIconByName('ExternalLink')}
            </Card>
          </Paragraph>
        </div>
      </div>
    </SettingsSection>
  );
}
