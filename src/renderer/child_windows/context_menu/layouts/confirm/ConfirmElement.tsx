import {Checkbox} from '@heroui/react';
import rendererIpc from '@lynx/ipc';
import {ConfirmMenuTypes} from '@lynx_cross/types';
import {ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {memo, ReactNode, useEffect, useState} from 'react';

type Props = {
  title: string;
  enabledTitle: string;
  confirmName: ConfirmMenuTypes;
  buttons: ReactNode;
};
const ConfirmElement = memo(({title, enabledTitle, confirmName, buttons}: Props) => {
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const onShowConfirm = (enabled: boolean) => {
    rendererIpc.storageUtils.setShowConfirm(confirmName, !enabled);
    setShowConfirm(enabled);
  };

  useEffect(() => {
    rendererIpc.storage.get('app').then(appConfig => {
      setShowConfirm(!appConfig[confirmName]);
    });
  }, []);

  return (
    <div className="py-4 px-5" key="terminate_ai_confirm">
      <div className="flex flex-row items-center justify-start gap-x-2">
        <ShieldWarning className="text-warning size-7" />
        <span className="text-medium font-semibold">{title}</span>
      </div>

      <Checkbox size="sm" className="my-1" isSelected={showConfirm} onValueChange={onShowConfirm}>
        {enabledTitle}
      </Checkbox>

      <div className="flex w-full flex-row justify-between">{buttons}</div>
    </div>
  );
});

export default ConfirmElement;
