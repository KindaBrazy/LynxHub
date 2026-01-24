import {Button} from '@heroui/react';
import {tabsActions} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {defaultTabItem} from '@lynx/utils/constants';
import {Add_Icon} from '@lynx_assets/icons';
import {motion} from 'framer-motion';
import {memo} from 'react';
import {useDispatch} from 'react-redux';

const NewTab = memo(() => {
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
});

export default NewTab;
