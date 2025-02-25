import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Selection} from '@heroui/react';
import {memo, useCallback} from 'react';

import {Filter_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons1';
import {Apps_Color_Icon, History_Color_Icon, Pin_Color_Icon} from '../../../../../assets/icons/SvgIcons/SvgIconsColor';
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
    <Dropdown size="sm" className="border !border-foreground/15 drop-shadow-lg" showArrow>
      <DropdownTrigger>
        <Button
          className={
            `cursor-default border border-foreground/10 bg-stone-50 shadow-md ` +
            `dark:border-foreground/5 dark:bg-[#23242578] dark:hover:bg-[#232425de]`
          }
          radius="full"
          variant="light"
          isIconOnly>
          <Filter_Icon className="w-full h-full p-3" />
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        variant="faded"
        aria-label="pinned"
        closeOnSelect={false}
        selectionMode="multiple"
        onSelectionChange={onChange}
        selectedKeys={selectedCategories}
        disallowEmptySelection>
        <DropdownSection title="Categories">
          <DropdownItem key="Pin" className="cursor-default" startContent={<Pin_Color_Icon className="size-4" />}>
            PINNED
          </DropdownItem>
          <DropdownItem
            key="Recently"
            className="cursor-default"
            startContent={<History_Color_Icon className="size-4" />}>
            RECENTLY USED
          </DropdownItem>
          <DropdownItem key="All" className="cursor-default" startContent={<Apps_Color_Icon className="size-4" />}>
            All
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
});

export default HomeFilter;
