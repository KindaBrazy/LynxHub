import {Button} from '@nextui-org/react';
import {useCardsState} from '@renderer/App/Redux/AI/CardsReducer';
import {getIconByName} from '@renderer/assets/icons/SvgIconsContainer';
import {Tooltip, Typography} from 'antd';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {ChosenArgument} from '../../../../../../../../../cross/CrossTypes';
import {getArgumentDefaultValue} from '../../../../../../../../../cross/GetArgumentsData';
import {useModules} from '../../../../../../Modules/ModulesContext';
import {useModalsState} from '../../../../../../Redux/AI/ModalsReducer';
import rendererIpc from '../../../../../../RendererIpc';
import ArgumentItemBase from './Argument-Item-Base';
import AutoCompletePath from './AutoCompletePath';

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void};

export default function FileArgItem({argument, changeValue, removeArg}: Props) {
  const {id} = useModalsState('cardLaunchConfig');
  const installedCards = useCardsState('installedCards');
  const {getArgumentsByID} = useModules();
  const [selectedFile, setSelectedFile] = useState(
    argument.value || getArgumentDefaultValue(argument.name, getArgumentsByID(id)) || 'Click to choose file...',
  );
  const [isRelative, setIsRelative] = useState<boolean>(false);
  const [rotateEffect, setRotateEffect] = useState<boolean>(false);

  useEffect(() => {
    if (argument.value && !isRelative) {
      const isDefaultRelative = argument.value.startsWith('.') || argument.value.startsWith('/');
      setIsRelative(isDefaultRelative);
    }
  }, [argument]);

  const baseDir = useMemo(() => {
    return installedCards.find(card => card.id === id)?.dir;
  }, [installedCards, id]);

  const changeDir = useCallback(() => {
    if (!isRelative) {
      rendererIpc.file.openDlg('openFile').then(result => {
        if (result) {
          setSelectedFile(result);
          changeValue(result);
        }
      });
    }
  }, [changeValue, isRelative]);

  const changeType = useCallback(() => {
    setIsRelative(prevState => !prevState);
    setRotateEffect(true);
  }, [setIsRelative, setRotateEffect]);

  return (
    <ArgumentItemBase
      extra={
        <Tooltip color="#111111" title={`Change to ${isRelative ? 'Absolute' : 'Relative'}`}>
          <Button size="sm" variant="light" onPress={changeType} className={`my-1 cursor-default`} isIconOnly>
            {getIconByName('Refresh', {
              className: `${rotateEffect && 'animate-[spin_0.5s]'}`,
              onAnimationEnd: () => setRotateEffect(false),
            })}
          </Button>
        </Tooltip>
      }
      icon="Folder2"
      onClick={changeDir}
      name={argument.name}
      removeArg={removeArg}
      defaultCursor={isRelative}>
      {isRelative ? (
        <AutoCompletePath type="file" baseDir={baseDir!} defaultValue={selectedFile} onValueChange={changeValue} />
      ) : (
        <Typography.Text className="mx-2 font-JetBrainsMono text-xs">{selectedFile}</Typography.Text>
      )}
    </ArgumentItemBase>
  );
}
