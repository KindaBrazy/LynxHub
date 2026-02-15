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
import LynxScroll from '@lynx/components/LynxScroll';
import {tabsActions} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {AvailablePageIDs, PageID, PageTitles} from '@lynx_common/consts';
import {Notification_Data} from '@lynx_common/types';
import {isValidURL} from '@lynx_common/utils';
import staticsIpc from '@lynx_shared/ipc/statics';
import storageIpc, {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {Bell, SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';
import {CheckRead} from '@solar-icons/react-perf/LineDuotone';
import {Empty} from 'antd';
import {AnimatePresence, motion} from 'framer-motion';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import useStaticNotifications from './StaticNotifications';

export default function Home_Notification() {
  const dispatch = useDispatch<AppDispatch>();
  const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<Notification_Data[]>([]);
  const {staticNotifs, staticNotifCount, haveWarn} = useStaticNotifications();

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Open Notifications`);
    onOpen();
  }, []);

  const filterData = (data: Notification_Data[]) => {
    storageIpc.get('notification').then(({readNotifs}) => {
      setNotifications(data.filter(notif => !readNotifs.includes(notif.id)));
    });
  };

  useEffect(() => {
    staticsIpc.getNotification().then(data => {
      if (data) filterData(data);
    });
    setRefreshing(true);
    staticsIpc.pull().finally(() =>
      staticsIpc
        .getNotification()
        .then(data => {
          if (data) filterData(data);
        })
        .finally(() => setRefreshing(false)),
    );
  }, []);

  const handleRead = (id: string) => {
    storageUtilsIpc.send.addReadNotif(id);
    filterData(notifications);
  };

  const openPage = (destination: AvailablePageIDs | string) => {
    dispatch(
      tabsActions.setActivePage({
        pageID: PageID[destination],
        title: PageTitles[destination],
      }),
    );
  };

  const notifCount = useMemo(() => {
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
        content={notifCount}
        isInvisible={notifCount === 0}
        color={haveWarn ? 'warning' : 'success'}>
        <Button
          className={
            `border border-foreground/10 bg-stone-50 shadow-md ` +
            `dark:border-foreground/5 dark:bg-[#202020] dark:hover:bg-LynxNearBlack`
          }
          radius="full"
          variant="light"
          onPress={onPress}
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
          {refreshing && <Progress size="sm" color="secondary" isIndeterminate />}
          <DrawerHeader className="flex flex-row items-center gap-x-2">
            <Bell className="size-5" />
            <span>Notifications</span>
          </DrawerHeader>

          <DrawerBody as={LynxScroll}>
            <AnimatePresence>
              {notifCount <= 0 ? (
                <Empty className="mt-24" description="No notifications yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <div className="flex flex-col gap-y-2">
                  {notifications.map(notif => {
                    const {buttons, icon, titleColor, title, description} = notif;
                    return (
                      <motion.div
                        key={notif.id}
                        layoutId={notif.id}
                        exit={{x: 300, opacity: 0}}
                        animate={{x: 0, opacity: 1}}
                        initial={{x: 300, opacity: 0}}>
                        <Card
                          className={
                            'bg-foreground-50/70 dark:bg-[#151515] border border-foreground/10' +
                            ' dark:border-foreground/5 rounded-xl hover:border-primary/40' +
                            ' transition-colors'
                          }
                          shadow="sm">
                          <CardHeader className="flex items-center gap-3">
                            <div
                              className={
                                'flex h-8 w-8 items-center justify-center rounded-full' +
                                ' bg-foreground-200/80 dark:bg-[#202020] text-base'
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
                                  titleColor
                                    ? `text-${titleColor} text-sm font-semibold`
                                    : 'text-foreground text-sm font-semibold'
                                }>
                                {title}
                              </span>
                              <Button
                                size="sm"
                                radius="full"
                                variant="light"
                                onPress={() => handleRead(notif.id)}
                                className="h-7 min-w-0 px-2 text-xs text-foreground-500 hover:text-success"
                                isIconOnly>
                                <CheckRead className="size-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardBody className="flex flex-col gap-y-1.5 text-xs leading-relaxed">
                            {description.map((desc, index) => {
                              return (
                                <span
                                  key={`desc_${index}`}
                                  className={desc.color ? `text-${desc.color}` : 'text-foreground'}>
                                  {desc.text}
                                </span>
                              );
                            })}
                          </CardBody>

                          {!isEmpty(buttons) && (
                            <CardFooter className="justify-end pt-1 gap-2">
                              {buttons!.map(btn => {
                                const isUrl = isValidURL(btn.destination);
                                return (
                                  <Button
                                    onPress={() => {
                                      onClose();
                                      if (isUrl) {
                                        window.open(btn.destination);
                                      } else {
                                        openPage(btn.destination);
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
                  })}

                  {...staticNotifs}
                </div>
              )}
            </AnimatePresence>
          </DrawerBody>

          <DrawerFooter className="py-2 justify-start">
            <Button size="sm" variant="light" color="warning" onPress={onClose}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
