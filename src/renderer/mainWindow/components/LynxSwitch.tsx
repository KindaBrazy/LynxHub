import {Description, Surface, SurfaceProps, Switch, SwitchProps} from '@heroui/react';
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
        `px-3 py-2 rounded-2xl transition-colors duration-300 ${isDisabled ? '' : 'cursor-pointer'} border-2` +
        ` ${isSelected ? 'border-accent/40' : 'border-surface'} w-full shadow-surface`
      }
      variant={variant}
      onClick={isDisabled ? undefined : toggle}>
      <Switch
        size={size}
        onChange={onChange}
        isDisabled={isDisabled}
        isSelected={isSelected}
        className={['', className].join(' ')}>
        <Switch.Content className="flex flex-row items-center justify-between w-full gap-x-2">
          <div>
            <div className="flex flex-row items-center gap-x-2">
              {icon}
              <span className="text-sm cursor-pointer">
                <SettingsSearchHighlight text={title} />
              </span>
            </div>
            {description && (
              <Description className="pointer-events-none p-0">
                {typeof description === 'string' ? (
                  <SettingsSearchHighlight text={description} className="text-xs text-muted" />
                ) : (
                  <div className="text-xs text-muted">{description}</div>
                )}
              </Description>
            )}
          </div>
          <Switch.Control>
            {thumbIcon ? (
              <Switch.Thumb>
                <Switch.Icon>{thumbIcon}</Switch.Icon>
              </Switch.Thumb>
            ) : (
              <Switch.Thumb />
            )}
          </Switch.Control>
        </Switch.Content>
      </Switch>
    </Surface>
  );
}
