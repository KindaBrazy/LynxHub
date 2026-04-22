import {Button, Select, Selection, SelectItem} from '@heroui/react';
import gitIpc from '@lynx_shared/ipc/git';
import {useCallback, useEffect, useState} from 'react';

import {topToast} from '../../../../layouts/ToastProviders';

interface BranchesProps {
  dir: string;
  currentBranch: string;
  availableBranches: string[];
  refreshData: () => void;
}

export default function Branches({dir, availableBranches, currentBranch, refreshData}: BranchesProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);

  useEffect(() => {
    setSelectedBranch(currentBranch);
  }, [currentBranch]);

  const onSelectionChange = useCallback((keys: Selection) => {
    if (keys !== 'all') {
      const value = keys.values().next().value?.toString();
      setSelectedBranch(value);
    }
  }, []);

  const handleBranchChange = useCallback(async () => {
    if (!dir || !selectedBranch || selectedBranch === currentBranch) return;

    setLoading(true);
    try {
      await gitIpc.changeBranch(dir, selectedBranch);
      topToast.success(`Successfully switched to branch: ${selectedBranch}`);
      refreshData();
    } catch (err: any) {
      topToast.danger(`Failed to switch branch: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [dir, selectedBranch, currentBranch, refreshData]);

  return (
    <div className="flex w-full items-center gap-x-4">
      <Select
        size="sm"
        isDisabled={loading}
        label="Available Branches"
        placeholder="Select a branch"
        onSelectionChange={onSelectionChange}
        aria-label="Select branch to switch to"
        selectedKeys={selectedBranch ? [selectedBranch] : []}
        fullWidth>
        {availableBranches.map(branch => (
          <SelectItem key={branch} textValue={branch}>
            {branch}
          </SelectItem>
        ))}
      </Select>
      <Button
        variant="flat"
        color="primary"
        isLoading={loading}
        className="shrink-0"
        onPress={handleBranchChange}
        isDisabled={!selectedBranch || selectedBranch === currentBranch}>
        {loading ? 'Switching...' : 'Switch Branch'}
      </Button>
    </div>
  );
}
