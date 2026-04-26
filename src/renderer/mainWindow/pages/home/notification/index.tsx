import {
  Avatar,
  Badge,
  Button,
  buttonVariants,
  Card,
  Drawer,
  Label,
  Link,
  ProgressBar,
  useOverlayState,
} from '@heroui-v3/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import LynxScroll from '@lynx/components/LynxScroll';
import {tabsActions} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {AvailablePageIDs, PageID, PageTitles} from '@lynx_common/consts';
import {NotificationData} from '@lynx_common/types';
import {getFallbackString, isValidURL} from '@lynx_common/utils';
import staticsIpc from '@lynx_shared/ipc/statics';
import storageIpc, {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {Bell, Notes} from '@solar-icons/react-perf/BoldDuotone';
import {CheckRead, Unread} from '@solar-icons/react-perf/LineDuotone';
import {AnimatePresence, motion} from 'framer-motion';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import useStaticNotifications from './StaticNotifications';

/**
 * Hook to manage notification state and data fetching.
 *
 * @returns An object containing the current notifications, a refreshing flag, and a function to mark notifications as read.
 */
function useNotificationsData() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  /**
   * Filter and set unread notifications based on previously read notification IDs.
   */
  const filterAndSetNotifications = useCallback((data: NotificationData[]) => {
    storageIpc.get('notification').then(({readNotifs}) => {
      setNotifications(data.filter(notif => !readNotifs.includes(notif.id)));
    });
  }, []);

  /**
   * Fetch latest notifications and filter them.
   */
  const fetchAndFilterNotifications = useCallback(async () => {
    const data = await staticsIpc.getNotification();
    if (data) filterAndSetNotifications(data);
  }, [filterAndSetNotifications]);

  useEffect(() => {
    // Initial fetch
    fetchAndFilterNotifications();

    // Pull new static data and then fetch again
    setIsRefreshing(true);
    staticsIpc.pull().finally(() => {
      fetchAndFilterNotifications().finally(() => setIsRefreshing(false));
    });
  }, [fetchAndFilterNotifications]);

  const markAsRead = useCallback(
    (id: string) => {
      storageUtilsIpc.send.addReadNotif(id);
      filterAndSetNotifications(notifications);
    },
    [filterAndSetNotifications, notifications],
  );

  return {
    notifications,
    isRefreshing,
    markAsRead,
  };
}

/**
 * Props for the NotificationItem component.
 */
interface NotificationItemProps {
  /** The notification data object to display. */
  notif: NotificationData;
  /** Callback fired when the user dismisses/reads the notification. */
  onRead: (id: string) => void;
  /** Function to handle navigation to an internal page. */
  onNavigatePage: (destination: AvailablePageIDs | string) => void;
  /** Callback to close the notification drawer, usually after navigating. */
  onCloseDrawer: () => void;
  delay?: number;
}

/**
 * A sub-component rendering a single notification card.
 */
function NotificationItem({notif, onRead, onNavigatePage, onCloseDrawer, delay}: NotificationItemProps) {
  const {buttons, icon, titleColor, title, description} = notif;

  return (
    <motion.div
      className="px-1"
      layoutId={notif.id}
      transition={{delay}}
      animate={{translateY: 0, opacity: 1}}
      initial={{translateY: 30, opacity: 0}}>
      <Card variant="secondary">
        <Card.Header className="flex flex-row items-center gap-3">
          {icon && isValidURL(icon) ? (
            <Avatar>
              <Avatar.Image src={icon} alt={`${title} avatar`} />
              <Avatar.Fallback>{getFallbackString(title)}</Avatar.Fallback>
            </Avatar>
          ) : (
            <Notes className="size-5" />
          )}
          <div className="flex flex-1 items-center justify-between gap-2">
            <span
              className={
                titleColor ? `text-${titleColor} text-sm font-semibold` : 'text-foreground text-sm font-semibold'
              }>
              {title}
            </span>
            <Button size="sm" variant="secondary" onPress={() => onRead(notif.id)} isIconOnly>
              <Unread className="size-4.5" />
            </Button>
          </div>
        </Card.Header>
        <Card.Content className="flex flex-col gap-y-1.5 text-xs leading-relaxed">
          {description.map((desc, index) => (
            <span key={`desc_${index}`} className={desc.color ? `text-${desc.color}` : 'text-foreground'}>
              {desc.text}
            </span>
          ))}
        </Card.Content>

        {!isEmpty(buttons) && (
          <Card.Footer className="justify-end gap-2 pt-1">
            {buttons!.map(btn => {
              const isUrl = isValidURL(btn.destination);

              return (
                <Link
                  className={buttonVariants({
                    variant: btn.color || 'primary',
                    size: 'sm',
                  })}
                  onPress={() => {
                    onCloseDrawer();
                    if (isUrl) {
                      window.open(btn.destination);
                    } else {
                      onNavigatePage(btn.destination);
                    }
                  }}
                  key={btn.title}>
                  {btn.title}
                  {isUrl && <Link.Icon className="size-[0.85rem]" />}
                </Link>
              );
            })}
          </Card.Footer>
        )}
      </Card>
    </motion.div>
  );
}

