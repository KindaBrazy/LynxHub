import {useEffect} from 'react';

import {DropDownSectionType} from '../../src/App/Utils/Types';
import {getIconByName} from '../../src/assets/icons/SvgIconsContainer';

type Props = {
  addMenu: (sections: DropDownSectionType[], index?: number) => void;
};
export default function CardsAddMenu({addMenu}: Props) {
  useEffect(() => {
    const items = [
      {
        className: 'cursor-default',
        key: 'addBug',
        startContent: getIconByName('Bug'),
        title: 'Add Bug',
      },
      {
        className: 'cursor-default',
        key: 'removeBug',
        startContent: getIconByName('Trash'),
        title: 'Remove Bug',
      },
    ];

    const sections = [
      {
        key: 'Bugs',
        items,
        title: 'Bugs',
        showDivider: true,
      },
    ];

    addMenu(sections, 2);
  }, []);
  return <></>;
}
