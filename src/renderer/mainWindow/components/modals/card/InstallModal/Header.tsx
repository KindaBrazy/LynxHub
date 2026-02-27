import {ModalHeader} from '@heroui/react';
import {memo, useMemo} from 'react';

import StepProgress from './StepProgress';

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
  const stepItems = useMemo(() => steps.map((step, index) => ({key: index, title: step})), [steps]);

  return (
    <ModalHeader className="shrink-0 overflow-hidden bg-foreground-100 shadow-sm">
      <div className="flex w-full justify-center">
        <StepProgress
          items={stepItems}
          current={currentStep}
          orientation="horizontal"
          titleClassName={maxTitleWidth}
          className="max-w-full"
        />
      </div>
    </ModalHeader>
  );
};

export default memo(InstallHeader);
