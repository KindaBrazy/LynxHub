import {tabContentVariants} from '@lynx/layouts/modals/cardExtensions/Constants';
import {motion} from 'framer-motion';

import PreOpenPath from './open_path';
import PreTerminalCommands from './TerminalCommands';

type Props = {id: string};
export default function CardPreLaunch({id}: Props) {
  return (
    <motion.div initial="init" animate="animate" className="space-y-5" variants={tabContentVariants}>
      <PreTerminalCommands id={id} />
      <PreOpenPath id={id} />
    </motion.div>
  );
}
