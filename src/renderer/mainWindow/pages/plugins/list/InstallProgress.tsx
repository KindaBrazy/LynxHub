import {ProgressBar} from '@heroui/react';
import gitIpc from '@lynx_shared/ipc/git';
import {useEffect, useState} from 'react';
import {SimpleGitProgressEvent} from 'simple-git';

interface InstallProgressProps {
  isInstalling: boolean;
  pluginUrl: string;
}

export function InstallProgress({isInstalling, pluginUrl}: InstallProgressProps) {
  const [installProgress, setInstallProgress] = useState<number>(0);

  useEffect(() => {
    if (!isInstalling) return;

    let isMounted = true;

    const removeListener = gitIpc.onProgress((url, state, result) => {
      if (url === pluginUrl && isMounted) {
        switch (state) {
          case 'Progress':
            setInstallProgress((result as SimpleGitProgressEvent).progress);
            break;
          case 'Failed':
          case 'Completed':
            setInstallProgress(0);
            break;
        }
      }
    });

    return () => {
      isMounted = false;
      removeListener();
    };
  }, [pluginUrl, isInstalling]);

  if (!isInstalling) return null;

  return (
    <ProgressBar
      size="sm"
      color="success"
      value={installProgress}
      aria-label="Installing progress"
      className="absolute bottom-0 inset-x-0 px-3.5">
      <ProgressBar.Track className="h-0.5">
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  );
}
export default InstallProgress;
