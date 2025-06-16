import {Button, Card, CardBody, CardFooter, CardHeader, Code, Divider} from '@heroui/react';
import {motion} from 'framer-motion';
import {ReactNode, useEffect, useState} from 'react';

import {ShieldWarning_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../../../../RendererIpc';

const Du64Warning = () => {
  const restart = () => {
    rendererIpc.win.changeWinState('restart');
  };

  return (
    <motion.div
      exit={{x: 300, opacity: 0}}
      animate={{x: 0, opacity: 1}}
      initial={{x: 300, opacity: 0}}
      key="du64_warning_notif_motion"
      layoutId="du64_warning_notif_layout">
      <Card shadow="none" className="dark:bg-blck/40 bg-foreground-100">
        <CardHeader className="justify-between">
          <ShieldWarning_Icon className="size-6 text-warning" />
          <span className="text-warning">Important: DU64 Not Ready</span>
          <a />
        </CardHeader>
        <Divider />
        <CardBody className="flex flex-col gap-y-2 font-light">
          <span>
            <span className="font-semibold">
              <Code>DU64</Code> is essential for calculating folder sizes on Windows.
            </span>
          </span>
          <span>It appears there was an issue setting it up.</span>
          <span>
            Please <span className="font-semibold">check your internet connection</span> and then{' '}
            <span className="font-semibold">restart LynxHub</span> to resolve this.
          </span>
        </CardBody>

        <CardFooter className="justify-end">
          <Button variant="flat" color="success" onPress={restart}>
            Restart LynxHub
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default function useStaticNotifications() {
  const [staticNotifs, setStaticNotifs] = useState<ReactNode[]>([]);
  const [haveWarn, setHaveWarn] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('app').then(({isDu64Ready}) => {
      if (!isDu64Ready) {
        setStaticNotifs(prevState => [...prevState, <Du64Warning key="du64_warning_notif" />]);
        setHaveWarn(true);
      }
    });
  }, []);

  return {staticNotifs, staticNotifCount: staticNotifs.length, haveWarn};
}
