import {Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {CardModules, RendererModuleImportType} from '@lynx_cross/types/plugins/module';
import {isDev} from '@lynx_cross/utils';
import {compact} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {SettingsMinimal_Icon} from '../../../shared/assets/icons';
import {lynxTopToast} from '../../hooks/utils';
import rendererIpc from '../../ipc';
import {AppDispatch} from '../../redux/store';
import {showRestartModal} from '../../utils';

type CardItem = {id: string; title: string; type: string; enabled: boolean};
type CategoryCards = {category: string; cards: CardItem[]};
type FullCardData = {id: string; title: string; type: string; routePath: string};

type Props = {isOpen: boolean; onClose: () => void};

export default function ModuleConfigModal({isOpen, onClose}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [disabledCards, setDisabledCards] = useState<string[]>([]);
  const [allAvailableCards, setAllAvailableCards] = useState<FullCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch the FULL list of cards from module source (not filtered runtime data)
  useEffect(() => {
    if (isOpen) {
      setLoading(true);

      const loadFullCardList = async () => {
        try {
          let modules: CardModules = [];

          if (isDev()) {
            const devImport = await import('@lynx_module/renderer');
            modules = devImport.default;
          } else {
            const pluginAddresses = await rendererIpc.plugins.getAddresses();
            const moduleAddresses = pluginAddresses.filter(item => item.type === 'module').map(item => item.address);

            const importedModules = await Promise.all(
              moduleAddresses.map(async path => {
                try {
                  const module = await import(/* @vite-ignore */ `${path}/scripts/renderer.mjs?${Date.now()}`);
                  return module as RendererModuleImportType;
                } catch {
                  return null;
                }
              }),
            );

            compact(importedModules).forEach(module => {
              module.default.forEach(mod => {
                const existing = modules.find(m => m.routePath === mod.routePath);
                if (existing) {
                  mod.cards.forEach(card => {
                    if (!existing.cards.some(c => c.id === card.id)) {
                      existing.cards.push(card);
                    }
                  });
                } else {
                  modules.push(mod);
                }
              });
            });
          }

          const cards: FullCardData[] = [];
          modules.forEach(mod => {
            mod.cards.forEach(card => {
              cards.push({id: card.id, title: card.title, type: card.type || 'unknown', routePath: mod.routePath});
            });
          });

          setAllAvailableCards(cards);

          const pluginData = await rendererIpc.storage.get('plugin');
          setDisabledCards(pluginData.disabledCards || []);
        } catch (e) {
          console.error('Failed to load full card list:', e);
        } finally {
          setLoading(false);
        }
      };

      loadFullCardList();
    }
  }, [isOpen]);

  const categorizedCards = useMemo((): CategoryCards[] => {
    const categoryMap = new Map<string, CardItem[]>();

    allAvailableCards.forEach(card => {
      const categoryName = card.routePath.replace('_page', '').replace('Gen', ' Generation');
      const formattedName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

      const cardItem: CardItem = {
        id: card.id,
        title: card.title,
        type: card.type,
        enabled: !disabledCards.includes(card.id),
      };

      if (categoryMap.has(formattedName)) {
        categoryMap.get(formattedName)!.push(cardItem);
      } else {
        categoryMap.set(formattedName, [cardItem]);
      }
    });

    return Array.from(categoryMap.entries()).map(([category, cards]) => ({category, cards}));
  }, [disabledCards, allAvailableCards]);

  const toggleCard = useCallback((cardId: string) => {
    setDisabledCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      }
      return [...prev, cardId];
    });
  }, []);

  const enableAll = useCallback(() => {
    setDisabledCards([]);
  }, []);

  const disableAll = useCallback(() => {
    const allIds = allAvailableCards.map(card => card.id);
    setDisabledCards(allIds);
  }, [allAvailableCards]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await rendererIpc.storage.update('plugin', {disabledCards});
      lynxTopToast(dispatch).success('Module configuration saved');
      onClose();
      showRestartModal(dispatch, 'To apply the changes, please restart the app.');
    } catch (e) {
      lynxTopToast(dispatch).error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }, [disabledCards, dispatch, onClose]);

  const enabledCount = useMemo(() => {
    return allAvailableCards.length - disabledCards.length;
  }, [disabledCards, allAvailableCards]);

  return (
    <Modal
      size="2xl"
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      classNames={{backdrop: 'top-10!', wrapper: 'top-10!'}}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <SettingsMinimal_Icon className="size-5" />
            <span>Module Configuration</span>
          </div>
          <span className="text-small font-normal text-foreground-500">
            Enable or disable individual AI tools. Disabled tools won't be loaded.
          </span>
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="flex items-center justify-center py-8">Loading...</div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-small text-foreground-500">
                  {enabledCount} of {allAvailableCards.length} tools enabled
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="flat" onPress={enableAll}>
                    Enable All
                  </Button>
                  <Button size="sm" variant="flat" color="danger" onPress={disableAll}>
                    Disable All
                  </Button>
                </div>
              </div>
              {categorizedCards.map(category => (
                <div key={category.category} className="flex flex-col gap-2">
                  <span className="text-medium font-semibold">{category.category}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {category.cards.map(card => (
                      <Checkbox
                        key={card.id}
                        isSelected={card.enabled}
                        classNames={{label: 'text-small'}}
                        onValueChange={() => toggleCard(card.id)}>
                        {card.title}
                      </Checkbox>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" isLoading={saving} onPress={handleSave}>
            Save & Restart
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
