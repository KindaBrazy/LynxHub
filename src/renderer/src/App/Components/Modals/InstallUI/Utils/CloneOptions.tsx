import {Checkbox, CircularProgress, NumberInput, Select, SelectItem} from '@heroui/react';
import {Card} from 'antd';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extractGitUrl} from '../../../../../../../cross/CrossUtils';
import {SettingsMinimal_Icon, ShieldWarning_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {AppDispatch} from '../../../../Redux/Store';
import {lynxTopToast} from '../../../../Utils/UtilHooks';
import {CloneOptionsResult} from './CloneRepo';

type Branch = {
  name: string;
};

type Props = {url: string; setCloneOptionsResult: Dispatch<SetStateAction<CloneOptionsResult>>};

export default function CloneOptions({url, setCloneOptionsResult}: Props) {
  const [loading, setLoading] = useState<boolean>(true);

  const [enabledDepth, setEnabledDepth] = useState<boolean>(false);
  const [depthValue, setDepthValue] = useState<number>(1);

  const [enabledSingleBranch, setEnabledSingleBranch] = useState<boolean>(true);

  const [selectedBranch, setSelectedBranch] = useState<string[]>([]);
  const [branches, setBranches] = useState<{key: string; value: string}[]>([]);
  const dispatch = useDispatch<AppDispatch>();

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
          lynxTopToast(dispatch).error(`Failed to fetch repository details: ${repoResponse.status}`);
          return;
        }
        const repoData = await repoResponse.json();
        const defaultBranch = repoData.default_branch;

        const branchesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`);
        if (!branchesResponse.ok) {
          lynxTopToast(dispatch).error(`Failed to fetch branches: ${branchesResponse.status}`);
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
        lynxTopToast(dispatch).error(err.message || 'An error occurred while fetching data.');
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
      ) : isEmpty(branches) ? (
        <div className="flex flex-col items-center justify-center p-2 gap-y-1">
          <ShieldWarning_Icon className="size-14 text-warning" />
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
                inputWrapper: 'bg-foreground-200 hover:!bg-foreground-300 group-data-[focus=true]:bg-foreground-200',
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
            {/*<InputNumber
                min={1}
                variant="filled"
                value={depthValue}
                disabled={!enabledDepth}
                addonAfter="Commits deep"
                className="mx-1 z-20 max-w-60"
                onChange={value => setDepthValue(value!)}
                changeOnWheel
              />*/}
          </div>
        </div>
      )}
    </Card>
  );
}
