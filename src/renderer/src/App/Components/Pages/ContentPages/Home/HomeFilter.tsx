import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Selection,
} from '@nextui-org/react';
import {memo, useCallback} from 'react';

import {getIconByName} from '../../../../../assets/icons/SvgIconsContainer';
import rendererIpc from '../../../../RendererIpc';

type Props = {
  selectedCategories: string[];
};
const HomeFilter = memo(({selectedCategories}: Props) => {
  const onChange = useCallback((keys: Selection) => {
    if (keys === 'all') {
      rendererIpc.storageUtils.homeCategory('set', ['Pin', 'Recently', 'All']);
    } else {
      rendererIpc.storageUtils.homeCategory('set', Array.from(keys).map(String));
    }
  }, []);

  return (
    <Dropdown className="border-2 border-foreground/5 drop-shadow-lg" showArrow>
      <DropdownTrigger>
        <Button
          className={
            `cursor-default border border-foreground/10 bg-stone-50 shadow-md ` +
            `dark:border-foreground/5 dark:bg-LynxRaisinBlack dark:hover:bg-white/15`
          }
          radius="full"
          variant="light"
          isIconOnly>
          {getIconByName('Filter', {className: 'w-full h-full p-3'})}
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="pinned"
        closeOnSelect={false}
        selectionMode="multiple"
        onSelectionChange={onChange}
        selectedKeys={selectedCategories}
        disallowEmptySelection>
        <DropdownSection title="Categories">
          <DropdownItem key="Pin" className="cursor-default" startContent={getIconByName('Pin')}>
            PINNED
          </DropdownItem>
          <DropdownItem key="Recently" className="cursor-default" startContent={getIconByName('History')}>
            RECENTLY USED
          </DropdownItem>
          <DropdownItem key="All" className="cursor-default" startContent={getIconByName('Widget')}>
            All
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
});

export default HomeFilter;
