import {FileDuo_Icon} from '@lynx_assets/icons';
import {ChosenArgument} from '@lynx_common/types';

import PathArgItem from './Path';

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void; id: string};

export default function FileArgItem({argument, changeValue, removeArg, id}: Props) {
  return (
    <PathArgItem
      id={id}
      type="file"
      argument={argument}
      removeArg={removeArg}
      icon={<FileDuo_Icon />}
      changeValue={changeValue}
      placeholder="Click to choose file..."
    />
  );
}
