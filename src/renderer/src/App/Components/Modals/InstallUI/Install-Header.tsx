import {ModalHeader} from '@heroui/react';
import {Steps} from 'antd';
import {memo} from 'react';

type Props = {
  steps: string[];
  currentStep: number;
};

const InstallHeader = ({steps, currentStep}: Props) => {
  return (
    <ModalHeader className="shrink-0 overflow-hidden bg-foreground-200 shadow-md dark:bg-foreground-100">
      <Steps
        items={steps.map((step, index) => {
          return {
            title: (
              <span className={`${index < currentStep ? 'text-foreground/40' : 'font-bold text-foreground/80'}`}>
                {step}
              </span>
            ),
          };
        })}
        type="inline"
        current={currentStep}
        className="!w-full scale-125 items-center justify-center bg-foreground-200 dark:bg-foreground-100"
      />
    </ModalHeader>
  );
};
export default memo(InstallHeader);
