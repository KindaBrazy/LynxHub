import {Description, Label, Surface, SurfaceProps, Switch, SwitchProps} from '@heroui-v3/react';
import SettingsSearchHighlight from '@lynx/pages/settings/SettingsSearchHighlight';
import {ReactNode, useCallback, useEffect, useState} from 'react';

type Props = {
  /** Initial enabled state for uncontrolled usage, or current state for controlled usage */
  enabled?: boolean;
  /** Callback when state changes */
  onEnabledChange?: (selected: boolean) => void;
  /** Title of the switch */
  title: string;
  /** Optional description displayed below the title */
  description?: string | ReactNode;
  isDisabled?: boolean;
  className?: string;
  size?: SwitchProps['size'];
  thumbIcon?: ReactNode;
  icon?: ReactNode;
  variant?: SurfaceProps['variant'];
};

/**
 * Customizable switch component with title, description, and search highlighting.
 * Supports both controlled and uncontrolled modes.
 */
export default function LynxSwitch({
  enabled = false,
  onEnabledChange,
  title,
  description,
  isDisabled,
  className,
  size = 'md',
  thumbIcon,
  icon,
  variant = 'default',
}: Props) {
  const [isSelected, setIsSelected] = useState<boolean>(enabled);

  useEffect(() => {
    setIsSelected(enabled);
  }, [enabled]);

  const onChange = useCallback(
    (selected: boolean) => {
      setIsSelected(selected);
      onEnabledChange?.(selected);
    },
    [onEnabledChange],
  );

  const toggle = () => {
    setIsSelected(!isSelected);
    onEnabledChange?.(!isSelected);
  };

  return (
    <Surface
      className={
        `px-3 py-2 rounded-2xl transition-colors duration-300 cursor-pointer border-2` +
        ` ${isSelected ? 'border-accent/40' : 'border-surface'} w-full`
      }
      onClick={toggle}
      variant={variant}>
      <Switch
        size={size}
        onChange={onChange}
        isDisabled={isDisabled}
        isSelected={isSelected}
        className={['size-full justify-between', className].join(' ')}>
        <Switch.Content className="flex flex-row items-center gap-x-2">
          {icon}
          <div className="flex flex-col">
            <Label className="cursor-pointer">
              <SettingsSearchHighlight text={title} className="text-sm" />
            </Label>
            <Description>
              {description &&
                (typeof description === 'string' ? (
                  <SettingsSearchHighlight text={description} className="text-tiny text-default-400" />
                ) : (
                  <div className="text-tiny text-default-400">{description}</div>
                ))}
            </Description>
          </div>
        </Switch.Content>
        <Switch.Control>
          {thumbIcon ? (
            <Switch.Thumb>
              <Switch.Icon>{thumbIcon}</Switch.Icon>
            </Switch.Thumb>
          ) : (
            <Switch.Thumb />
          )}
        </Switch.Control>
      </Switch>
    </Surface>
  );
}
