import {Alert, Button} from '@heroui/react';
import {ReactNode, useCallback, useEffect, useMemo, useState} from 'react';

import {MAIN_MODULE_URL} from '../../../../../cross/CrossConstants';
import rendererIpc from '../../RendererIpc';
import {ReqProps, RowData} from './InitTypes';
import CheckRow from './Req_CheckRow';

const isWin = window.osPlatform === 'win32';

export function InitializerRequirements({setRequirementsSatisfied, start, setReqStatus}: ReqProps) {
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
      description = 'You can skip this and try to install it manually later from the modules page.';
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

    const isDone = git.result === 'ok' && (isWin ? pwsh.result === 'ok' : true) && appModule.result === 'ok';

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
        if (isWin) {
          checkPwsh().then(() => {
            installModule();
          });
        } else {
          installModule();
        }
      });
    }
  }, [start]);

  return (
    <div className={`bg-white/6 p-4 rounded-xl ${isFailed && 'flex flex-col justify-between'}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Requirements</div>
        </div>

        <div className="space-y-4">
          <CheckRow label="Git" status={git} description="Command line Git" />
          {isWin && <CheckRow status={pwsh} label="PowerShell 7+" description="pwsh (v7 or later)" />}
          <CheckRow status={appModule} label="Official Module" description="Local Ai Container" />
        </div>
      </div>

      {AlertElement}
    </div>
  );
}
