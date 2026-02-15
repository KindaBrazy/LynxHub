import {Input} from '@heroui/react';
import {Circle_Icon} from '@lynx_assets/icons';
import {Dispatch, memo, SetStateAction} from 'react';

type Props = {searchValue: string; setSearchValue: Dispatch<SetStateAction<string>>};

const HomeSearchBox = memo(({searchValue, setSearchValue}: Props) => {
  return (
    <Input
      classNames={{
        inputWrapper:
          'dark:bg-[#202020] dark:hover:bg-LynxNearBlack dark:group-data-[focus=true]:bg-LynxRaisinBlack' +
          ' bg-stone-50 transition! duration-300! shadow-md overflow-hidden border border-foreground/10' +
          ' dark:border-foreground/5',
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
