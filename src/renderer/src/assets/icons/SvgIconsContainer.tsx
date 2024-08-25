import {ReactElement, SVGProps} from 'react';

import {svgPack1} from './SvgIcons/SvgIcons1';
import {svgPack2} from './SvgIcons/SvgIcons2';
import {svgPack3} from './SvgIcons/SvgIcons3';
import {svgPack4} from './SvgIcons/SvgIcons4';

/*
Svg icons from:

"Solar"               ->  https://www.figma.com/community/file/1166831539721848736/solar-icons-set
"MingCute"            ->  https://github.com/Richard9394/MingCute
"Fluent UI System"    ->  https://github.com/microsoft/fluentui-system-icons
*/

export type SvgProps = SVGProps<SVGSVGElement>;

const icons = {
  ...svgPack1,
  ...svgPack2,
  ...svgPack3,
  ...svgPack4,
};

export type IconNameType = keyof typeof icons;

export const getIconByName = (name: IconNameType, props: SvgProps = {}): ReactElement | null => {
  if (name) {
    return icons[name](props);
  } else {
    return null;
  }
};
