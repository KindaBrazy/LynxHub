import {Card, CardBody, CardHeader, Checkbox, CircularProgress, NumberInput, Select, SelectItem} from '@heroui/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import {extractGitUrl} from '@lynx_common/utils';
import {SettingsMinimalistic, ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {CloneOptionsResult} from './CloneRepo';

type Branch = {
  name: string;
};

export interface CloneOptionsProps {
  /** The original git URL used to calculate dynamic repository attributes (like branch lists). */
  url: string;
  /** Standard React setState method to hook clone variables up to the parent component. */
  setCloneOptionsResult: Dispatch<SetStateAction<CloneOptionsResult>>;
}

/**
 * Handles customizing advanced git settings (ex: specifying a branch to use, or doing shallow depth clones).
 * Dynamically queries Github for meta branches info to pre-fill the selections.
 *
 * @param {CloneOptionsProps} props - The component props.
 */
export default function CloneOptions({url, setCloneOptionsResult}: CloneOptionsProps) {
  const [loading, setLoading] = useState<boolean>(true);

  const [enabledDepth, setEnabledDepth] = useState<boolean>(false);
  const [depthValue, setDepthValue] = useState<number>(1);

  const [enabledSingleBranch, setEnabledSingleBranch] = useState<boolean>(true);

  const [selectedBranch, setSelectedBranch] = useState<string[]>([]);
  const [branches, setBranches] = useState<{key: string; value: string}[]>([]);

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
          topToast.danger(`Failed to fetch repository details: ${repoResponse.status}`);
          return;
        }
        const repoData = await repoResponse.json();
        const defaultBranch = repoData.default_branch;

        const branchesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`);
        if (!branchesResponse.ok) {
          topToast.danger(`Failed to fetch branches: ${branchesResponse.status}`);
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
        topToast.danger(err.message || 'An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return (
    <Card className="dark:bg-foreground-100">
      <CardHeader className="gap-x-2">
        <SettingsMinimalistic />
        <span>Clone Options</span>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="w-full flex justify-center mb-2">
            <CircularProgress size="lg" label="Fetching repository info..." />
          </div>
        ) : isEmpty(branches) ? (
          <div className="flex flex-col items-center justify-center p-2 gap-y-1">
            <ShieldWarning className="size-14 text-warning" />
            <span className="text-lg font-medium">Unable to retrieve repository branches</span>
            <p className="text-sm text-foreground-500">The default repository branch will be used for cloning.</p>
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
            <div className="flex flex-row items-center justify-between">
              <Checkbox isSelected={enabledDepth} onValueChange={setEnabledDepth}>
                Perform a shallow clone
              </Checkbox>

              <NumberInput
                classNames={{
                  inputWrapper: 'bg-foreground-200 hover:bg-foreground-300! group-data-[focus=true]:bg-foreground-200',
                  base: 'w-fit',
                }}
                size="sm"
                minValue={1}
                label="Depth:"
                value={depthValue}
                className="max-w-72"
                isDisabled={!enabledDepth}
                labelPlacement="outside-left"
                onValueChange={setDepthValue}
              />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
