import {ReactNode, useEffect, useState} from 'react';

export default function useStaticNotifications() {
  const [staticNotifs, setStaticNotifs] = useState<ReactNode[]>([]);
  const [haveWarn, setHaveWarn] = useState<boolean>(false);

  useEffect(() => {
    setStaticNotifs([]);
    setHaveWarn(false);
  }, []);

  return {staticNotifs, staticNotifCount: staticNotifs.length, haveWarn};
}
