import {ChosenArgument} from '@lynx_common/types';
import {MoveToFolder} from '@solar-icons/react-perf/BoldDuotone';

import PathArgItem from './Path';

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void; id: string};

export default function DirectoryArgItem({argument, changeValue, removeArg, id}: Props) {
  return (
    <PathArgItem
      id={id}
      type="folder"
      argument={argument}
      removeArg={removeArg}
      changeValue={changeValue}
      placeholder="Click to choose folder..."
      icon={<MoveToFolder className="size-4" />}
    />
  );
}
