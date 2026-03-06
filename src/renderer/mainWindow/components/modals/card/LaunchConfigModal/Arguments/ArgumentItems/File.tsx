import {ChosenArgument} from '@lynx_common/types/plugins/modules';
import {File} from '@solar-icons/react-perf/BoldDuotone';

import PathArgItem from './Path';

type Props = {
  /** The argument data */
  argument: ChosenArgument;
  /** Function to remove the argument */
  removeArg: () => void;
  /** Function to change the argument value */
  changeValue: (value: any) => void;
  /** The ID of the card */
  id: string;
};

/**
 * Renders a File argument item.
 * Uses PathArgItem with type="file" to allow selecting files.
 *
 * @returns {JSX.Element} The rendered FileArgItem component.
 */
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
