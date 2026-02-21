import {Variants} from 'framer-motion';

export const tabContentVariants: Variants = {
  animate: {opacity: 1, scale: 1, transition: {duration: 0.2}},
  init: {opacity: 0, scale: 0.97},
};

export const extensionsColumns = [
  {key: 'name', label: 'Name'},
  {key: 'size', label: 'Size'},
  {key: 'update', label: 'Update Status'},
  {key: 'remove', label: 'Remove'},
  {key: 'disable', label: 'Disable'},
];
