import {ReactNode} from 'react';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';

type Props = {
  children: ReactNode;
  extraClassName?: string;
  replaceClassName?: string;
};
export default function LScrollBar({children, extraClassName, replaceClassName}: Props) {
  return (
    <OverlayScrollbarsComponent
      options={{overflow: {x: 'hidden', y: 'scroll'}, scrollbars: {autoHide: 'scroll', autoHideSuspend: true}}}
      element="div"
      className={replaceClassName !== '' ? replaceClassName : ['h-full w-full', extraClassName].join(' ')}>
      {children}
    </OverlayScrollbarsComponent>
  );
}
LScrollBar.defaultProps = {
  extraClassName: '',
  replaceClassName: '',
};
