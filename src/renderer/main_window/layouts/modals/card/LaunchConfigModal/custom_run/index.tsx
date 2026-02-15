import {tabContentVariants} from '@lynx/layouts/modals/card/ExtensionsModal/Constants';
import {motion} from 'framer-motion';

import CustomRunBehavior from './Behavior';
import CustomRunCommands from './Commands';

type Props = {id: string};
export default function CustomRun({id}: Props) {
  return (
    <motion.div initial="init" animate="animate" className="space-y-5" variants={tabContentVariants}>
      <CustomRunCommands id={id} />
      <CustomRunBehavior id={id} />
    </motion.div>
  );
}