/**
 * The Home Notification Drawer and Button component.
 * Displays an icon with a badge, and opens a drawer containing all unread notifications.
 */
export default function HomeNotificationDrawer() {
  const dispatch = useDispatch<AppDispatch>();
  const state = useOverlayState();

  const {notifications, isRefreshing, markAsRead} = useNotificationsData();
  const {staticNotifs, staticNotifCount, haveWarn} = useStaticNotifications();

  const handleOpenDrawer = useCallback(() => {
    AddBreadcrumb_Renderer(`Open Notifications`);
    state.open();
  }, []);

  const handleNavigatePage = useCallback(
    (destination: AvailablePageIDs | string) => {
      dispatch(
        tabsActions.setActivePage({
          pageID: PageID[destination],
          title: PageTitles[destination],
        }),
      );
    },
    [dispatch],
  );

  const totalNotificationCount = useMemo(() => {
    return notifications.length + staticNotifCount;
  }, [notifications, staticNotifCount]);

  const readAll = () => notifications.forEach(notif => markAsRead(notif.id));

  return (
    <>
      <Badge.Anchor>
        <Button variant="tertiary" className="shrink-0" onPress={handleOpenDrawer} isIconOnly>
          <Bell />
        </Button>
        {totalNotificationCount !== 0 && (
          <Badge size="sm" placement="top-left" color={haveWarn ? 'warning' : 'success'}>
            {totalNotificationCount}
          </Badge>
        )}
      </Badge.Anchor>
      <Drawer isOpen={state.isOpen} onOpenChange={state.setOpen}>
        <Drawer.Backdrop className="top-10">
          <Drawer.Content placement="right" className="top-10 pb-10">
            <Drawer.Dialog className="w-md px-0">
              {isRefreshing && (
                <ProgressBar size="sm" className="absolute -top-1 inset-x-0" isIndeterminate>
                  <ProgressBar.Track className="rounded-none">
                    <ProgressBar.Fill />
                  </ProgressBar.Track>
                </ProgressBar>
              )}
              <Drawer.Header className="px-6">
                <Drawer.Heading className="flex justify-between">
                  <div className="flex items-center gap-x-1">
                    <Bell className="size-4" />
                    <Label>Notifications</Label>
                  </div>
                  <Button onPress={readAll} variant="secondary" isIconOnly>
                    <CheckRead />
                  </Button>
                </Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body className="pr-2">
                <LynxScroll className="size-full pb-2 pr-3 pl-4">
                  <AnimatePresence>
                    {totalNotificationCount <= 0 ? (
                      <motion.div animate={{translateY: 0, opacity: 1}} initial={{translateY: 30, opacity: 0}}>
                        <EmptyStateCard
                          className="mt-4"
                          variant="secondary"
                          description="No notifications yet!"
                          icon={<Bell size={30} className="text-surface-secondary-foreground" />}
                        />
                      </motion.div>
                    ) : (
                      <div className="flex flex-col gap-y-4 mt-3">
                        {notifications.map((notif, index) => (
                          <NotificationItem
                            notif={notif}
                            key={notif.id}
                            delay={index * 0.1}
                            onRead={markAsRead}
                            onCloseDrawer={state.close}
                            onNavigatePage={handleNavigatePage}
                          />
                        ))}

                        {/* Spread static notifications here */}
                        {...staticNotifs}
                      </div>
                    )}
                  </AnimatePresence>
                </LynxScroll>
              </Drawer.Body>
              <Drawer.Footer className="px-6">
                <Button variant="secondary" onPress={state.close}>
                  Close
                </Button>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}
