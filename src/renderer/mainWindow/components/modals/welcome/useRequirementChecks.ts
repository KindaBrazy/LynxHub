import {MAIN_MODULE_URL} from '@lynx_common/consts';
import {isWin} from '@lynx_common/utils';
import applicationIpc from '@lynx_shared/ipc/application';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import {useCallback, useMemo, useState} from 'react';

import {FailureType, RowData} from './types';

type Statuses = {
  git: RowData;
  pwsh: RowData;
  appModule: RowData;
};

export default function useRequirementChecks() {
  const [statuses, setStatuses] = useState<Statuses>({
    git: {result: 'unknown'},
    pwsh: {result: isWin ? 'unknown' : 'ok'}, // Skip on non-windows
    appModule: {result: 'unknown'},
  });

  const updateStatus = useCallback((key: keyof Statuses, newStatus: RowData) => {
    setStatuses(prev => ({...prev, [key]: newStatus}));
  }, []);

  const checkGit = useCallback(async () => {
    updateStatus('git', {result: 'checking'});
    try {
      const result = await applicationIpc.invoke.checkGitInstalled();
      if (result) {
        updateStatus('git', {result: 'ok', label: result});
        return true;
      }
      updateStatus('git', {result: 'failed'});
      return false;
    } catch {
      updateStatus('git', {result: 'failed'});
      return false;
    }
  }, [updateStatus]);

  const checkPwsh = useCallback(async () => {
    if (!isWin) return true;
    updateStatus('pwsh', {result: 'checking'});
    try {
      const result = await applicationIpc.invoke.checkPwsh7Installed();
      if (result) {
        updateStatus('pwsh', {result: 'ok', label: result});
        return true;
      }
      updateStatus('pwsh', {result: 'failed'});
      return false;
    } catch {
      updateStatus('pwsh', {result: 'failed'});
      return false;
    }
  }, [updateStatus]);

  const installModule = useCallback(async () => {
    updateStatus('appModule', {result: 'checking'});
    try {
      const installedList = await pluginsIpc.getInstalledList();
      if (installedList.some(p => p.url === MAIN_MODULE_URL)) {
        updateStatus('appModule', {result: 'ok'});
        return true;
      }

      updateStatus('appModule', {result: 'installing'});
      const result = await pluginsIpc.install(MAIN_MODULE_URL);

      if (result) {
        updateStatus('appModule', {result: 'ok'});
        return true;
      }

      updateStatus('appModule', {result: 'failed'});
      return false;
    } catch {
      updateStatus('appModule', {result: 'failed'});
      return false;
    }
  }, [updateStatus]);

  const checkAll = useCallback(async () => {
    if (await checkGit()) {
      if (await checkPwsh()) {
        await installModule();
      }
    }
  }, [checkGit, checkPwsh, installModule]);

  const isSuccess = useMemo(
    () =>
      statuses.git.result === 'ok' &&
      statuses.pwsh.result === 'ok' &&
      (statuses.appModule.result === 'ok' || statuses.appModule.result === 'skipped'),
    [statuses],
  );

  const failureType: FailureType = useMemo(() => {
    if (statuses.git.result === 'failed') return 'git';
    if (statuses.pwsh.result === 'failed') return 'pwsh';
    if (statuses.appModule.result === 'failed') return 'appModule';
    return null;
  }, [statuses]);

  const skipAppModule = useCallback(() => {
    updateStatus('appModule', {result: 'skipped', label: 'Skipped'});
  }, [updateStatus]);

  return {
    statuses,
    isSuccess,
    hasFailure: !!failureType,
    failureType,
    checkAll,
    skipAppModule,
  };
}
