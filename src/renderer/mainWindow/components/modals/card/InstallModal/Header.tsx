import {ModalHeader} from '@heroui/react';
import {Steps} from 'antd';
import {memo, useMemo} from 'react';

export interface InstallHeaderProps {
  /** An array of string labels representing the installation steps. */
  steps: string[];
  /** The 0-indexed integer of the currently active step. */
  currentStep: number;
}

/**
 * Renders the header of the installation modal, including a stepper visualizing the process.
 *
 * @param {InstallHeaderProps} props - The component props.
 */
const InstallHeader = ({steps, currentStep}: InstallHeaderProps) => {
  const maxTitleWidth = useMemo(() => (steps.length > 5 ? 'max-w-16' : 'max-w-24'), [steps.length]);

  return (
    <ModalHeader className="shrink-0 overflow-hidden bg-foreground-100 shadow-sm">
      <Steps
        items={steps.map((step, index) => ({
          title: (
            <span
              className={`block truncate text-xs ${maxTitleWidth} ${
                index < currentStep ? 'text-foreground/40' : 'font-bold text-foreground/80'
              }`}
              title={step}>
              {step}
            </span>
          ),
        }))}
        size="small"
        type="default"
        current={currentStep}
        className="w-full! items-center justify-center"
      />
    </ModalHeader>
  );
};

export default memo(InstallHeader);
