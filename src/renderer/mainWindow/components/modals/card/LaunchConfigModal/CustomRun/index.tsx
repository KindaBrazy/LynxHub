import {motion} from 'framer-motion';

import {tabContentVariants} from '../../ExtensionsModal/Constants';
import Behavior from './Behavior';
import Commands from './Commands';

type Props = {id: string};
export default function CustomRun({id}: Props) {
  return (
    <motion.div initial="init" animate="animate" className="space-y-5" variants={tabContentVariants}>
      <Commands id={id} />
      <Behavior id={id} />
    </motion.div>
  );
}
