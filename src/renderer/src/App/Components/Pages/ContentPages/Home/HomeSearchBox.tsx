import {Input} from '@nextui-org/react';
import {Dispatch, memo, SetStateAction} from 'react';

import {getIconByName} from '../../../../../assets/icons/SvgIconsContainer';

type Props = {searchValue: string; setSearchValue: Dispatch<SetStateAction<string>>};

const HomeSearchBox = memo(({searchValue, setSearchValue}: Props) => {
  return (
    <Input
      radius="md"
      type="search"
      spellCheck={false}
      value={searchValue}
      onValueChange={setSearchValue}
      placeholder="Type to find AI..."
      startContent={getIconByName('Circle', {className: 'size-5'})}
      classNames={{inputWrapper: 'dark:bg-LynxRaisinBlack dark:hover:bg-white/5 bg-stone-50 shadow-md overflow-hidden'}}
      fullWidth
    />
  );
});

export default HomeSearchBox;
