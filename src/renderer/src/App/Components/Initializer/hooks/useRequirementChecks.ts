import {useCallback, useMemo, useState} from 'react';

import {MAIN_MODULE_URL} from '../../../../../../cross/CrossConstants';
import rendererIpc from '../../../RendererIpc';
import {RowData} from '../types';

const isWin = window.osPlatform === 'win32';

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

  const updateStatus = (key: keyof Statuses, newStatus: RowData) => {
    setStatuses(prev => ({...prev, [key]: newStatus}));
  };

  const checkGit = useCallback(async () => {
    updateStatus('git', {result: 'checking'});
    try {
      const result = await rendererIpc.init.checkGitInstalled();
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
  }, []);

  const checkPwsh = useCallback(async () => {
    if (!isWin) return true;
    updateStatus('pwsh', {result: 'checking'});
    try {
      const result = await rendererIpc.init.checkPwsh7Installed();
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
  }, []);

  const installModule = useCallback(async () => {
    updateStatus('appModule', {result: 'checking'});
    const installedList = await rendererIpc.plugins.getInstalledList();
    if (installedList.some(p => p.url === MAIN_MODULE_URL)) {
      updateStatus('appModule', {result: 'ok'});
      return true;
    }

    updateStatus('appModule', {result: 'installing'});
    try {
      const result = await rendererIpc.plugins.install(MAIN_MODULE_URL);
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
  }, []);

  const checkAll = useCallback(async () => {
    if (await checkGit()) {
      if (await checkPwsh()) {
        await installModule();
      }
    }
  }, [checkGit, checkPwsh, installModule]);

  const isSuccess = useMemo(
    () => statuses.git.result === 'ok' && statuses.pwsh.result === 'ok' && statuses.appModule.result === 'ok',
    [statuses],
  );

  const failureType = useMemo(() => {
    if (statuses.git.result === 'failed') return 'git';
    if (statuses.pwsh.result === 'failed') return 'pwsh';
    if (statuses.appModule.result === 'failed') return 'appModule';
    return null;
  }, [statuses]);

  const skipAppModule = useCallback(() => {
    // Treat as "ok" for the purpose of satisfying requirements, but don't change the label
    updateStatus('appModule', {result: 'ok', label: 'Skipped'});
  }, []);

  return {
    statuses,
    isSuccess,
    hasFailure: !!failureType,
    failureType,
    checkAll,
    skipAppModule,
  };
}
