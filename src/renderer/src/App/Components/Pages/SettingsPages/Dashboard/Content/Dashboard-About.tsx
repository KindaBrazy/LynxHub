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
  GITHUB_URL,
  LICENSE_NAME,
  LICENSE_PAGE,
  REDDIT_URL,
  X_URL,
  YOUTUBE_URL,
} from '../../../../../../../../cross/CrossConstants';
import {Copy_Icon, ExternalLink_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons1';
import {GitHub_Icon, Info_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons2';
import {CallChat_Icon, Scales_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons3';
import {
  DiscordColor_Icon,
  Gmail_Icon,
  Reddit_Icon,
  XSite_Icon,
} from '../../../../../../assets/icons/SvgIcons/SvgIcons4';
import {Youtube_Color_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIconsColor';
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
    <SettingsSection title="About" id={DashboardAboutId} icon={<Info_Icon className="size-5" />} itemsCenter>
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
              <CallChat_Icon />
              <span>Contact</span>
            </div>
          </Divider>
          <div className="flex flex-row flex-wrap items-center justify-center gap-2">
            <Card
              size="small"
              onClick={() => copyText(EMAIL)}
              classNames={{body: 'flex flex-row items-center justify-center space-x-2'}}
              hoverable>
              <Gmail_Icon className="size-4" />
              <span>Gmail</span>
              <Copy_Icon />
            </Card>
            <Card
              size="small"
              onClick={() => window.open(GITHUB_URL)}
              classNames={{body: 'flex flex-row items-center justify-center space-x-2'}}
              hoverable>
              <GitHub_Icon className="size-4" />
              <span>GitHub</span>
              <ExternalLink_Icon />
            </Card>
            <Card
              size="small"
              onClick={() => window.open(DISCORD_SERVER)}
              classNames={{body: 'flex flex-row items-center justify-center space-x-2'}}
              hoverable>
              <DiscordColor_Icon className="size-4" />
              <span>Discord</span>
              <ExternalLink_Icon />
            </Card>
            <Card
              size="small"
              onClick={() => window.open(X_URL)}
              classNames={{body: 'flex flex-row items-center justify-center space-x-2'}}
              hoverable>
              <XSite_Icon className="size-4" />
              <span>Twitter</span>
              <ExternalLink_Icon />
            </Card>
            <Card
              size="small"
              onClick={() => window.open(REDDIT_URL)}
              classNames={{body: 'flex flex-row items-center justify-center space-x-2'}}
              hoverable>
              <Reddit_Icon className="size-4" />
              <span>Reddit</span>
              <ExternalLink_Icon />
            </Card>
            <Card
              size="small"
              onClick={() => window.open(YOUTUBE_URL)}
              classNames={{body: 'flex flex-row items-center justify-center space-x-2'}}
              hoverable>
              <Youtube_Color_Icon className="size-4" />
              <span>YouTube</span>
              <ExternalLink_Icon />
            </Card>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Divider dashed>
            <div className="flex items-center">
              <Scales_Icon />
              <span>License</span>
            </div>
          </Divider>
          <Card
            size="small"
            className="w-full"
            onClick={() => window.open(LICENSE_PAGE)}
            classNames={{body: 'flex flex-row items-center justify-center space-x-2'}}
            hoverable>
            <span>{LICENSE_NAME}</span>
            <ExternalLink_Icon />
          </Card>
        </div>
      </div>
    </SettingsSection>
  );
}
