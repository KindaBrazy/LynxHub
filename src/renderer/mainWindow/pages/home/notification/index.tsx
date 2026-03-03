import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Image,
  Progress,
  useDisclosure,
} from '@heroui/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import LynxScroll from '@lynx/components/LynxScroll';
import {tabsActions} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {AvailablePageIDs, PageID, PageTitles} from '@lynx_common/consts';
import {NotificationData} from '@lynx_common/types';
import {isValidURL} from '@lynx_common/utils';
import staticsIpc from '@lynx_shared/ipc/statics';
import storageIpc, {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {Bell, SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';
import {CheckRead} from '@solar-icons/react-perf/LineDuotone';
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
}

/**
 * A sub-component rendering a single notification card.
 */
function NotificationItem({notif, onRead, onNavigatePage, onCloseDrawer}: NotificationItemProps) {
  const {buttons, icon, titleColor, title, description} = notif;

  return (
    <motion.div
      layoutId={notif.id}
      exit={{x: 300, opacity: 0}}
      animate={{x: 0, opacity: 1}}
      initial={{x: 300, opacity: 0}}>
      <Card
        className={
          'bg-foreground-50/70 border-foreground/10 hover:border-primary/40 rounded-xl border transition-colors ' +
          'dark:border-foreground/5 dark:bg-[#151515]'
        }
        shadow="sm">
        <CardHeader className="flex items-center gap-3">
          <div
            className={
              'bg-foreground-200/80 flex h-8 w-8 items-center justify-center rounded-full text-base dark:bg-[#202020]'
            }>
            {icon && isValidURL(icon) ? (
              <Image src={icon} height={20} radius="none" alt="Notification Icon" />
            ) : (
              <span>{icon}</span>
            )}
          </div>
          <div className="flex flex-1 items-center justify-between gap-2">
            <span
              className={
                titleColor ? `text-${titleColor} text-sm font-semibold` : 'text-foreground text-sm font-semibold'
              }>
              {title}
            </span>
            <Button
              size="sm"
              radius="full"
              variant="light"
              onPress={() => onRead(notif.id)}
              className="hover:text-success text-foreground-500 h-7 min-w-0 px-2 text-xs"
              isIconOnly>
              <CheckRead className="size-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-y-1.5 text-xs leading-relaxed">
          {description.map((desc, index) => (
            <span key={`desc_${index}`} className={desc.color ? `text-${desc.color}` : 'text-foreground'}>
              {desc.text}
            </span>
          ))}
        </CardBody>

        {!isEmpty(buttons) && (
          <CardFooter className="justify-end gap-2 pt-1">
            {buttons!.map(btn => {
              const isUrl = isValidURL(btn.destination);
              return (
                <Button
                  onPress={() => {
                    onCloseDrawer();
                    if (isUrl) {
                      window.open(btn.destination);
                    } else {
                      onNavigatePage(btn.destination);
                    }
                  }}
                  size="sm"
                  variant="flat"
                  key={btn.title}
                  className="text-xs"
                  color={btn.color || 'default'}
                  endContent={isUrl ? <SquareTopDown className="size-[0.85rem]" /> : undefined}>
                  {btn.title}
                </Button>
              );
            })}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}

/**
 * The Home Notification Drawer and Button component.
 * Displays an icon with a badge, and opens a drawer containing all unread notifications.
 *
 * @returns {JSX.Element} The rendered notification drawer and trigger button.
 */
export default function HomeNotificationDrawer() {
  const dispatch = useDispatch<AppDispatch>();
  const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure();

  const {notifications, isRefreshing, markAsRead} = useNotificationsData();
  const {staticNotifs, staticNotifCount, haveWarn} = useStaticNotifications();

  const handleOpenDrawer = useCallback(() => {
    AddBreadcrumb_Renderer(`Open Notifications`);
    onOpen();
  }, [onOpen]);

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

  return (
    <>
      <Badge
        size="sm"
        shape="circle"
        variant="solid"
        showOutline={false}
        placement="top-left"
        content={totalNotificationCount}
        color={haveWarn ? 'warning' : 'success'}
        isInvisible={totalNotificationCount === 0}>
        <Button
          className={
            'border-foreground/10 bg-stone-50 border shadow-md ' +
            'dark:border-foreground/5 dark:bg-[#202020] dark:hover:bg-LynxNearBlack'
          }
          radius="full"
          variant="light"
          onPress={handleOpenDrawer}
          isIconOnly>
          <Bell className="size-4" />
        </Button>
      </Badge>
      <Drawer
        motionProps={{
          variants: {
            enter: {
              x: 0,
              opacity: 1,
            },
            exit: {
              x: 50,
              opacity: 0,
            },
          },
        }}
        isOpen={isOpen}
        className="mb-14!"
        onOpenChange={onOpenChange}
        classNames={{backdrop: 'mt-10', wrapper: 'mt-12'}}
        hideCloseButton>
        <DrawerContent className="dark:bg-LynxRaisinBlack">
          {isRefreshing && <Progress size="sm" color="secondary" isIndeterminate />}
          <DrawerHeader className="flex flex-row items-center gap-x-2">
            <Bell className="size-5" />
            <span>Notifications</span>
          </DrawerHeader>

          <DrawerBody as={LynxScroll}>
            <AnimatePresence>
              {totalNotificationCount <= 0 ? (
                <EmptyStateCard
                  description="No notifications yet"
                  className="mt-24 dark:bg-foreground-50/30"
                  icon={<Bell className="size-8 text-foreground-400" />}
                />
              ) : (
                <div className="flex flex-col gap-y-2">
                  {notifications.map(notif => (
                    <NotificationItem
                      notif={notif}
                      key={notif.id}
                      onRead={markAsRead}
                      onCloseDrawer={onClose}
                      onNavigatePage={handleNavigatePage}
                    />
                  ))}

                  {/* Spread static notifications here */}
                  {...staticNotifs}
                </div>
              )}
            </AnimatePresence>
          </DrawerBody>

          <DrawerFooter className="justify-start p-3">
            <Button variant="light" color="warning" onPress={onClose}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
