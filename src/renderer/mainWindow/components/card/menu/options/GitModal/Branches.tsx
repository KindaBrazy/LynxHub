import {Button, Key, Label, ListBox, Select} from '@heroui-v3/react';
import gitIpc from '@lynx_shared/ipc/git';
import {useCallback, useEffect, useState} from 'react';

import {topToast} from '../../../../../layouts/ToastProviders';

interface BranchesProps {
  dir: string;
  currentBranch: string;
  availableBranches: string[];
  refreshData: () => void;
}

export default function Branches({dir, availableBranches, currentBranch, refreshData}: BranchesProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<Key | null>(null);

  useEffect(() => {
    setSelectedBranch(currentBranch);
  }, [currentBranch]);

  const onSelectionChange = useCallback((key: Key | null) => {
    if (!key || typeof key === 'number') return;

    setSelectedBranch(key);
  }, []);

  const handleBranchChange = useCallback(async () => {
    if (!dir || !selectedBranch || selectedBranch === currentBranch) return;
    if (!selectedBranch || typeof selectedBranch === 'number') return;

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
    <div className="flex w-full items-end gap-x-4">
      <Select
        variant="secondary"
        value={selectedBranch}
        onChange={onSelectionChange}
        placeholder="Select a branch"
        fullWidth>
        <Label>Branch</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {availableBranches.map(branch => (
              <ListBox.Item id={branch} key={branch} textValue={branch}>
                {branch}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      <Button
        variant="secondary"
        isPending={loading}
        className="shrink-0"
        onPress={handleBranchChange}
        isDisabled={!selectedBranch || selectedBranch === currentBranch}>
        {loading ? 'Switching...' : 'Switch Branch'}
      </Button>
    </div>
  );
}
