import {ReactElement} from 'react';

import {SvgProps} from '../../src/assets/icons/SvgIconsContainer';

/* eslint max-len: 0 */

export function ExternalDuo_Icon(props: SvgProps): ReactElement {
  return (
    <svg {...props} height="1rem" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        opacity="0.5"
        fill="currentColor"
        d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12"
      />
      <path
        clipRule="evenodd"
        fillRule="evenodd"
        fill="currentColor"
        d="M12.47 11.53a.75.75 0 0 1 0-1.06l7.72-7.72h-3.534a.75.75 0 0 1 0-1.5H22a.75.75 0 0 1 .75.75v5.344a.75.75 0 0 1-1.5 0V3.81l-7.72 7.72a.75.75 0 0 1-1.06 0"
      />
    </svg>
  );
}
