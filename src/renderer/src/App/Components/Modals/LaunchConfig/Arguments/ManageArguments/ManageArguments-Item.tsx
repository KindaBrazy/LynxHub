import {Dispatch, SetStateAction, useCallback} from 'react';

import {ChosenArgument, ChosenArgumentsData} from '../../../../../../../../cross/CrossTypes';
import {getArgumentType} from '../../../../../../../../cross/GetArgumentsData';
import {getArgumentsByID} from '../../../../../Modules/ModuleLoader';
import {useModalsState} from '../../../../../Redux/AI/ModalsReducer';
import CheckBoxArgItem from './Items/CheckBoxArg-Item';
import DirectoryArgItem from './Items/DirectoryArg-Item';
import DropdownArgItem from './Items/DropdownArg-Item';
import FileArgItem from './Items/FileArg-Item';
import InputArgItem from './Items/InputArg-Item';

type Props = {argument: ChosenArgument; setArguments: Dispatch<SetStateAction<ChosenArgumentsData>>};

/** Display the argument manager element based on the argument type: DropDown, Input, Directory, etc. */
export default function ManageArgumentsItem({argument, setArguments}: Props) {
  const {id} = useModalsState('cardLaunchConfig');

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

  const Props = {argument, changeValue, removeArg};
  switch (getArgumentType(argument.name, getArgumentsByID(id))) {
    case 'Directory':
      return <DirectoryArgItem {...Props} />;
    case 'File':
      return <FileArgItem {...Props} />;
    case 'Input':
      return <InputArgItem {...Props} />;
    case 'DropDown':
      return <DropdownArgItem {...Props} />;
    case 'CheckBox':
      return <CheckBoxArgItem {...Props} />;
    default:
      return null;
  }
}
