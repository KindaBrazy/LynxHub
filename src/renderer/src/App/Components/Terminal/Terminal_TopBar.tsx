import {Button} from '@heroui/react';

import {Stop_Icon, Web_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';

export default function Terminal_TopBar() {
  return (
    <div
      className={
        'h-10 inset-x-0 top-0 absolute bg-white dark:bg-LynxRaisinBlack' +
        ' flex flex-row gap-x-2 px-2 py-1 items-center justify-between'
      }>
      <div></div>
      <div></div>
      <div className="flex flex-row gap-x-2">
        <Button size="sm" variant="light" className="cursor-default">
          <Web_Icon className="size-4" />
        </Button>
        <Button size="sm" variant="light" className="cursor-default" isIconOnly>
          <Stop_Icon className="size-4 text-danger" />
        </Button>
      </div>
    </div>
  );
}
