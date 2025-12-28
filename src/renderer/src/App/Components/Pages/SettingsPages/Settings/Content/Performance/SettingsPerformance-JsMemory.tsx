import {Select, Selection, SelectItem} from '@heroui/react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import {showRestartModal} from '../../../../../../Utils/RestartModalUtils';
import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

type JsMemorySize = 2048 | 4096 | 8192;

export default function SettingsPerformanceJsMemory() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedKey, setSelectedKey] = useState<string>('4096');

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setSelectedKey(String(data.jsMaxOldSpaceSize));
    });
  }, []);

  const onChange = useCallback(
    (keys: Selection) => {
      if (keys !== 'all') {
        const value = Number(keys.values().next().value) as JsMemorySize;
        rendererIpc.storage.update('performance', {jsMaxOldSpaceSize: value});
        setSelectedKey(String(value));
        showRestartModal(dispatch, 'To apply performance changes, please restart the app.');
      }
    },
    [dispatch],
  );

  const labelText = 'JavaScript Memory Limit';
  const descriptionText =
    'Maximum heap size for the JavaScript engine. Higher values may improve performance with large web applications.';

  return (
    <SettingsFilterItem searchTexts={[labelText, descriptionText, 'js', 'memory', 'heap', 'ram']}>
      <Select
        className="my-0!"
        labelPlacement="outside"
        selectedKeys={[selectedKey]}
        onSelectionChange={onChange}
        label={<SettingsSearchHighlight text={labelText} />}
        description={<SettingsSearchHighlight text={descriptionText} />}
        classNames={{trigger: 'cursor-default !transition !duration-300'}}
        disallowEmptySelection>
        <SelectItem
          key="2048"
          className="cursor-default"
          description="Lower memory usage, suitable for most use cases.">
          2 GB
        </SelectItem>
        <SelectItem key="4096" className="cursor-default" description="Balanced setting for moderate workloads.">
          4 GB (Default)
        </SelectItem>
        <SelectItem key="8192" className="cursor-default" description="Maximum memory for heavy web applications.">
          8 GB
        </SelectItem>
      </Select>
    </SettingsFilterItem>
  );
}
