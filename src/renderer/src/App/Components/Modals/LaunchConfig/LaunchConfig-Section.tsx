import {Button, Card, CardBody, CardHeader} from '@heroui/react';
import {isEmpty, isString} from 'lodash';
import {ReactNode} from 'react';

import {Add_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import LynxTooltip from '../../Reusable/LynxTooltip';

type Props = {
  children: ReactNode;
  title: ReactNode;
  description?: string;
  onAddPress?: () => void;
  addTooltipTitle?: string;
  customButton?: ReactNode;
};

/** Display card containing configurations */
export default function LaunchConfigSection({
  children,
  title,
  description,
  onAddPress,
  addTooltipTitle,
  customButton,
}: Props) {
  return (
    <Card className="bg-foreground-100">
      <CardHeader className="px-4 flex-col items-start">
        <div className="flex w-full flex-row items-center justify-between">
          {isString(title) ? <span>{title}</span> : title}
          {customButton || (
            <LynxTooltip content={addTooltipTitle} isEssential>
              <Button size="sm" variant="light" onPress={onAddPress} isIconOnly>
                <Add_Icon />
              </Button>
            </LynxTooltip>
          )}
        </div>
        {!isEmpty(description) && <span className="text-sm font-normal text-foreground-500">{description}</span>}
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}
