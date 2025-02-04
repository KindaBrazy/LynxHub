import {Chip, Modal, ModalBody, ModalContent, ModalHeader} from '@heroui/react';
import {Divider} from 'antd';
import {isEmpty, isNil} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, Fragment, SetStateAction, useCallback} from 'react';

import {ChangelogItem, ModulesInfo} from '../../../../../../../cross/CrossTypes';
import {useAppState} from '../../../../Redux/App/AppReducer';

type Props = {item: ModulesInfo; isOpen: boolean; setIsOpen: Dispatch<SetStateAction<boolean>>};

function useRenderItems() {
  const renderSubItems = useCallback((items?: ChangelogItem[], parentKey: string = '') => {
    if (isNil(items) || isEmpty(items)) return null;

    return (
      <ul style={{listStyleType: 'disc', paddingLeft: '20px'}}>
        {items.map((item, index) => {
          const currentKey = `${parentKey}_${index}`;
          return (
            <Fragment key={currentKey}>
              <li>{item.label}</li>
              {item.subitems && renderSubItems(item.subitems, currentKey)}
            </Fragment>
          );
        })}
      </ul>
    );
  }, []);

  return renderSubItems;
}

export default function ModuleInfo({item, isOpen, setIsOpen}: Props) {
  const isDarkMode = useAppState('darkMode');

  const renderSubItems = useRenderItems();

  return (
    <Modal
      shadow="none"
      isOpen={isOpen}
      scrollBehavior="inside"
      onOpenChange={setIsOpen}
      className="border-1 border-foreground/10"
      classNames={{backdrop: '!top-10', wrapper: '!top-10'}}>
      <ModalContent>
        <ModalHeader className="justify-center">{item.title}</ModalHeader>
        <ModalBody className="mb-8">
          <div className="flex items-center flex-row gap-x-2 w-full justify-center mb-2">
            <Chip size="sm" radius="sm" variant="flat">
              V{item.version}
            </Chip>
            <Chip size="sm" radius="sm" variant="flat">
              {item.updateDate}
            </Chip>
          </div>
          <OverlayScrollbarsComponent
            options={{
              overflow: {x: 'hidden', y: 'scroll'},
              scrollbars: {
                autoHide: 'scroll',
                clickScroll: true,
                theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
              },
            }}>
            {item.changes &&
              item.changes.map((change, index) => (
                <Fragment key={`section_${index}`}>
                  <ul style={{listStyleType: 'disc'}}>
                    <span className="text-large font-semibold">{change.title}</span>
                    {renderSubItems(change.items, `section_${index}`)}
                  </ul>
                  {index < item.changes.length - 1 && <Divider />}
                </Fragment>
              ))}
          </OverlayScrollbarsComponent>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
