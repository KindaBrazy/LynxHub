import {Button} from '@heroui/react';
import {tabsActions} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {defaultTabItem} from '@lynx/utils/constants';
import {motion} from 'framer-motion';
import {Plus} from 'lucide-react';
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
        <Plus className="size-4" />
      </Button>
    </motion.div>
  );
});

export default NewTab;
