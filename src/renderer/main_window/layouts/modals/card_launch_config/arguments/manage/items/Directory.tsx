import {ChosenArgument} from '@lynx_common/types';

import {FolderDuo_Icon} from '../../../../../../../shared/assets/icons';
import PathArgItem from './Path';

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void; id: string};

export default function DirectoryArgItem({argument, changeValue, removeArg, id}: Props) {
  return (
    <PathArgItem
      id={id}
      type="folder"
      argument={argument}
      removeArg={removeArg}
      icon={<FolderDuo_Icon />}
      changeValue={changeValue}
      placeholder="Click to choose folder..."
    />
  );
}
