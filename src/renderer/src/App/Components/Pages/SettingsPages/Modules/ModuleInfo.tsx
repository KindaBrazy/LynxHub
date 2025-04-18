import {Button, Chip, Modal, ModalBody, ModalContent, ModalHeader} from '@heroui/react';
import {Divider} from 'antd';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, Fragment, SetStateAction} from 'react';

import {ModulesInfo} from '../../../../../../../cross/CrossTypes';
import {CloseSimple_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons5';
import {useAppState} from '../../../../Redux/Reducer/AppReducer';
import {RenderSubItems} from '../../../../Utils/UtilHooks';

type Props = {item: ModulesInfo; isOpen: boolean; setIsOpen: Dispatch<SetStateAction<boolean>>};

export default function ModuleInfo({item, isOpen, setIsOpen}: Props) {
  const isDarkMode = useAppState('darkMode');

  return (
    <Modal
      closeButton={
        <Button variant="light" color="warning" isIconOnly>
          <CloseSimple_Icon className="size-4" />
        </Button>
      }
      shadow="none"
      isOpen={isOpen}
      scrollBehavior="inside"
      onOpenChange={setIsOpen}
      className="border-1 border-foreground/10"
      classNames={{backdrop: '!top-10', wrapper: '!top-10', closeButton: 'cursor-default m-1'}}>
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
                    {RenderSubItems(change.items, `section_${index}`)}
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
