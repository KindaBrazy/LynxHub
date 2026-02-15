import {ChosenArgument} from '@lynx_common/types';
import {File} from '@solar-icons/react-perf/BoldDuotone';

import PathArgItem from './Path';

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void; id: string};

export default function FileArgItem({argument, changeValue, removeArg, id}: Props) {
  return (
    <PathArgItem
      id={id}
      type="file"
      argument={argument}
      removeArg={removeArg}
      changeValue={changeValue}
      icon={<File className="size-4" />}
      placeholder="Click to choose file..."
    />
  );
}
