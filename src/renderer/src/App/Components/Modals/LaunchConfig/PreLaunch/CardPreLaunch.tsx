import {motion} from 'framer-motion';

import {tabContentVariants} from '../../CardExtensions/Constants';
import PreOpenPath from './PreOpenPath/PreOpenPath';
import PreTerminalCommands from './PreTerminalCommands/PreTerminalCommands';

/** Pre-launch configuration: terminal commands and paths to open */
export default function CardPreLaunch() {
  return (
    <motion.div initial="init" animate="animate" className="space-y-5" variants={tabContentVariants}>
      <PreTerminalCommands />
      <PreOpenPath />
    </motion.div>
  );
}
