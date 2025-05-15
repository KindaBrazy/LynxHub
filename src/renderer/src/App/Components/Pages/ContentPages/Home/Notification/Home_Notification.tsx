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
  useDisclosure,
} from '@heroui/react';
import {Empty} from 'antd';
import {AnimatePresence, motion} from 'framer-motion';
import {isEmpty} from 'lodash';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {NOTIFICATION_DATA} from '../../../../../../../../cross/CrossConstants';
import {Notification_Data} from '../../../../../../../../cross/CrossTypes';
import {isDev, isValidURL} from '../../../../../../../../cross/CrossUtils';
import {BellDuo_Icon, CheckDuo_Icon, LightBulbMinimalDuo_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {tabsActions} from '../../../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {PageID, PageTitles} from '../../../../../Utils/Constants';
import LynxScroll from '../../../../Reusable/LynxScroll';

export default function Home_Notification() {
  const dispatch = useDispatch<AppDispatch>();
  const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure();

  const [notifications, setNotifications] = useState<Notification_Data[]>([]);

  const filterData = (data: Notification_Data[]) => {
    rendererIpc.storage.get('notification').then(({readNotifs}) => {
      setNotifications(data.filter(notif => !readNotifs.includes(notif.id)));
    });
  };

  const getData = () => {
    if (isDev()) {
      import('../../../../../../../../../notifications.json').then(result => {
        filterData(result.default as Notification_Data[]);
      });
    } else {
      fetch(NOTIFICATION_DATA).then(response => {
        if (response.ok) {
          response.json().then(data => {
            filterData(data as Notification_Data[]);
          });
        }
      });
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleRead = (id: string) => {
    rendererIpc.storageUtils.addReadNotif(id);
    filterData(notifications);
  };

  const openPage = (destination: 'modules' | 'extensions' | 'dashboard' | string) => {
    console.log(destination);
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
                    const {buttons, iconColor, title, description} = notif;
                    return (
                      <motion.div
                        key={notif.id}
                        layoutId={notif.id}
                        exit={{x: 300, opacity: 0}}
                        animate={{x: 0, opacity: 1}}
                        initial={{x: 300, opacity: 0}}>
                        <Card shadow="none" className="dark:bg-blck/40 bg-foreground-100">
                          <CardHeader className="justify-between">
                            <LightBulbMinimalDuo_Icon className={iconColor ? `text-${iconColor}` : 'text-foreground'} />
                            <span className={iconColor ? `text-${iconColor}` : 'text-foreground'}>{title}</span>
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
                          <CardFooter className="justify-end">
                            {buttons.map(btn => {
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
                                  key={btn.title}>
                                  {btn.title}
                                </Button>
                              );
                            })}
                          </CardFooter>
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
