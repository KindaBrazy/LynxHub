import {Button} from '@heroui/react';
import {Power_Icon} from '@lynx_assets/icons';
import {ToastWindowMessageType} from '@lynx_common/types';
import {Refresh} from '@solar-icons/react-perf/BoldDuotone';
import {X} from 'lucide-react';

type ToastFooterProps = {
  /** The list of standard buttons to show. */
  buttons: ToastWindowMessageType['buttons'];
  /** The list of custom buttons to show. */
  customButtons: ToastWindowMessageType['customButtons'];
  /** Callbacks for button actions. */
  onClose: () => void;
  onExit: () => void;
  onRestart: () => void;
  onCustomClick: (id: string) => void;
};

/**
 * Component for the footer section of the toast notification.
 * Renders action buttons (Close, Restart, Exit) and custom buttons.
 */
export function ToastFooter({buttons, customButtons, onClose, onExit, onRestart, onCustomClick}: ToastFooterProps) {
  return (
    <div className="flex h-14 items-center justify-between border-t border-foreground-100 px-7">
      {/* Left side: Close button */}
      <div>
        {buttons?.includes('close') && (
          <Button size="sm" onPress={onClose} className="notDraggable" startContent={<X className="size-3.5" />}>
            Close Toast
          </Button>
        )}
      </div>

      {/* Right side: Action buttons */}
      <div className="flex items-center gap-3">
        {buttons?.includes('restart') && (
          <Button
            size="sm"
            color="primary"
            onPress={onRestart}
            className="notDraggable"
            startContent={<Refresh className="size-3.5" />}>
            Restart LynxHub
          </Button>
        )}

        {buttons?.includes('exit') && (
          <Button
            size="sm"
            color="danger"
            onPress={onExit}
            className="notDraggable"
            startContent={<Power_Icon className="size-3.5" />}>
            Exit LynxHub
          </Button>
        )}

        {customButtons?.map(btn => (
          <Button
            size="sm"
            key={btn.id}
            onPress={() => onCustomClick(btn.id)}
            color={btn.color === 'default' ? 'default' : btn.color} // Map 'default' color correctly if needed by HeroUI, though 'default' is usually valid
            className={`notDraggable ${btn.cursor === 'default' ? 'cursor-default' : ''}`}>
            {btn.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
