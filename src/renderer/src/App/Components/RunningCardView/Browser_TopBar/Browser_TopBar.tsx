import {Button, Tooltip} from '@heroui/react';

import {LYNXHUB_HOMEPAGE} from '../../../../../../cross/CrossConstants';
import {HomeSmile_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons2';
import {Terminal_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons3';
import {Refresh3_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons4';
import {ArrowDuo_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons5';
import AddressInput from './AddressInput';

export default function Browser_TopBar() {
  return (
    <div
      className={
        'h-10 inset-x-0 top-0 absolute bg-white dark:bg-LynxRaisinBlack flex flex-row gap-x-2 px-2 py-1 items-center'
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
      <AddressInput address={LYNXHUB_HOMEPAGE} />
      <Tooltip
        delay={300}
        content="Terminal"
        classNames={{content: 'bg-foreground-200', base: 'before:bg-foreground-200'}}
        showArrow>
        <Button size="sm" variant="light" className="cursor-default">
          <Terminal_Icon className="size-4" />
        </Button>
      </Tooltip>
      <Tooltip
        delay={300}
        placement="bottom-end"
        content="WebUI Address"
        classNames={{content: 'bg-foreground-200', base: 'before:bg-foreground-200'}}
        showArrow>
        <Button size="sm" variant="light" className="cursor-default" isIconOnly>
          <HomeSmile_Icon className="size-4" />
        </Button>
      </Tooltip>
    </div>
  );
}
