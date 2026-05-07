import {ModalHeader, ModalHeading} from '@heroui/react';
import {InitialSteps} from '@lynx_common/types/plugins/modules';
import {memo, useMemo} from 'react';

import StepProgress from './StepProgress';

export interface InstallHeaderProps {
  /** An array of string labels representing the installation steps. */
  steps: InitialSteps;
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
    <ModalHeader>
      <ModalHeading>
        <div className="flex w-full justify-center">
          <StepProgress
            steps={steps}
            current={currentStep}
            className="max-w-full"
            orientation="horizontal"
            titleClassName={maxTitleWidth}
          />
        </div>
      </ModalHeading>
    </ModalHeader>
  );
};

export default memo(InstallHeader);
