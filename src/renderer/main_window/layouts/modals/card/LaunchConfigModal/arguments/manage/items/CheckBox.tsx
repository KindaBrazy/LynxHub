import {ChosenArgument} from '@lynx_common/types';
import {CheckSquare} from '@solar-icons/react-perf/BoldDuotone';

import ArgumentItemBase from './Base';

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void; id: string};

export default function CheckBoxArgItem({argument, removeArg, id}: Props) {
  return (
    <ArgumentItemBase id={id} name={argument.name} removeArg={removeArg} icon={<CheckSquare className="size-4" />} />
  );
}
