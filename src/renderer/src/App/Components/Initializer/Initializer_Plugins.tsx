import {Button, Checkbox, cn, User} from '@heroui/react';
import {compact, isEmpty} from 'lodash';
import {useEffect, useState} from 'react';

import {MAIN_MODULE_URL} from '../../../../../cross/CrossConstants';
import {getPluginIconUrl} from '../../../../../cross/plugin/CrossPluginUtils';
import rendererIpc from '../../RendererIpc';

type ExtensionItem = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  url: string;
};

type Props = {
  setInstalledPlugins: (extensions: string[]) => void;
  requirementsSatisfied: boolean;
  setInstallingPlugins: (value: boolean) => void;
  isInstalling: boolean;
};

export default function Initializer_Plugins({
  setInstalledPlugins,
  requirementsSatisfied,
  setInstallingPlugins,
  isInstalling,
}: Props) {
  const [plugins, setPlugins] = useState<ExtensionItem[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<Set<string>>(new Set([]));

  useEffect(() => {
    rendererIpc.plugins.getList('public').then(list => {
      const compatibleList = list.filter(item => item.isCompatible || item.url !== MAIN_MODULE_URL);
      const finalList: ExtensionItem[] = compatibleList.map(item => {
        return {
          id: item.metadata.id,
          name: item.metadata.title,
          description: item.metadata.description,
          url: item.url,
          icon: getPluginIconUrl(item.url),
        };
      });

      setPlugins(finalList);
    });
  }, []);

  const onSelectionChange = (checked: boolean, id: string) => {
    setSelectedPlugin(prevState => {
      const newSet = new Set(prevState);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const install = () => {
    setInstallingPlugins(true);
    const urlsToInstall = compact(Array.from(selectedPlugin).map(id => plugins.find(ext => ext.id === id)?.url));
    if (isEmpty(urlsToInstall)) {
      setInstallingPlugins(false);
    } else {
      Promise.all(urlsToInstall.map(item => rendererIpc.plugins.install(item)))
        .then(result => {
          const allInstalled = result.every(isSuccess => isSuccess);
          if (allInstalled) {
            setInstalledPlugins(Array.from(selectedPlugin));
          } else {
            console.log('Failed to install some extensions');
          }
        })
        .finally(() => setInstallingPlugins(false));
    }
  };

  return (
    <div className="bg-foreground/4 p-4 rounded-xl flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Extensions</div>
        <div className="text-xs text-foreground/60">Choose which to install</div>
      </div>

      <div className="flex-1 overflow-hidden mb-4">
        {plugins.length === 0 && <span className="text-foreground/60 text-sm">No extensions available</span>}
        <div className="flex flex-col gap-y-6 overflow-hidden size-full p-2">
          {plugins.map(ext => (
            <Checkbox
              classNames={{
                base: cn(
                  'inline-flex w-full max-w-md bg-foreground/0',
                  'hover:bg-foreground/10 items-center justify-start',
                  'cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent',
                  'data-[selected=true]:bg-foreground-100 transition duration-300',
                ),
                label: 'w-full',
              }}
              key={ext.id}
              color="default"
              aria-label={ext.name}
              isDisabled={!requirementsSatisfied}
              isSelected={selectedPlugin.has(ext.id)}
              onValueChange={checked => onSelectionChange(checked, ext.id)}>
              <User
                name={ext.name}
                description={ext.description}
                avatarProps={{size: 'md', radius: 'none', className: 'shrink-0 bg-foreground/0', src: ext.icon}}
              />
            </Checkbox>
          ))}
        </div>
      </div>

      <Button onPress={install} isLoading={isInstalling} isDisabled={!requirementsSatisfied}>
        {requirementsSatisfied ? 'Install selected' : 'Complete Requirements'}
      </Button>
    </div>
  );
}
