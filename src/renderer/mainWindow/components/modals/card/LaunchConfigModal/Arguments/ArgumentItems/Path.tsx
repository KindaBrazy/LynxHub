import {Button, Tooltip} from '@heroui/react';
import {ChosenArgument} from '@lynx_common/types/plugins/modules';
import filesIpc from '@lynx_shared/ipc/files';
import {Restart} from '@solar-icons/react-perf/BoldDuotone';
import {ReactNode, useCallback, useEffect, useMemo, useState} from 'react';

import {useGetArgumentsByID} from '../../../../../../plugins/modules';
import {useCardsState} from '../../../../../../redux/reducers/cards';
import {getArgumentDefaultValue} from '../../../../../../utils/moduleArguments';
import ArgumentItemBase from './Base';
import AutoCompletePath from './Path_AutoComplete';

type PathArgItemProps = {
  /** Type of the path: file or folder */
  type: 'file' | 'folder';
  /** Icon to display */
  icon: ReactNode;
  /** Placeholder text */
  placeholder: string;
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
 * Component for handling path arguments (files or folders).
 * Supports both absolute paths (via system dialog) and relative paths (via autocomplete).
 */
export default function PathArgItem({type, icon, placeholder, argument, changeValue, removeArg, id}: PathArgItemProps) {
  const installedCards = useCardsState('installedCards');
  const cardArgument = useGetArgumentsByID(id);

  const [selectedValue, setSelectedValue] = useState(
    argument.value || getArgumentDefaultValue(argument.name, cardArgument) || placeholder,
  );
  const [isRelative, setIsRelative] = useState<boolean>(false);
  const [rotateEffect, setRotateEffect] = useState<boolean>(false);

  const setPath = (value: string | undefined) => {
    if (!value) return;

    setSelectedValue(value);
    changeValue(value);
  };

  // Initialize isRelative based on current value
  useEffect(() => {
    if (argument.value) {
      const isDefaultRelative = argument.value.toString().startsWith('.') || argument.value.toString().startsWith('/');
      setIsRelative(isDefaultRelative);
    }
  }, [argument.value]);

  const baseDir = useMemo(() => {
    return installedCards.find(card => card.id === id)?.dir;
  }, [installedCards, id]);

  const openDialog = useCallback(() => {
    if (!isRelative) {
      const properties: ('openFile' | 'openDirectory')[] = type === 'file' ? ['openFile'] : ['openDirectory'];
      filesIpc.openDlg({properties}).then(setPath);
    }
  }, [changeValue, isRelative, type]);

  const changePathType = useCallback(() => {
    setIsRelative(prevState => {
      // If switching modes and we have a valid path, try to convert it
      if (baseDir && selectedValue && selectedValue !== placeholder) {
        // If currently relative (prevState=true), we want absolute.
        // If currently absolute (prevState=false), we want relative.
        const method = prevState ? 'getAbsolutePath' : 'getRelativePath';
        filesIpc[method](baseDir, selectedValue).then(result => {
          setSelectedValue(result);
          changeValue(result);
        });
      }
      return !prevState;
    });
    setRotateEffect(true);
  }, [baseDir, selectedValue, placeholder, changeValue]);

  return (
    <ArgumentItemBase
      extra={
        baseDir ? (
          <Tooltip delay={800} content={`Change to ${isRelative ? 'Absolute' : 'Relative'}`} showArrow>
            <Button size="sm" variant="light" onPress={changePathType} aria-label="Toggle path type" isIconOnly>
              <Restart
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
        <AutoCompletePath
          type={type}
          baseDir={baseDir!}
          onValueChange={setPath}
          defaultValue={selectedValue !== placeholder ? selectedValue : undefined}
        />
      ) : (
        <span className="text-xs dark:bg-LynxRaisinBlack bg-LynxWhiteThird p-3 rounded-medium block truncate">
          {selectedValue}
        </span>
      )}
    </ArgumentItemBase>
  );
}
