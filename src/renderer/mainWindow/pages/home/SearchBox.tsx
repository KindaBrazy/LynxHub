import { Input } from '@heroui/react';
import { Circle_Icon } from '@lynx_assets/icons';
import { Dispatch, memo, SetStateAction } from 'react';

/**
 * Props for the HomeSearchBox component.
 */
interface HomeSearchBoxProps {
  /** The current value of the search input field. */
  searchValue: string;
  /** State dispatcher function for updating the search string. */
  setSearchValue: Dispatch<SetStateAction<string>>;
}

/**
 * Provide a lightweight UI input component for filtering and searching specific interface cards on the Home view.
 *
 * @param {HomeSearchBoxProps} props The current search state and its mutation dispatch.
 * @returns {JSX.Element} The search input element.
 */
const HomeSearchBox = memo(({ searchValue, setSearchValue }: HomeSearchBoxProps) => {
  return (
    <Input
      classNames={{
        inputWrapper:
          'dark:bg-[#202020] dark:hover:bg-LynxNearBlack dark:group-data-[focus=true]:bg-LynxRaisinBlack ' +
          'bg-stone-50 transition! duration-300! overflow-hidden border border-foreground/10 shadow-md ' +
          'dark:border-foreground/5',
      }}
      radius="full"
      type="search"
      spellCheck="false"
      value={searchValue}
      onValueChange={setSearchValue}
      placeholder="Search interfaces..."
      startContent={<Circle_Icon className="size-4" />}
      fullWidth
    />
  );
});

export default HomeSearchBox;
