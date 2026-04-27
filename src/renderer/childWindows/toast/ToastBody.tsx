type ToastBodyProps = {
  /** The message content to display. */
  message: string;
};

/**
 * Component for the body section of the toast notification.
 * Displays the message text with scrolling if needed.
 */
export function ToastBody({message}: ToastBodyProps) {
  return (
    <div className="notDraggable h-33 overflow-hidden">
      <div className="size-full overflow-y-auto px-4 py-2">
        <span className="leading-relaxed text-muted">{message}</span>
      </div>
    </div>
  );
}
