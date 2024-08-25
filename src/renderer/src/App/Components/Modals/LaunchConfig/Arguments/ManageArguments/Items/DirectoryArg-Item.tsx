import {Typography} from 'antd';
import {useCallback, useState} from 'react';

import {ChosenArgument} from '../../../../../../../../../cross/CrossTypes';
import {getArgumentDefaultValue} from '../../../../../../../../../cross/GetArgumentsData';
import {useModules} from '../../../../../../Modules/ModulesContext';
import {useModalsState} from '../../../../../../Redux/AI/ModalsReducer';
import rendererIpc from '../../../../../../RendererIpc';
import ArgumentItemBase from './Argument-Item-Base';

const {Text} = Typography;

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void};

export default function DirectoryArgItem({argument, changeValue, removeArg}: Props) {
  const {id} = useModalsState('cardLaunchConfig');
  const {getArgumentsByID} = useModules();
  const [selectedDir, setSelectedDir] = useState<string>(
    argument.value || getArgumentDefaultValue(argument.name, getArgumentsByID(id)) || 'Click to choose folder...',
  );

  const changeDir = useCallback(() => {
    rendererIpc.file.openDlg('openDirectory').then(result => {
      if (result) {
        setSelectedDir(result);
        changeValue(result);
      }
    });
  }, [changeValue]);

  return (
    <ArgumentItemBase
      icon="Folder2"
      onClick={changeDir}
      name={argument.name}
      defaultCursor={false}
      removeArg={removeArg}>
      <Text className="mx-2 font-JetBrainsMono text-xs">{selectedDir}</Text>
    </ArgumentItemBase>
  );
}
