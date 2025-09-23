import {Button} from '@heroui/react';
import {Tooltip} from 'antd';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {ChosenArgument} from '../../../../../../../../../cross/CrossTypes';
import {getArgumentDefaultValue} from '../../../../../../../../../cross/GetArgumentsData';
import {FileDuo_Icon, RefreshDuo_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import {useGetArgumentsByID} from '../../../../../../Modules/ModuleLoader';
import {useCardsState} from '../../../../../../Redux/Reducer/CardsReducer';
import rendererIpc from '../../../../../../RendererIpc';
import ArgumentItemBase from './Argument-Item-Base';
import AutoCompletePath from './AutoCompletePath';

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void; id: string};

export default function FileArgItem({argument, changeValue, removeArg, id}: Props) {
  const installedCards = useCardsState('installedCards');
  const cardArgument = useGetArgumentsByID(id);
  const [selectedFile, setSelectedFile] = useState(
    argument.value || getArgumentDefaultValue(argument.name, cardArgument) || 'Click to choose file...',
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
      rendererIpc.file.openDlg({properties: ['openFile']}).then(result => {
        if (result) {
          setSelectedFile(result);
          changeValue(result);
        }
      });
    }
  }, [changeValue, isRelative]);

  const changeType = useCallback(() => {
    setIsRelative(prevState => {
      if (baseDir && selectedFile && selectedFile !== 'Click to choose file...') {
        rendererIpc.file[prevState ? 'getAbsolutePath' : 'getRelativePath'](baseDir, selectedFile).then(result => {
          setSelectedFile(result);
          changeValue(result);
        });
      }
      return !prevState;
    });
    setRotateEffect(true);
  }, [setIsRelative, setRotateEffect, baseDir, selectedFile]);

  return (
    <ArgumentItemBase
      extra={
        <Tooltip color="#111111" title={`Change to ${isRelative ? 'Absolute' : 'Relative'}`}>
          <Button size="sm" variant="light" onPress={changeType} isIconOnly>
            <RefreshDuo_Icon
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
      icon={<FileDuo_Icon />}
      defaultCursor={isRelative}>
      {isRelative ? (
        <AutoCompletePath type="file" baseDir={baseDir!} defaultValue={selectedFile} onValueChange={changeValue} />
      ) : (
        <span className="text-xs dark:bg-LynxRaisinBlack bg-LynxWhiteThird p-3 rounded-medium">{selectedFile}</span>
      )}
    </ArgumentItemBase>
  );
}
