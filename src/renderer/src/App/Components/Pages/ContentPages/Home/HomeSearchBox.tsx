import {Input} from '@heroui/react';
import {Dispatch, memo, SetStateAction} from 'react';

import {Circle_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons1';

type Props = {searchValue: string; setSearchValue: Dispatch<SetStateAction<string>>};

const HomeSearchBox = memo(({searchValue, setSearchValue}: Props) => {
  return (
    <Input
      classNames={{
        inputWrapper:
          'dark:bg-[#23242578] dark:hover:bg-[#232425de] dark:group-data-[focus=true]:bg-[#232425]' +
          ' bg-stone-50 !transition !duration-300 shadow-md overflow-hidden border border-foreground/10' +
          ' dark:border-foreground/5',
      }}
      radius="full"
      type="search"
      spellCheck="false"
      value={searchValue}
      onValueChange={setSearchValue}
      placeholder="Type to find AI..."
      startContent={<Circle_Icon className="size-5" />}
      fullWidth
    />
  );
});

export default HomeSearchBox;
