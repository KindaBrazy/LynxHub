import {Avatar, Card, Chip} from '@heroui/react';
import SettingsSection from '@lynx/components/SettingsSection';
import {AppDispatch} from '@lynx/redux/store';
import {lynxTopToast} from '@lynx/utils/hooks';
import {DiscordColor_Icon, GitHub_Icon, Gmail_Icon, Reddit_Icon, Scales_Icon, XSite_Icon} from '@lynx_assets/icons';
import {Youtube_Color_Icon} from '@lynx_assets/icons/Icons_Colorful';
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
} from '@lynx_common/consts';
import {Copy, InfoSquare, SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useCallback} from 'react';
import {useDispatch} from 'react-redux';

export const DashboardAboutId = 'settings_about_elem';

/** Information about application and developer */
const DashboardAbout = memo(() => {
  const dispatch = useDispatch<AppDispatch>();

  const copyText = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      lynxTopToast(dispatch).info(`Copied to clipboard: ${text}`);
    },
    [dispatch],
  );

  const socialLinks = [
    {
      name: 'Email',
      icon: <Gmail_Icon className="size-5" />,
      action: () => copyText(EMAIL),
      actionIcon: <Copy className="size-3.5" />,
    },
    {
      name: 'GitHub',
      icon: <GitHub_Icon className="size-5" />,
      action: () => window.open(GITHUB_URL),
      actionIcon: <SquareTopDown className="size-3.5" />,
    },
    {
      name: 'Discord',
      icon: <DiscordColor_Icon className="size-5" />,
      action: () => window.open(DISCORD_SERVER),
      actionIcon: <SquareTopDown className="size-3.5" />,
    },
    {
      name: 'X',
      icon: <XSite_Icon className="size-5" />,
      action: () => window.open(X_URL),
      actionIcon: <SquareTopDown className="size-3.5" />,
    },
    {
      name: 'Reddit',
      icon: <Reddit_Icon className="size-5" />,
      action: () => window.open(REDDIT_URL),
      actionIcon: <SquareTopDown className="size-3.5" />,
    },
    {
      name: 'YouTube',
      icon: <Youtube_Color_Icon className="size-5" />,
      action: () => window.open(YOUTUBE_URL),
      actionIcon: <SquareTopDown className="size-3.5" />,
    },
  ];

  return (
    <SettingsSection title="About" id={DashboardAboutId} icon={<InfoSquare className="size-5" />} itemsCenter>
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* App Info Card */}
        <Card className="overflow-hidden border-none bg-transparent shadow-none">
          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar radius="lg" src={APP_ICON_TRANSPARENT} className="bg-transparent size-24 p-1" />

            <div className="text-center space-y-3">
              <h1 className="text-2xl font-bold">{APP_NAME}</h1>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <Chip size="sm" variant="flat" color="success" classNames={{content: 'font-medium text-xs'}}>
                  {APP_VERSION_FORMAT}
                </Chip>
                <Chip size="sm" variant="flat" classNames={{content: 'font-medium text-xs'}}>
                  Build {APP_BUILD_NUMBER}
                </Chip>
                <Chip size="sm" variant="flat" color="warning" classNames={{content: 'font-medium text-xs'}}>
                  Chromium {window.electron.process.versions.chrome}
                </Chip>
              </div>

              <p className="text-sm text-foreground-500 max-w-xl leading-relaxed">{APP_DETAILED_DESCRIPTION}</p>
            </div>
          </div>
        </Card>

        {/* Social Links */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground-500 text-center uppercase tracking-wider">Connect</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {socialLinks.map(link => (
              <Card
                className={
                  'group flex flex-row items-center gap-2 px-4 py-2.5 bg-foreground-100/50' +
                  ' hover:bg-foreground-200 transition-colors cursor-pointer'
                }
                shadow="none"
                key={link.name}
                onPress={link.action}
                isPressable>
                {link.icon}
                <span className="text-sm font-medium">{link.name}</span>
                <span className="opacity-0 group-hover:opacity-60 transition-opacity">{link.actionIcon}</span>
              </Card>
            ))}
          </div>
        </div>

        {/* License */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground-500 text-center uppercase tracking-wider">License</h2>
          <Card
            className={
              'group flex flex-row items-center justify-center gap-3 px-6 py-4 mx-auto w-fit' +
              ' bg-foreground-100/50 hover:bg-foreground-200 transition-colors cursor-pointer'
            }
            shadow="none"
            onPress={() => window.open(LICENSE_PAGE)}
            isPressable>
            <Scales_Icon className="size-5 text-success" />
            <span className="font-medium">{LICENSE_NAME}</span>
            <SquareTopDown className="size-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
          </Card>
        </div>
      </div>
    </SettingsSection>
  );
});

DashboardAbout.displayName = 'DashboardAbout';

export default DashboardAbout;
