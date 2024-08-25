import {Card, Divider, message, Typography} from 'antd';
import {useCallback} from 'react';

import {
  APP_BUILD_NUMBER,
  APP_DETAILED_DESCRIPTION,
  APP_ICON_TRANSPARENT,
  APP_NAME,
  APP_VERSION_V,
  DISCORD_ID,
  EMAIL,
  LICENSE_NAME,
  LICENSE_PAGE,
  PATREON_URL,
} from '../../../../../../../../cross/CrossConstants';
import {getIconByName} from '../../../../../../assets/icons/SvgIconsContainer';
import SettingsSection from '../SettingsPage-ContentSection';

const {Title, Paragraph, Text} = Typography;
export const SettingsAboutId = 'settings_about_elem';

/** Information about application and developer */
export default function SettingsAbout() {
  const copyText = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    message.success(`Copied to clipboard : ${text}`);
  }, []);

  const openLink = useCallback((url: string) => {
    window.open(url);
  }, []);

  return (
    <SettingsSection icon="Info" title="About" id={SettingsAboutId} itemsCenter>
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
              bordered={false}
              onClick={() => copyText(EMAIL)}
              classNames={{body: 'flex flex-row items-center justify-center space-x-2'}}
              hoverable>
              {getIconByName('Gmail', {className: 'size-4'})}
              <span>{EMAIL}</span>
              {getIconByName('Copy')}
            </Card>
            <Card
              size="small"
              bordered={false}
              onClick={() => copyText(DISCORD_ID)}
              classNames={{body: 'flex flex-row items-center justify-center space-x-2'}}
              hoverable>
              {getIconByName('DiscordColor', {className: 'size-4'})}
              <span>{DISCORD_ID}</span>
              {getIconByName('Copy')}
            </Card>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Divider dashed>
            <div className="flex flex-row items-center space-x-1">
              {getIconByName('Heart')}
              <span>Support</span>
            </div>
          </Divider>
          <Card
            size="small"
            bordered={false}
            className="max-w-fit"
            onClick={() => openLink(PATREON_URL)}
            classNames={{body: 'flex flex-row items-center justify-center space-x-2'}}
            hoverable>
            {getIconByName('Patreon', {className: 'size-4'})}
            <span>{APP_NAME}</span>
            {getIconByName('ExternalLink')}
          </Card>
        </div>

        <div className="flex flex-col items-center justify-center">
          <Divider dashed>
            <div className="flex flex-row items-center space-x-1">
              {getIconByName('Scales')}
              <span>License</span>
            </div>
          </Divider>
          <Paragraph>
            <Card
              size="small"
              bordered={false}
              className="max-w-fit"
              onClick={() => openLink(LICENSE_PAGE)}
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
