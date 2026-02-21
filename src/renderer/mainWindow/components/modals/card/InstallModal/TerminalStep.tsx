import XTermCore from '../../../XTermCore';

export interface TerminalStepProps {
  /** The unique identifier of the card/process for attaching the terminal. */
  id: string;
}

/**
 * Renders an XTerm.js terminal inside the installation modal.
 * This is used for outputting logs and running interactive or silent terminal commands during installation.
 *
 * @param {TerminalStepProps} props - The component props.
 */
export default function TerminalStep({id}: TerminalStepProps) {
  return <XTermCore id={id} minResizeCols={0} minResizeRows={0} className="my-2 overflow-hidden" />;
}
