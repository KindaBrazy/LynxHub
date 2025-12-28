import {Select, Selection, SelectItem} from '@heroui/react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import {showRestartModal} from '../../../../../../Utils/RestartModalUtils';
import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

type DiskCacheSize = 0 | 268435456 | 536870912 | 1073741824;

export default function SettingsPerformanceDiskCache() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedKey, setSelectedKey] = useState<string>('0');

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setSelectedKey(String(data.diskCacheSize));
    });
  }, []);

  const onChange = useCallback(
    (keys: Selection) => {
      if (keys !== 'all') {
        const value = Number(keys.values().next().value) as DiskCacheSize;
        rendererIpc.storage.update('performance', {diskCacheSize: value});
        setSelectedKey(String(value));
        showRestartModal(dispatch, 'To apply performance changes, please restart the app.');
      }
    },
    [dispatch],
  );

  const labelText = 'Disk Cache Size';
  const descriptionText = 'Amount of disk space for caching web content. Larger cache may improve loading times.';

  return (
    <SettingsFilterItem searchTexts={[labelText, descriptionText, 'cache', 'disk', 'storage']}>
      <Select
        className="my-0!"
        labelPlacement="outside"
        selectedKeys={[selectedKey]}
        onSelectionChange={onChange}
        label={<SettingsSearchHighlight text={labelText} />}
        description={<SettingsSearchHighlight text={descriptionText} />}
        classNames={{trigger: 'cursor-default !transition !duration-300'}}
        disallowEmptySelection>
        <SelectItem key="0" className="cursor-default" description="Use browser default cache size.">
          Default
        </SelectItem>
        <SelectItem key="268435456" className="cursor-default" description="Small cache for limited disk space.">
          256 MB
        </SelectItem>
        <SelectItem key="536870912" className="cursor-default" description="Medium cache for balanced usage.">
          512 MB
        </SelectItem>
        <SelectItem key="1073741824" className="cursor-default" description="Large cache for frequently visited sites.">
          1 GB
        </SelectItem>
      </Select>
    </SettingsFilterItem>
  );
}
