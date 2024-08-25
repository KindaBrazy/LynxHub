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

export default function FileArgItem({argument, changeValue, removeArg}: Props) {
  const {id} = useModalsState('cardLaunchConfig');
  const {getArgumentsByID} = useModules();
  const [selectedFile, setSelectedFile] = useState(
    argument.value || getArgumentDefaultValue(argument.name, getArgumentsByID(id)) || 'Click to choose file...',
  );

  const changeDir = useCallback(() => {
    rendererIpc.file.openDlg('openFile').then(result => {
      if (result) {
        setSelectedFile(result);
        changeValue(result);
      }
    });
  }, [changeValue]);

  return (
    <ArgumentItemBase icon="File" onClick={changeDir} name={argument.name} defaultCursor={false} removeArg={removeArg}>
      <Text className="mx-2 font-JetBrainsMono text-xs">{selectedFile}</Text>
    </ArgumentItemBase>
  );
}
