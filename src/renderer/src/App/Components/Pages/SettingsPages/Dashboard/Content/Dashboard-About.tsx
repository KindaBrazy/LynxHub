import {Avatar, Card, Chip} from '@heroui/react';
import {Typography} from 'antd';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {
  APP_BUILD_NUMBER,
  APP_DETAILED_DESCRIPTION,
  APP_ICON_TRANSPARENT,
  APP_NAME,
  APP_VERSION_FORMAT,
  DISCORD_SERVER,
  EMAIL,
  GITHUB_URL,
  LICENSE_NAME,
  LICENSE_PAGE,
  REDDIT_URL,
  X_URL,
  YOUTUBE_URL,
} from '../../../../../../../../cross/CrossConstants';
import {ExternalDuo_Icon} from '../../../../../../../context_menu/Components/SvgIcons';
import {
  CallChat_Icon,
  Copy_Icon,
  DiscordColor_Icon,
  GitHub_Icon,
  Gmail_Icon,
  Info_Icon,
  Reddit_Icon,
  Scales_Icon,
  XSite_Icon,
} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {Youtube_Color_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIconsColor';
import {AppDispatch} from '../../../../../Redux/Store';
import {lynxTopToast} from '../../../../../Utils/UtilHooks';
import SettingsSection from '../../Settings/SettingsPage-ContentSection';

const {Title, Paragraph, Text} = Typography;
export const DashboardAboutId = 'settings_about_elem';

/** Information about application and developer */
export default function DashboardAbout() {
  const dispatch = useDispatch<AppDispatch>();

  const copyText = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    lynxTopToast(dispatch).info(`Copied to clipboard : ${text}`);
  }, []);

  const socialLinks = [
    {
      name: 'Email',
      icon: <Gmail_Icon className="size-6" />,
      action: () => copyText(EMAIL),
      color: '#ea4335',
      actionIcon: <Copy_Icon className="size-4" />,
    },
    {
      name: 'GitHub',
      icon: <GitHub_Icon className="size-6 text-foreground" />,
      action: () => window.open(GITHUB_URL),
      color: '#333',
      actionIcon: <ExternalDuo_Icon className="size-3.5" />,
    },
    {
      name: 'Discord',
      icon: <DiscordColor_Icon className="size-6" />,
      action: () => window.open(DISCORD_SERVER),
      color: '#5865f2',
      actionIcon: <ExternalDuo_Icon className="size-3.5" />,
    },
    {
      name: 'X (Twitter)',
      icon: <XSite_Icon className="size-6 text-foreground" />,
      action: () => window.open(X_URL),
      color: '#000',
      actionIcon: <ExternalDuo_Icon className="size-3.5" />,
    },
    {
      name: 'Reddit',
      icon: <Reddit_Icon className="size-6" />,
      action: () => window.open(REDDIT_URL),
      color: '#ff4500',
      actionIcon: <ExternalDuo_Icon className="size-3.5" />,
    },
    {
      name: 'YouTube',
      icon: <Youtube_Color_Icon className="size-7" />,
      action: () => window.open(YOUTUBE_URL),
      color: '#ff0000',
      actionIcon: <ExternalDuo_Icon className="size-3.5" />,
    },
  ];

  return (
    <SettingsSection title="About" id={DashboardAboutId} icon={<Info_Icon className="size-5" />} itemsCenter>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* App Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-4">
            <Avatar radius="none" src={APP_ICON_TRANSPARENT} className="bg-transparent size-20" />
            <div className="text-left">
              <Title level={2} className="!mb-1 !text-2xl font-bold">
                {APP_NAME}
              </Title>
              <div className="w-52 overflow-hidden flex flex-row flex-wrap gap-2">
                <Chip radius="sm" variant="flat" color="primary">
                  {APP_VERSION_FORMAT}
                </Chip>
                <Chip radius="sm" variant="flat" color="secondary">
                  Build {APP_BUILD_NUMBER}
                </Chip>
                <Chip radius="sm" variant="flat" color="warning">
                  Chromium {window.electron.process.versions.chrome}
                </Chip>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <Paragraph className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
              {APP_DETAILED_DESCRIPTION}
            </Paragraph>
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300">
            <CallChat_Icon className="size-5" />
            <Text className="text-lg font-semibold">Get in Touch</Text>
          </div>

          <div className="flex flex-row flex-wrap gap-4 items-center justify-center">
            {socialLinks.map(link => (
              <Card
                className={
                  'size-32 shrink-0  gap-y-2 flex-col dark:bg-foreground-100 hover:bg-foreground-100 ' +
                  'hover:dark:bg-foreground-200 flex items-center justify-center group'
                }
                key={link.name}
                onPress={link.action}
                isPressable>
                {link.icon}
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">{link.name}</Text>
                <div
                  className={'absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300'}>
                  {link.actionIcon}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* License Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300">
            <Scales_Icon className="size-5" />
            <Text className="text-lg font-semibold">License</Text>
          </div>

          <div className="flex justify-center">
            <Card
              className={
                'size-32 shrink-0  gap-y-2 flex-col dark:bg-foreground-100 hover:bg-foreground-100 ' +
                'hover:dark:bg-foreground-200 flex items-center justify-center group'
              }
              onPress={() => window.open(LICENSE_PAGE)}
              isPressable>
              <Scales_Icon className="size-6 text-green-600 dark:text-green-400" />
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">{LICENSE_NAME}</Text>
              <div
                className={'absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300'}>
                <ExternalDuo_Icon className="size-3.5 text-gray-500" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
