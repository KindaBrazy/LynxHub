import {useGetArgumentsByID} from '@lynx/plugins/modules';
import {getArgumentType} from '@lynx/utils/moduleArguments';
import {ChosenArgument, ChosenArgumentsData} from '@lynx_common/types';
import {Dispatch, memo, SetStateAction, useCallback, useMemo} from 'react';

import CheckBoxArgItem from './ArgumentItems/CheckBox';
import DirectoryArgItem from './ArgumentItems/Directory';
import DropdownArgItem from './ArgumentItems/Dropdown';
import FileArgItem from './ArgumentItems/File';
import InputArgItem from './ArgumentItems/Input';

type Props = {argument: ChosenArgument; setArguments: Dispatch<SetStateAction<ChosenArgumentsData>>; id: string};

/** Display the argument manager element based on the argument type: DropDown, Input, Directory, etc. */
const ManageArgumentsItem = memo(({argument, setArguments, id}: Props) => {
  const cardArgument = useGetArgumentsByID(id);

  const removeArg = useCallback(() => {
    setArguments((prevState: ChosenArgumentsData): ChosenArgumentsData => {
      const data = prevState.data.map(arg => {
        if (arg.preset === prevState.activePreset) {
          return {
            ...arg,
            arguments: arg.arguments.filter(a => a.name !== argument.name),
          };
        }
        return arg;
      });
      return {...prevState, data: [...data]};
    });
  }, []);

  const changeValue = useCallback((value: any) => {
    setArguments((prevState: ChosenArgumentsData): ChosenArgumentsData => {
      const data = prevState.data.map(arg => {
        if (arg.preset === prevState.activePreset) {
          return {
            ...arg,
            arguments: arg.arguments.map(arg => (arg.name === argument.name ? {...arg, value} : arg)),
          };
        }
        return arg;
      });
      return {...prevState, data};
    });
  }, []);

  const renderItem = useMemo(() => {
    const Props = {argument, changeValue, removeArg};

    switch (getArgumentType(argument.name, cardArgument)) {
      case 'Directory':
        return <DirectoryArgItem {...Props} id={id} />;
      case 'File':
        return <FileArgItem {...Props} id={id} />;
      case 'Input':
        return <InputArgItem {...Props} id={id} />;
      case 'DropDown':
        return <DropdownArgItem {...Props} id={id} />;
      case 'CheckBox':
        return <CheckBoxArgItem {...Props} id={id} />;
      default:
        return null;
    }
  }, []);

  return <>{renderItem}</>;
});

export default ManageArgumentsItem;
