import {Button, Chip, Modal, ModalBody, ModalContent, ModalHeader} from '@heroui/react';
import {Divider} from 'antd';
import {Dispatch, Fragment, memo, SetStateAction} from 'react';

import {ModulesInfo} from '../../../../../../../cross/CrossTypes';
import {CloseSimple_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {RenderSubItems} from '../../../../Utils/UtilHooks';
import LynxScroll from '../../../Reusable/LynxScroll';

type Props = {item: ModulesInfo; isOpen: boolean; setIsOpen: Dispatch<SetStateAction<boolean>>};

const ModuleInfo = memo(({item, isOpen, setIsOpen}: Props) => {
  return (
    <Modal
      closeButton={
        <Button variant="light" color="warning" isIconOnly>
          <CloseSimple_Icon className="size-4" />
        </Button>
      }
      shadow="none"
      isOpen={isOpen}
      placement="center"
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
          <LynxScroll>
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
          </LynxScroll>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});
export default ModuleInfo;
