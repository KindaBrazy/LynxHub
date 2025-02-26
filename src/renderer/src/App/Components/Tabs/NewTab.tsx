import {Button} from '@heroui/react';

import {Add_Icon} from '../../../assets/icons/SvgIcons/SvgIcons1';

export default function NewTab() {
  return (
    <Button size="sm" variant="light" className="cursor-default mb-1" isIconOnly>
      <Add_Icon className="size-[0.9rem]" />
    </Button>
  );
}
