import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Selection } from '@heroui/react';
import { Apps_Color_Icon, History_Color_Icon, Pin_Color_Icon } from '@lynx_assets/icons/Icons_Colorful';
import { storageUtilsIpc } from '@lynx_shared/ipc/storage';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import { Filter } from '@solar-icons/react-perf/BoldDuotone';
import { memo, useCallback } from 'react';

/**
 * Props for the HomeFilter component.
 */
interface HomeFilterProps {
  /** The currently selected category keys (e.g., "Pin", "Recently", "All"). */
  selectedCategories: string[];
}

/**
 * A dropdown button that filters the visible cards on the Home page by their logical category.
 *
 * @param {HomeFilterProps} props Contains the currently selected category strings.
 * @returns {JSX.Element} A dropdown selection menu for filtering cards.
 */
const HomeFilter = memo(({ selectedCategories }: HomeFilterProps) => {
  /**
   * Handles selection changes from the DropdownMenu.
   * Modifies the global category preference using the storage IPC.
   *
   * @param {Selection} keys The new Set of selected keys, or the string 'all'.
   */
  const handleSelectionChange = useCallback((keys: Selection) => {
    AddBreadcrumb_Renderer(`Home Filter: keys:${JSON.stringify(keys)}`);
    if (keys === 'all') {
      storageUtilsIpc.invoke.homeCategory('set', ['Pin', 'Recently', 'All']);
    } else {
      storageUtilsIpc.invoke.homeCategory('set', Array.from(keys).map(String));
    }
  }, []);

  return (
    <Dropdown size="sm" className="border-foreground/15! border drop-shadow-lg" showArrow>
      <DropdownTrigger>
        <Button
          className={
            'border-foreground/10 bg-stone-50 border shadow-md ' +
            'dark:border-foreground/5 dark:bg-[#202020] dark:hover:bg-LynxNearBlack'
          }
          radius="full"
          variant="light"
          isIconOnly>
          <Filter className="size-3.5" />
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        variant="faded"
        aria-label="Filter Categories"
        closeOnSelect={false}
        selectionMode="multiple"
        onSelectionChange={handleSelectionChange}
        selectedKeys={selectedCategories}
        disallowEmptySelection>
        <DropdownSection title="Categories">
          <DropdownItem
            key="Pin"
            className="cursor-default"
            startContent={<Pin_Color_Icon className="size-4" id="home_filter_pin" />}>
            PINNED
          </DropdownItem>
          <DropdownItem
            key="Recently"
            className="cursor-default"
            startContent={<History_Color_Icon className="size-4" id="home_filter_history" />}>
            RECENTLY USED
          </DropdownItem>
          <DropdownItem
            key="All"
            className="cursor-default"
            startContent={<Apps_Color_Icon className="size-4" id="home_filter_app_color" />}>
            ALL
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
});

export default HomeFilter;
