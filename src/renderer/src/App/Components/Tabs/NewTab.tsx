import {Button} from '@heroui/react';
import {motion} from 'framer-motion';
import {useDispatch} from 'react-redux';

import {Add_Icon} from '../../../assets/icons/SvgIcons/SvgIcons';
import {tabsActions} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import {defaultTabItem} from '../../Utils/Constants';

export default function NewTab() {
  const dispatch = useDispatch<AppDispatch>();
  const addTab = () => {
    dispatch(tabsActions.addTab(defaultTabItem));
  };

  return (
    <motion.div layoutId="new_tab" transition={{duration: 0.37, type: 'spring'}} layout>
      <Button size="sm" variant="light" onPress={addTab} className="cursor-default mb-1" isIconOnly>
        <Add_Icon className="size-[0.9rem]" />
      </Button>
    </motion.div>
  );
}
