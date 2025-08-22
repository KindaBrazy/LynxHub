import {motion} from 'framer-motion';

import {tabContentVariants} from '../../CardExtensions/Constants';
import CustomRunBehavior from './CustomRunBehavior';
import CustomRunCommands from './CustomRunCommands';

type Props = {id: string};
export default function CustomRun({id}: Props) {
  return (
    <motion.div initial="init" animate="animate" className="space-y-5" variants={tabContentVariants}>
      <CustomRunCommands id={id} />
      <CustomRunBehavior id={id} />
    </motion.div>
  );
}
