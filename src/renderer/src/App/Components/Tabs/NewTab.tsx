import {Button} from '@heroui/react';

import {Add_Icon} from '../../../assets/icons/SvgIcons/SvgIcons1';

type Props = {addTab: () => void};
export default function NewTab({addTab}: Props) {
  return (
    <Button size="sm" variant="light" onPress={addTab} className="cursor-default mb-1" isIconOnly>
      <Add_Icon className="size-[0.9rem]" />
    </Button>
  );
}
