import {Alert, Button, Chip, Spinner} from '@heroui/react';
import {motion} from 'framer-motion';
import {ReactNode, useCallback, useEffect, useMemo, useState} from 'react';

import {MAIN_MODULE_URL} from '../../../../../cross/CrossConstants';
import rendererIpc from '../../RendererIpc';

type CheckResult = 'unknown' | 'checking' | 'ok' | 'failed' | 'installing';
type RowData = {result: CheckResult; label?: string};

function statusColor(s: CheckResult) {
  switch (s) {
    case 'ok':
      return 'success';
    case 'failed':
      return 'danger';
    case 'installing':
    case 'checking':
    default:
      return 'default';
  }
}

function statusLabel(s: RowData) {
  switch (s.result) {
    case 'ok':
      return s.label || 'Done';
    case 'failed':
      return 'Missing';
    case 'checking':
      return 'Checking';
    case 'installing':
      return 'Installing';
    default:
      return 'Unknown';
  }
}

type CheckRowProps = {
  label: string;
  description?: string;
  status: RowData;
};

type ReqStatus = {
  git: string;
  pwsh: string;
  appModule: string;
};

function CheckRow({label, description, status}: CheckRowProps) {
  const useBgWhite = useMemo(
    () => status.result === 'unknown' || status.result === 'checking' || status.result === 'installing',
    [status],
  );
  return (
    <motion.div
      whileTap={{scale: 0.98}}
      whileHover={{scale: 1.02}}
      transition={{duration: 0.2}}
      className="flex items-center justify-between">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-white/60">{description}</div>
      </div>

      <div className="flex items-center gap-3 light">
        <Chip
          startContent={
            (status.result === 'checking' || status.result === 'installing') && (
              <Spinner size="sm" className="mr-1" variant="gradient" />
            )
          }
          variant="flat"
          color={statusColor(status.result)}
          classNames={{content: 'flex items-center'}}
          className={`${useBgWhite && 'bg-white/10 text-white/70 '}` + ` text-xs`}>
          {statusLabel(status)}
        </Chip>
      </div>
    </motion.div>
  );
}

type Props = {
  setRequirementsSatisfied: (value: boolean) => void;
  start: boolean;
  setReqStatus: (value: ReqStatus) => void;
};

export function InitializerRequirements({setRequirementsSatisfied, start, setReqStatus}: Props) {
  const [git, setGit] = useState<RowData>({result: 'unknown'});
  const [pwsh, setPwsh] = useState<RowData>({result: 'unknown'});
  const [appModule, setAppModule] = useState<RowData>({result: 'failed'});

  const setStat = useCallback(() => {
    setReqStatus({
      git: git.label || 'Ready',
      pwsh: pwsh.label || 'Ready',
      appModule: appModule.result === 'ok' ? 'Ready' : 'Not Installed',
    });
  }, [git, pwsh, appModule]);

  const getAlertElement = (gitStat: boolean, pwshStat: boolean, appModuleStat: boolean) => {
    let title: string | null = null;
    let color: string | any | null = null;
    let description: string | null = null;
    let btnText: string | null = null;
    let btnPress: (() => void) | null = null;

    if (gitStat) {
      title = 'Git is Missing';
      description = 'Git is required for core functionalities. Please install it to continue.';
      btnText = 'Website';
      btnPress = () => rendererIpc.win.openUrlDefaultBrowser('https://git-scm.com/downloads');
      color = 'danger';
    } else if (pwshStat) {
      title = 'PowerShell 7+ is Missing';
      description = 'PowerShell 7 or a later version is required. Please install it.';
      btnText = 'Website';
      btnPress = () =>
        rendererIpc.win.openUrlDefaultBrowser('https://github.com/PowerShell/PowerShell/releases/latest');
      color = 'warning';
    } else if (appModuleStat) {
      title = 'Main Module Installation Failed';
      description = 'You can skip this and try to install it manually later from the settings.';
      btnText = 'Skip';
      btnPress = () => {
        setAppModule({result: 'unknown'});
        setRequirementsSatisfied(true);
        setStat();
      };
      color = 'default';
    }

    if (!title || !btnText || !btnPress) {
      return null;
    }

    return (
      <Alert
        endContent={
          <Button size="sm" color={color} className="light" onPress={btnPress} variant={appModule ? 'solid' : 'flat'}>
            {btnText}
          </Button>
        }
        title={title}
        color={color}
        className="max-h-16"
        description={description}
        classNames={{title: 'text-[9pt]', description: 'text-[8pt]'}}
      />
    );
  };

  const {isFailed, isDone, AlertElement} = useMemo(() => {
    const gitFail = git.result === 'failed';
    const pwshFail = pwsh.result === 'failed';
    const appModuleFail = appModule.result === 'failed';
    const isFailed = gitFail || pwshFail || appModuleFail;

    const isDone = git.result === 'ok' && pwsh.result === 'ok' && appModule.result === 'ok';

    const AlertElement: ReactNode = getAlertElement(gitFail, pwshFail, appModuleFail);

    return {
      isFailed,
      isDone,
      AlertElement,
    };
  }, [git, pwsh, appModule]);

  useEffect(() => {
    if (isFailed) {
      setRequirementsSatisfied(false);
    } else if (isDone) {
      setRequirementsSatisfied(true);
      setStat();
    }
  }, [isFailed, isDone]);

  const checkGit = useCallback(() => {
    setGit({result: 'checking'});
    return new Promise<void>(resolve => {
      rendererIpc.init
        .checkGitInstalled()
        .then(result => {
          if (result) {
            setGit({result: 'ok', label: result});
          } else {
            setGit({result: 'failed'});
          }
        })
        .catch(() => {
          setGit({result: 'failed'});
        })
        .finally(() => {
          resolve();
        });
    });
  }, []);

  const checkPwsh = useCallback(() => {
    setPwsh({result: 'checking'});
    return new Promise<void>(resolve => {
      rendererIpc.init
        .checkPwsh7Installed()
        .then(result => {
          if (result) {
            setPwsh({result: 'ok', label: result});
          } else {
            setPwsh({result: 'failed'});
          }
        })
        .catch(() => {
          setPwsh({result: 'failed'});
        })
        .finally(() => {
          resolve();
        });
    });
  }, []);

  const installModule = useCallback(() => {
    setAppModule({result: 'installing'});
    return new Promise<void>(resolve => {
      rendererIpc.module
        .installModule(MAIN_MODULE_URL)
        .then(result => {
          if (result) {
            setAppModule({result: 'ok'});
          } else {
            setAppModule({result: 'failed'});
          }
        })
        .catch(() => {
          setAppModule({result: 'failed'});
        })
        .finally(() => {
          resolve();
        });
    });
  }, []);

  useEffect(() => {
    setRequirementsSatisfied(false);

    if (start) {
      checkGit().then(() => {
        checkPwsh().then(() => {
          installModule();
        });
      });
    }
  }, [start]);

  return (
    <div className={`bg-white/6 p-4 rounded-xl ${isFailed && 'flex flex-col justify-between'}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Requirements</div>
        </div>

        <div className="space-y-3">
          <CheckRow label="Git" status={git} description="Command line Git" />
          <CheckRow status={pwsh} label="PowerShell 7+" description="pwsh (v7 or later)" />
          <CheckRow status={appModule} label="Official Module" description="Local Ai Container" />
        </div>
      </div>

      {AlertElement}
    </div>
  );
}
