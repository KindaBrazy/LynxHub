import {motion} from 'framer-motion';

import {tabContentVariants} from '../../CardExtensions/Constants';
import CustomRunCommands from './CustomRunCommands';

/** Custom commands page */
export default function CustomRun() {
  return (
    <motion.div initial="init" animate="animate" className="space-y-5" variants={tabContentVariants}>
      <CustomRunCommands />
    </motion.div>
  );
}
