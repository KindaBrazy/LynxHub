import {Button} from '@heroui/react';
import {Tooltip} from 'antd';
import {ReactNode, useCallback, useEffect, useMemo, useState} from 'react';

import {ChosenArgument} from '../../../../../../../../../cross/CrossTypes';
import {getArgumentDefaultValue} from '../../../../../../../../../cross/GetArgumentsData';
import {RefreshDuo_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import {useGetArgumentsByID} from '../../../../../../Modules/ModuleLoader';
import {useCardsState} from '../../../../../../Redux/Reducer/CardsReducer';
import rendererIpc from '../../../../../../RendererIpc';
import ArgumentItemBase from './Argument-Item-Base';
import AutoCompletePath from './AutoCompletePath';

type PathArgItemProps = {
  type: 'file' | 'folder';
  icon: ReactNode;
  placeholder: string;
  argument: ChosenArgument;
  removeArg: () => void;
  changeValue: (value: any) => void;
  id: string;
};

export default function PathArgItem({type, icon, placeholder, argument, changeValue, removeArg, id}: PathArgItemProps) {
  const installedCards = useCardsState('installedCards');
  const cardArgument = useGetArgumentsByID(id);

  const [selectedValue, setSelectedValue] = useState(
    argument.value || getArgumentDefaultValue(argument.name, cardArgument) || placeholder,
  );
  const [isRelative, setIsRelative] = useState<boolean>(false);
  const [rotateEffect, setRotateEffect] = useState<boolean>(false);

  useEffect(() => {
    if (argument.value) {
      const isDefaultRelative = argument.value.startsWith('.') || argument.value.startsWith('/');
      setIsRelative(isDefaultRelative);
    }
  }, [argument.value]);

  const baseDir = useMemo(() => {
    return installedCards.find(card => card.id === id)?.dir;
  }, [installedCards, id]);

  const openDialog = useCallback(() => {
    if (!isRelative) {
      const properties: ('openFile' | 'openDirectory')[] = type === 'file' ? ['openFile'] : ['openDirectory'];
      rendererIpc.file.openDlg({properties}).then(result => {
        if (result) {
          setSelectedValue(result);
          changeValue(result);
        }
      });
    }
  }, [changeValue, isRelative, type]);

  const changePathType = useCallback(() => {
    setIsRelative(prevState => {
      if (baseDir && selectedValue && selectedValue !== placeholder) {
        rendererIpc.file[prevState ? 'getAbsolutePath' : 'getRelativePath'](baseDir, selectedValue).then(result => {
          setSelectedValue(result);
          changeValue(result);
        });
      }
      return !prevState;
    });
    setRotateEffect(true);
  }, [setIsRelative, setRotateEffect, baseDir, selectedValue, placeholder, changeValue]);

  return (
    <ArgumentItemBase
      extra={
        baseDir ? (
          <Tooltip color="#111111" title={`Change to ${isRelative ? 'Absolute' : 'Relative'}`}>
            <Button size="sm" variant="light" onPress={changePathType} isIconOnly>
              <RefreshDuo_Icon
                onAnimationEnd={() => setRotateEffect(false)}
                className={`${rotateEffect && 'animate-[spin_0.5s]'}`}
              />
            </Button>
          </Tooltip>
        ) : undefined
      }
      id={id}
      icon={icon}
      onClick={openDialog}
      name={argument.name}
      removeArg={removeArg}
      defaultCursor={isRelative}>
      {isRelative ? (
        <AutoCompletePath type={type} baseDir={baseDir!} onValueChange={changeValue} defaultValue={selectedValue} />
      ) : (
        <span className="text-xs dark:bg-LynxRaisinBlack bg-LynxWhiteThird p-3 rounded-medium">{selectedValue}</span>
      )}
    </ArgumentItemBase>
  );
}
