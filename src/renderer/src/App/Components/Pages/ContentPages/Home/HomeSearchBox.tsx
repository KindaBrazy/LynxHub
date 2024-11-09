import {Input} from '@nextui-org/react';
import {Dispatch, memo, SetStateAction} from 'react';

import {getIconByName} from '../../../../../assets/icons/SvgIconsContainer';

type Props = {searchValue: string; setSearchValue: Dispatch<SetStateAction<string>>};

const HomeSearchBox = memo(({searchValue, setSearchValue}: Props) => {
  return (
    <Input
      classNames={{
        inputWrapper:
          'dark:bg-[#292929] dark:hover:bg-[#2f2f2f] bg-stone-50 ' +
          ' shadow-md overflow-hidden border border-foreground/10 dark:border-foreground/5',
      }}
      radius="full"
      type="search"
      spellCheck={false}
      value={searchValue}
      onValueChange={setSearchValue}
      placeholder="Type to find AI..."
      startContent={getIconByName('Circle', {className: 'size-5'})}
      fullWidth
    />
  );
});

export default HomeSearchBox;
