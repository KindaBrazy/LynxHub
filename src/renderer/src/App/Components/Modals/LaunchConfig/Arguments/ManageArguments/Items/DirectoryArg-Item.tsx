import {ChosenArgument} from '../../../../../../../../../cross/CrossTypes';
import {FolderDuo_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import PathArgItem from './PathArgItem';

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
