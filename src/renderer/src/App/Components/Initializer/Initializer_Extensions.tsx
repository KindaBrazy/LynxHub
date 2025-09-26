import {Button, Checkbox, cn, User} from '@heroui/react';
import {compact, isEmpty} from 'lodash';
import {useEffect, useState} from 'react';

import rendererIpc from '../../RendererIpc';

type ExtensionItem = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  url: string;
};

type Props = {
  setInstalledExtensions: (extensions: string[]) => void;
  requirementsSatisfied: boolean;
  setInstallingExtensions: (value: boolean) => void;
  isInstalling: boolean;
};

export default function Initializer_Extensions({
  setInstalledExtensions,
  requirementsSatisfied,
  setInstallingExtensions,
  isInstalling,
}: Props) {
  const [extensions, setExtensions] = useState<ExtensionItem[]>([]);
  const [selectedExtensions, setSelectedExtensions] = useState<Set<string>>(new Set([]));

  useEffect(() => {
    rendererIpc.statics.getExtensions().then(available => {
      setExtensions(
        available.map(item => ({
          id: item.id,
          name: item.title,
          description: item.description,
          icon: item.avatarUrl,
          url: item.repoUrl,
        })),
      );
    });
  }, []);

  const onSelectionChange = (checked: boolean, id: string) => {
    setSelectedExtensions(prevState => {
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
    setInstallingExtensions(true);
    const urlsToInstall = compact(Array.from(selectedExtensions).map(id => extensions.find(ext => ext.id === id)?.url));
    if (isEmpty(urlsToInstall)) {
      setInstallingExtensions(false);
    } else {
      Promise.all(urlsToInstall.map(item => rendererIpc.extension.installExtension(item)))
        .then(result => {
          const allInstalled = result.every(isSuccess => isSuccess === true);
          if (allInstalled) {
            setInstalledExtensions(Array.from(selectedExtensions));
          } else {
            console.log('Failed to install some extensions');
          }
        })
        .finally(() => setInstallingExtensions(false));
    }
  };

  return (
    <div className="bg-white/6 p-4 rounded-xl flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Extensions</div>
        <div className="text-xs text-white/60">Choose which to install</div>
      </div>

      <div className="flex-1 overflow-hidden mb-4">
        {extensions.length === 0 && (
          <div className="text-white/60 text-sm">
            No extensions provided — pass an
            <code className="bg-white/6 px-1 rounded">extensions</code> prop.
          </div>
        )}
        <div className="light flex flex-col gap-y-6 overflow-hidden size-full p-2">
          {extensions.map(ext => (
            <Checkbox
              classNames={{
                base: cn(
                  'inline-flex w-full max-w-md bg-foreground/0',
                  'hover:bg-foreground/10 items-center justify-start',
                  'cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent',
                  'data-[selected=true]:bg-foreground/30 transition duration-300',
                ),
                label: 'w-full text-white',
              }}
              key={ext.id}
              color="default"
              aria-label={ext.name}
              isDisabled={!requirementsSatisfied}
              isSelected={selectedExtensions.has(ext.id)}
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

      <Button onPress={install} className="light" isLoading={isInstalling} isDisabled={!requirementsSatisfied}>
        {requirementsSatisfied ? 'Install selected' : 'Complete Requirements'}
      </Button>
    </div>
  );
}
