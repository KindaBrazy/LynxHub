import {Button} from '@heroui/react';

import {MenuDots_Icon} from '../../../assets/icons/SvgIcons/SvgIcons2';
import {Refresh3_Icon} from '../../../assets/icons/SvgIcons/SvgIcons4';
import {ArrowDuo_Icon} from '../../../assets/icons/SvgIcons/SvgIcons5';
import AddressInput from './AddressInput';

export default function TopBar() {
  return (
    <div
      className={
        'top-10 h-10 inset-x-0 absolute bg-white dark:bg-LynxRaisinBlack flex flex-row gap-x-2 px-2 py-1 items-center'
      }>
      <Button size="sm" variant="light" className="cursor-default" isIconOnly>
        <ArrowDuo_Icon className="size-4" />
      </Button>
      <Button size="sm" variant="light" className="cursor-default" isIconOnly isDisabled>
        <ArrowDuo_Icon className="size-4 rotate-180" />
      </Button>
      <Button size="sm" variant="light" className="cursor-default" isIconOnly>
        <Refresh3_Icon className="size-4" />
      </Button>
      <AddressInput address="https://github.com/KindaBrazy/LynxHub" />
      <Button size="sm" variant="light" className="cursor-default" isIconOnly>
        <MenuDots_Icon className="rotate-90 size-4" />
      </Button>
    </div>
  );
}
