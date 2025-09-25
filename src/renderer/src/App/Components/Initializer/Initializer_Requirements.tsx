import {Chip, Spinner} from '@heroui/react';
import {motion} from 'framer-motion';
import {useCallback, useEffect, useMemo, useState} from 'react';

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
      return s.label || 'OK';
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
};

export function InitializerRequirements({setRequirementsSatisfied, start}: Props) {
  const [git, setGit] = useState<RowData>({result: 'unknown'});
  const [pwsh, setPwsh] = useState<RowData>({result: 'unknown'});
  const [appModule, setAppModule] = useState<RowData>({result: 'unknown'});

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
      setTimeout(() => resolve(), 1000);
    });
  }, []);

  useEffect(() => {
    setRequirementsSatisfied(false);

    const checkAll = async () => {
      await checkGit();
      await checkPwsh();
      await installModule();

      if (git.result === 'ok' && pwsh.result === 'ok' && appModule.result === 'ok') {
        setRequirementsSatisfied(true);
      }
    };

    if (start) checkAll();
  }, [start]);

  return (
    <div className="bg-white/6 p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Requirements</div>
      </div>

      <div className="space-y-3">
        <CheckRow label="Git" status={git} description="Command line Git" />
        <CheckRow status={pwsh} label="PowerShell 7+" description="pwsh (v7 or later)" />
        <CheckRow status={appModule} label="Local Module" description="LynxHub Local Ai Container" />
      </div>
    </div>
  );
}
