import {RefObject} from 'react';

import XTermCore, {XTermAPI} from '../../../../XTermCore';

export interface TerminalStepProps {
  /** The unique identifier of the card/process for attaching the terminal. */
  id: string;
  xtermRef: RefObject<XTermAPI | null>;
}

/**
 * Renders an XTerm.js terminal inside the installation modal.
 * This is used for outputting logs and running interactive or silent terminal commands during installation.
 *
 * @param {TerminalStepProps} props - The component props.
 */
export default function TerminalStep({id, xtermRef}: TerminalStepProps) {
  const onReady = (api: XTermAPI) => {
    xtermRef.current = api;
  };

  return <XTermCore id={id} onReady={onReady} minResizeCols={0} minResizeRows={0} className="my-2 overflow-hidden" />;
}
