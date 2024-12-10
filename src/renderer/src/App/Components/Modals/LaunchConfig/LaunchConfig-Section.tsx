import {Button} from '@nextui-org/react';
import {Card} from 'antd';
import {isEmpty} from 'lodash';
import {ReactNode} from 'react';

import {Add_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons1';
import LynxTooltip from '../../Reusable/LynxTooltip';

type Props = {
  children: ReactNode;
  title: string;
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
    <Card
      title={
        <div className="flex w-full flex-col py-3">
          <div className="flex w-full flex-row items-center justify-between">
            <span>{title}</span>
            {customButton || (
              <LynxTooltip content={addTooltipTitle} isEssential>
                <Button size="sm" variant="light" onPress={onAddPress} className="cursor-default" isIconOnly>
                  <Add_Icon />
                </Button>
              </LynxTooltip>
            )}
          </div>
          {!isEmpty(description) && <span className="text-sm font-normal text-foreground-500">{description}</span>}
        </div>
      }
      bordered={false}
      className="border-2 border-foreground/5 bg-default-100">
      {children}
    </Card>
  );
}
