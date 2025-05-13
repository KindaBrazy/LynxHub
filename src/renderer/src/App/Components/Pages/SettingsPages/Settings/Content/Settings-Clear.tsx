import {Button, ButtonGroup, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {useState} from 'react';

import {Trash_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons3';
import {Refresh3_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons4';
import {BroomDuo_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons6';
import rendererIpc from '../../../../../RendererIpc';
import {lynxTopToast} from '../../../../../Utils/UtilHooks';
import SettingsSection from '../SettingsPage-ContentSection';

export const SettingsClearId = 'settings_rmv_data_elem';

/** Clear app settings and cache */
export default function SettingsClear() {
  const [isClearSettingsOpen, setIsClearSettingsOpen] = useState<boolean>(false);
  const [isClearCacheOpen, setIsClearCacheOpen] = useState<boolean>(false);

  const clearCache = () => {
    localStorage.clear();
    lynxTopToast.success('Cache cleared successfully.');
  };

  return (
    <SettingsSection title="Clear" id={SettingsClearId} icon={<Trash_Icon className="size-5" />} itemsCenter>
      <Popover
        size="sm"
        shadow="sm"
        isOpen={isClearSettingsOpen}
        onOpenChange={setIsClearSettingsOpen}
        classNames={{base: 'before:bg-foreground-100'}}
        showArrow>
        <PopoverTrigger>
          <Button variant="flat" color="danger" startContent={<Refresh3_Icon />} fullWidth>
            Reset Settings (Restart Required)
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 gap-y-2 bg-foreground-100">
          <span className="font-bold w-full text-sm">Reset Settings</span>
          <span>Are you sure you want to reset all app settings and restart?</span>
          <ButtonGroup className="flex flex-row w-full mt-2" fullWidth>
            <Button size="sm" color="danger" startContent={<Refresh3_Icon />} onPress={rendererIpc.storage.clear}>
              Reset & Restart
            </Button>
            <Button
              onPress={() => {
                setIsClearSettingsOpen(false);
              }}
              size="sm"
              className="cursor-default">
              Cancel
            </Button>
          </ButtonGroup>
        </PopoverContent>
      </Popover>
      <Popover
        size="sm"
        shadow="sm"
        isOpen={isClearCacheOpen}
        onOpenChange={setIsClearCacheOpen}
        classNames={{base: 'before:bg-foreground-100'}}
        showArrow>
        <PopoverTrigger>
          <Button variant="flat" color="warning" startContent={<BroomDuo_Icon />} fullWidth>
            Clear Cache
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 gap-y-2 bg-foreground-100">
          <span className="font-bold w-full text-sm">Clear Cache</span>
          <span>Are you sure you want to clear all cache?</span>
          <ButtonGroup className="flex flex-row w-full mt-2" fullWidth>
            <Button size="sm" color="warning" onPress={clearCache} startContent={<BroomDuo_Icon />}>
              Clear
            </Button>
            <Button size="sm" className="cursor-default" onPress={() => setIsClearCacheOpen(false)}>
              Cancel
            </Button>
          </ButtonGroup>
        </PopoverContent>
      </Popover>
      <span>Please note that some data may need to be redownloaded or reconfigured after clearing.</span>
    </SettingsSection>
  );
}
