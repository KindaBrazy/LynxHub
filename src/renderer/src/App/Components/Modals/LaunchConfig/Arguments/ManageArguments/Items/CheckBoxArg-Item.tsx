import {ChosenArgument} from '../../../../../../../../../cross/CrossTypes';
import {CheckBox_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import ArgumentItemBase from './Argument-Item-Base';

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void; id: string};

export default function CheckBoxArgItem({argument, removeArg, id}: Props) {
  return <ArgumentItemBase id={id} name={argument.name} removeArg={removeArg} icon={<CheckBox_Icon />} />;
}
