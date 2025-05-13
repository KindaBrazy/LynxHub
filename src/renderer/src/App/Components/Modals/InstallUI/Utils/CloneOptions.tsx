import {Checkbox, CircularProgress, Select, SelectItem} from '@heroui/react';
import {Card, InputNumber} from 'antd';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {extractGitUrl} from '../../../../../../../cross/CrossUtils';
import {SettingsMinimal_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons3';
import {lynxTopToast} from '../../../../Utils/UtilHooks';
import {CloneOptionsResult} from './CloneRepo';

type Branch = {
  name: string;
};

type Props = {url: string; setCloneOptionsResult: Dispatch<SetStateAction<CloneOptionsResult>>};

export default function CloneOptions({url, setCloneOptionsResult}: Props) {
  const [loading, setLoading] = useState<boolean>(true);

  const [enabledDepth, setEnabledDepth] = useState<boolean>(true);
  const [depthValue, setDepthValue] = useState<number>(1);

  const [enabledSingleBranch, setEnabledSingleBranch] = useState<boolean>(true);

  const [selectedBranch, setSelectedBranch] = useState(['master']);
  const [branches, setBranches] = useState<{key: string; value: string}[]>([{key: 'master', value: 'master'}]);

  useEffect(() => {
    setCloneOptionsResult({
      branch: selectedBranch[0],
      singleBranch: enabledSingleBranch,
      depth: enabledDepth ? depthValue : undefined,
    });
  }, [selectedBranch, enabledSingleBranch, enabledDepth, depthValue]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const {owner, repo} = extractGitUrl(url);
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!repoResponse.ok) {
          lynxTopToast.error(`Failed to fetch repository details: ${repoResponse.status}`);
          return;
        }
        const repoData = await repoResponse.json();
        const defaultBranch = repoData.default_branch;

        const branchesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`);
        if (!branchesResponse.ok) {
          lynxTopToast.error(`Failed to fetch branches: ${branchesResponse.status}`);
          return;
        }
        const branchesData: Branch[] = await branchesResponse.json();

        setSelectedBranch([defaultBranch]);
        setBranches(
          branchesData.map(b => {
            return {key: b.name, value: b.name};
          }),
        );
      } catch (err: any) {
        lynxTopToast.error(err.message || 'An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return (
    <Card
      title={
        <div className="flex flex-row items-center space-x-2">
          <SettingsMinimal_Icon className="size-4" />
          <span className="text-medium">Clone Options</span>
        </div>
      }
      size="small"
      variant="borderless"
      className="!shadow-small dark:bg-foreground-100">
      {loading ? (
        <div className="w-full flex justify-center mb-2">
          <CircularProgress size="lg" label="Fetching repository info..." />
        </div>
      ) : (
        <div className="flex flex-col gap-y-4">
          <div className="space-x-2 flex flex-row items-center">
            <Select
              size="sm"
              label="Branch:"
              items={branches}
              selectionMode="single"
              className="items-center"
              labelPlacement="outside-left"
              selectedKeys={selectedBranch}
              // @ts-ignore-next-line
              onSelectionChange={setSelectedBranch}
              classNames={{trigger: 'transition duration-300 data-[hover=true]:bg-foreground-300 bg-foreground-200'}}>
              {item => {
                return <SelectItem key={item.key}>{item.value}</SelectItem>;
              }}
            </Select>
          </div>
          <Checkbox isSelected={enabledSingleBranch} onValueChange={setEnabledSingleBranch}>
            Limit clone to a single branch
          </Checkbox>
          <div className="flex flex-row items-center">
            <Checkbox isSelected={enabledDepth} onValueChange={setEnabledDepth}>
              Perform a shallow clone (faster, less data)
            </Checkbox>
            <span className="text-medium">
              <InputNumber
                min={1}
                size="small"
                value={depthValue}
                disabled={!enabledDepth}
                addonAfter="commits deep."
                className="mx-1 z-20 max-w-60"
                onChange={value => setDepthValue(value!)}
                changeOnWheel
              />
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
