import XTermCore from '../../../XTermCore';

type Props = {id: string};

export default function TerminalStep({id}: Props) {
  return <XTermCore id={id} minResizeCols={0} minResizeRows={0} className="my-2 overflow-hidden" />;
}
