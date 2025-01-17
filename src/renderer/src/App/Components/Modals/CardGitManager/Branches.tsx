import {Button, Select, Selection, SelectItem} from '@heroui/react';
import {message} from 'antd';
import {useCallback, useEffect, useState} from 'react';

import rendererIpc from '../../../RendererIpc';

type Props = {
  dir: string;
  currentBranch: string;
  availableBranches: string[];
  refreshData: () => void;
};

export default function Branches({dir, availableBranches, currentBranch, refreshData}: Props) {
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

  const handleBranchChange = () => {
    if (dir && selectedBranch) {
      setLoading(true);
      rendererIpc.git
        .changeBranch(dir, selectedBranch)
        .then(() => {
          message.success(`Successfully switched to branch: ${selectedBranch}`);
          refreshData();
        })
        .catch(err => {
          message.error(`Failed to switch branch: ${err.message || 'Unknown error'}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <div className="flex w-full items-center gap-x-4">
      <Select
        size="sm"
        isDisabled={loading}
        label="Available Branches"
        placeholder="Select a branch"
        onSelectionChange={onSelectionChange}
        selectedKeys={selectedBranch ? [selectedBranch] : []}
        fullWidth>
        {availableBranches.map(branch => (
          <SelectItem key={branch}>{branch}</SelectItem>
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
