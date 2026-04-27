import {motion} from 'framer-motion';

import {tabContentVariants} from '../../ExtensionsModal/Constants';
import PreOpenPath from './OpenPath';
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
