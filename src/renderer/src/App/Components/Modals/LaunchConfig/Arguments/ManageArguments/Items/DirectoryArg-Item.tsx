import {Button} from '@heroui/react';
import {Tooltip, Typography} from 'antd';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {ChosenArgument} from '../../../../../../../../../cross/CrossTypes';
import {getArgumentDefaultValue} from '../../../../../../../../../cross/GetArgumentsData';
import {Folder2_Icon, Refresh_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import {useGetArgumentsByID} from '../../../../../../Modules/ModuleLoader';
import {useCardsState} from '../../../../../../Redux/Reducer/CardsReducer';
import rendererIpc from '../../../../../../RendererIpc';
import ArgumentItemBase from './Argument-Item-Base';
import AutoCompletePath from './AutoCompletePath';

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void; id: string};

export default function DirectoryArgItem({argument, changeValue, removeArg, id}: Props) {
  const installedCards = useCardsState('installedCards');

  const cardArgument = useGetArgumentsByID(id);

  const [selectedDir, setSelectedDir] = useState<string>(
    argument.value || getArgumentDefaultValue(argument.name, cardArgument) || 'Click to choose folder...',
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
      rendererIpc.file.openDlg({properties: ['openDirectory']}).then(result => {
        if (result) {
          setSelectedDir(result);
          changeValue(result);
        }
      });
    }
  }, [changeValue, isRelative]);

  const changeType = useCallback(() => {
    setIsRelative(prevState => {
      if (baseDir && selectedDir && selectedDir !== 'Click to choose file...') {
        rendererIpc.file[prevState ? 'getAbsolutePath' : 'getRelativePath'](baseDir, selectedDir).then(result => {
          setSelectedDir(result);
          changeValue(result);
        });
      }
      return !prevState;
    });
    setRotateEffect(true);
  }, [setIsRelative, setRotateEffect, baseDir, selectedDir]);

  return (
    <ArgumentItemBase
      extra={
        <Tooltip color="#111111" title={`Change to ${isRelative ? 'Absolute' : 'Relative'}`}>
          <Button size="sm" variant="light" onPress={changeType} className={`my-1 cursor-default`} isIconOnly>
            <Refresh_Icon
              onAnimationEnd={() => setRotateEffect(false)}
              className={`${rotateEffect && 'animate-[spin_0.5s]'}`}
            />
          </Button>
        </Tooltip>
      }
      id={id}
      onClick={changeDir}
      name={argument.name}
      removeArg={removeArg}
      icon={<Folder2_Icon />}
      defaultCursor={isRelative}>
      {isRelative ? (
        <AutoCompletePath type="folder" baseDir={baseDir!} defaultValue={selectedDir} onValueChange={changeValue} />
      ) : (
        <Typography.Text className="mx-2 font-JetBrainsMono text-xs">{selectedDir}</Typography.Text>
      )}
    </ArgumentItemBase>
  );
}
