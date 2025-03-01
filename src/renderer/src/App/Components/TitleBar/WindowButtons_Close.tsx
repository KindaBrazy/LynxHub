import {Button, Checkbox, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {Typography} from 'antd';
import {motion} from 'framer-motion';
import {useCallback, useState} from 'react';
import {isHotkeyPressed} from 'react-hotkeys-hook';
import {useDispatch} from 'react-redux';

import {Power_Icon} from '../../../assets/icons/SvgIcons/SvgIcons2';
import {settingsActions, useSettingsState} from '../../Redux/Reducer/SettingsReducer';
import {useActivePage} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import {isLinuxPortable} from '../../Utils/UtilHooks';

type Props = {
  buttonProps: any;
  commonStyles: string;
};

export default function WindowButtons_Close({buttonProps, commonStyles}: Props) {
  const activePage = useActivePage();
  const showCloseConfirm = useSettingsState('closeConfirm');
  const dispatch = useDispatch<AppDispatch>();

  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const restart = useCallback(() => rendererIpc.win.changeWinState('restart'), []);
  const close = useCallback(() => rendererIpc.win.changeWinState('close'), []);

  const onClick = () => {
    rendererIpc.storage.update('app', {lastPage: activePage});
    if (isHotkeyPressed('control') || !showCloseConfirm) {
      close();
    } else if (!isConfirmOpen) {
      setIsConfirmOpen(true);
    }
  };

  const onShowConfirm = useCallback(
    (enabled: boolean) => {
      rendererIpc.storage.update('app', {closeConfirm: !enabled});
      dispatch(settingsActions.setSettingsState({key: 'closeConfirm', value: !enabled}));
    },
    [dispatch],
  );

  return (
    <Popover
      onClick={e => {
        // @ts-expect-error
        if (e.target.dataset.slot === 'backdrop') {
          setIsConfirmOpen(false);
        }
      }}
      backdrop="opaque"
      placement="bottom-end"
      isOpen={isConfirmOpen}
      onOpenChange={setIsConfirmOpen}
      classNames={{base: 'before:dark:bg-LynxRaisinBlack', backdrop: '!top-10'}}
      showArrow>
      <PopoverTrigger>
        <motion.button
          {...buttonProps}
          type="button"
          onClick={onClick}
          className={`${commonStyles} pl-3 pr-[1rem] hover:bg-danger`}>
          <Power_Icon className="size-[0.8rem]" />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent className="py-4 px-8 dark:bg-LynxRaisinBlack">
        <span className="self-start text-medium font-semibold">Confirm Exit</span>
        <div className="mt-2 flex flex-col space-y-1">
          <Typography.Text>Are you sure you want to exit the application?</Typography.Text>
          <Checkbox size="sm" onValueChange={onShowConfirm}>
            Always exit without confirmation
          </Checkbox>
        </div>
        <div className="mt-2 flex w-full flex-row justify-between">
          <Button
            onPress={() => {
              setIsConfirmOpen(false);
            }}
            size="sm"
            color="success">
            Stay
          </Button>
          <div className="space-x-2">
            {!isLinuxPortable && (
              <Button size="sm" color="warning" onPress={restart}>
                Restart
              </Button>
            )}
            <Button size="sm" color="danger" onPress={close}>
              Exit
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
