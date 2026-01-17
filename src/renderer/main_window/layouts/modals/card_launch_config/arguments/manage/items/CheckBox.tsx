import {ChosenArgument} from '@lynx_cross/types';

import {CheckSquareDuo_Icon} from '../../../../../../../shared/assets/icons';
import ArgumentItemBase from './Base';

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void; id: string};

export default function CheckBoxArgItem({argument, removeArg, id}: Props) {
  return (
    <ArgumentItemBase
      id={id}
      name={argument.name}
      removeArg={removeArg}
      icon={<CheckSquareDuo_Icon className="size-4" />}
    />
  );
}
