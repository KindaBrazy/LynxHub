import {ModalHeader} from '@heroui/react';
import {Steps} from 'antd';
import {memo, useMemo} from 'react';

type Props = {
  steps: string[];
  currentStep: number;
};

const InstallHeader = ({steps, currentStep}: Props) => {
  const maxTitleWidth = useMemo(() => (steps.length > 5 ? 'max-w-16' : 'max-w-24'), [steps.length]);

  return (
    <ModalHeader className="shrink-0 overflow-hidden bg-foreground-200 shadow-md dark:bg-foreground-100">
      <Steps
        items={steps.map((step, index) => {
          return {
            title: (
              <span
                className={`block truncate text-xs ${maxTitleWidth} ${
                  index < currentStep ? 'text-foreground/40' : 'font-bold text-foreground/80'
                }`}
                title={step}>
                {step}
              </span>
            ),
          };
        })}
        size="small"
        type="default"
        current={currentStep}
        className="w-full! items-center justify-center bg-foreground-200 dark:bg-foreground-100"
      />
    </ModalHeader>
  );
};
export default memo(InstallHeader);
