import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Image,
  Progress,
  useDisclosure,
} from '@heroui/react';
import {Empty} from 'antd';
import {AnimatePresence, motion} from 'framer-motion';
import {isEmpty} from 'lodash';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Notification_Data} from '../../../../../../../../cross/CrossTypes';
import {isDev, isValidURL} from '../../../../../../../../cross/CrossUtils';
import {ExternalDuo_Icon} from '../../../../../../../context_menu/Components/SvgIcons';
import {BellDuo_Icon, CheckDuo_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {tabsActions} from '../../../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {PageID, PageTitles} from '../../../../../Utils/Constants';
import LynxScroll from '../../../../Reusable/LynxScroll';

export default function Home_Notification() {
  const dispatch = useDispatch<AppDispatch>();
  const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<Notification_Data[]>([]);

  const filterData = (data: Notification_Data[]) => {
    rendererIpc.storage.get('notification').then(({readNotifs}) => {
      setNotifications(data.filter(notif => !readNotifs.includes(notif.id)));
    });
  };

  useEffect(() => {
    if (isDev()) {
      import('../../../../../../../../../notifications.json').then(result => {
        filterData(result.default as Notification_Data[]);
      });
    } else {
      rendererIpc.statics.getNotification().then(data => {
        filterData(data);
      });
      setRefreshing(true);
      rendererIpc.statics
        .pull()
        .finally(() => rendererIpc.statics.getNotification().finally(() => setRefreshing(false)));
    }
  }, []);

  const handleRead = (id: string) => {
    rendererIpc.storageUtils.addReadNotif(id);
    filterData(notifications);
  };

  const openPage = (destination: 'modules' | 'extensions' | 'dashboard' | 'settings' | string) => {
    dispatch(
      tabsActions.setActivePage({
        pageID: PageID[destination],
        title: PageTitles[destination],
      }),
    );
  };

  return (
    <>
      <Badge
        size="sm"
        shape="circle"
        variant="solid"
        color="success"
        showOutline={false}
        placement="top-left"
        content={notifications.length}
        isInvisible={notifications.length === 0}>
        <Button
          className={
            `cursor-default border border-foreground/10 bg-stone-50 shadow-md ` +
            `dark:border-foreground/5 dark:bg-[#2a2a2a] dark:hover:bg-[#212121]`
          }
          radius="full"
          variant="light"
          onPress={onOpen}
          isIconOnly>
          <BellDuo_Icon />
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
        size="sm"
        isOpen={isOpen}
        className="!mb-14"
        onOpenChange={onOpenChange}
        classNames={{backdrop: 'mt-10', wrapper: 'mt-12'}}
        hideCloseButton>
        <DrawerContent className="dark:bg-LynxRaisinBlack">
          {refreshing && <Progress size="sm" color="secondary" isIndeterminate />}
          <DrawerHeader className="flex flex-row items-center gap-x-2">
            <BellDuo_Icon className="size-5" />
            <span>Notifications</span>
          </DrawerHeader>

          <DrawerBody as={LynxScroll}>
            <AnimatePresence>
              {isEmpty(notifications) ? (
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
                        <Card shadow="none" className="dark:bg-blck/40 bg-foreground-100">
                          <CardHeader className="justify-between">
                            {icon && isValidURL(icon) ? (
                              <Image src={icon} height={20} radius="none" alt="Notification Icon" />
                            ) : (
                              <span>{icon}</span>
                            )}
                            <span className={titleColor ? `text-${titleColor}` : 'text-foreground'}>{title}</span>
                            <Button size="sm" variant="light" onPress={() => handleRead(notif.id)} isIconOnly>
                              <CheckDuo_Icon />
                            </Button>
                          </CardHeader>
                          <Divider />
                          <CardBody className="flex flex-col gap-y-2">
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
                            <CardFooter className="justify-end">
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
                                    variant="flat"
                                    key={btn.title}
                                    endContent={isUrl ? <ExternalDuo_Icon className="size-[0.85rem]" /> : undefined}>
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
                </div>
              )}
            </AnimatePresence>
          </DrawerBody>

          <DrawerFooter className="py-2">
            <Button size="sm" variant="light" color="warning" onPress={onClose} className="cursor-default">
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
