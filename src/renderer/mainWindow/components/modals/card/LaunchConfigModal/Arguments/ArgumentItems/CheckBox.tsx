import {ChosenArgument} from '@lynx_common/types/plugins/modules';
import {CheckSquare} from '@solar-icons/react-perf/BoldDuotone';

import ArgumentItemBase from './Base';

type Props = {
  /** The argument data */
  argument: ChosenArgument;
  /** Function to remove the argument */
  removeArg: () => void;
  /** Function to change the argument value (unused for CheckBox) */
  changeValue: (value: any) => void;
  /** The ID of the card */
  id: string;
};

/**
 * Renders a CheckBox argument item.
 * Currently, a CheckBox argument presence implies it is active.
 *
 * @returns {JSX.Element} The rendered CheckBoxArgItem component.
 */
export default function CheckBoxArgItem({argument, removeArg, id}: Props) {
  return (
    <ArgumentItemBase id={id} name={argument.name} removeArg={removeArg} icon={<CheckSquare className="size-4" />} />
  );
}
