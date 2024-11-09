import {ReactElement} from 'react';

import {SvgProps} from '../SvgIconsContainer';

export const svgPackColor = {
  History_Color: (props: SvgProps): ReactElement => (
    <svg {...props} width="1em" height="1em" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <g fill="none">
        <path
          fill="url(#fluentColorHistory200)"
          d="M10 5.5a1 1 0 0 1 1 1V9h1.5a1 1 0 1 1 0 2H10a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1"
        />
        <path
          d="M6.031 5.5A6 6 0 1 1 4 10a1 1 0 0 0-2 0a8 8 0 1 0 2.5-5.81V
          3a1 1 0 0 0-2 0v3A1.5 1.5 0 0 0 4 7.5h3a1 1 0 0 0 0-2z"
          fill="url(#fluentColorHistory201)"
        />
        <defs>
          <linearGradient
            x1="8.156"
            y1="16.45"
            x2="20.094"
            y2="11.414"
            id="fluentColorHistory200"
            gradientUnits="userSpaceOnUse">
            <stop stopColor="#d373fc" />
            <stop offset="1" stopColor="#6d37cd" />
          </linearGradient>
          <linearGradient
            x1="2"
            x2="6.295"
            y1="2.941"
            y2="20.923"
            id="fluentColorHistory201"
            gradientUnits="userSpaceOnUse">
            <stop stopColor="#0fafff" />
            <stop offset="1" stopColor="#0067bf" />
          </linearGradient>
        </defs>
      </g>
    </svg>
  ),

  Pin_Color: (props: SvgProps): ReactElement => (
    <svg {...props} width="1em" height="1em" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <g fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="url(#fluentColorPin200)"
          d="M8.03 11.97a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 0 1-1.06-1.06l3.75-3.75a.75.75 0 0 1 1.06 0"
        />
        <path
          d="M13.325 2.618a2 2 0 0 0-3.203.52L8.393 6.596a1.5 1.5 0 0 1-.784.722l-3.59
           1.436a1 1 0 0 0-.336 1.636l5.927 5.927a1 1 0 0 0 1.636-.335l1.436-3.59a1.5 1
           .5 0 0 1 .722-.785l3.458-1.73a2 2 0 0 0 .52-3.202z"
          fill="url(#fluentColorPin201)"
        />
        <path
          d="M13.325 2.618a2 2 0 0 0-3.203.52L8.393 6.596a1.5 1.5 0 0 1-.784.722l-3.59
           1.436a1 1 0 0 0-.336 1.636l5.927 5.927a1 1 0 0 0 1.636-.335l1.436-3.59a1.5 1
           .5 0 0 1 .722-.785l3.458-1.73a2 2 0 0 0 .52-3.202z"
          fillOpacity="0.8"
          fill="url(#fluentColorPin202)"
        />
        <defs>
          <linearGradient
            x1="4.313"
            x2="11.096"
            y1="15.687"
            y2="10.279"
            id="fluentColorPin200"
            gradientUnits="userSpaceOnUse">
            <stop offset=".114" stopColor="#7b7bff" />
            <stop offset=".559" stopColor="#102784" />
          </linearGradient>
          <linearGradient
            x1="3.91"
            y1="4.765"
            x2="13.971"
            y2="15.218"
            id="fluentColorPin201"
            gradientUnits="userSpaceOnUse">
            <stop stopColor="#43e5ca" />
            <stop offset="1" stopColor="#1384b1" />
          </linearGradient>
          <radialGradient
            r="1"
            cx="0"
            cy="0"
            id="fluentColorPin202"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(4.37154 4.78393 -12.00179 10.9672 14.648 13.731)">
            <stop stopColor="#e362f8" />
            <stop offset="1" stopOpacity="0" stopColor="#96f" />
          </radialGradient>
        </defs>
      </g>
    </svg>
  ),

  Apps_Color: (props: SvgProps): ReactElement => (
    <svg {...props} width="1em" height="1em" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <g fill="none">
        <path
          fill="url(#fluentColorApps160)"
          d="M2 4.5A1.5 1.5 0 0 1 3.5 3h3A1.5 1.5 0 0 1 8 4.5V8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"
        />
        <path
          fill="url(#fluentColorApps161)"
          d="M11.5 8A1.5 1.5 0 0 1 13 9.5v3a1.5 1.5 0 0 1-1.5 1.5H8a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
        />
        <path
          fill="url(#fluentColorApps162)"
          d="M8 13a1 1 0 0 1-1 1H3.5A1.5 1.5 0 0 1 2 12.5V9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1z"
        />
        <path
          d="M9.69 2.442a1.5 1.5 0 0 1 2.122 0l1.752 1.752a1.5 1.5 0 0 1 0 2
          .121l-1.75 1.75a1.5 1.5 0 0 1-2.12 0L7.942 6.311a1.5 1.5 0 0 1 0-2.121z"
          fill="url(#fluentColorApps163)"
        />
        <defs>
          <linearGradient x1="2" x2="8" y1="3" y2="9" id="fluentColorApps160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#b9c0c7" />
            <stop offset="1" stopColor="#889096" />
          </linearGradient>
          <linearGradient y2="8" x1="13" x2="7.429" y1="13.571" id="fluentColorApps161" gradientUnits="userSpaceOnUse">
            <stop stopColor="#63686e" />
            <stop offset="1" stopColor="#889096" />
          </linearGradient>
          <linearGradient x1="2" x2="8" y1="8" y2="11.857" id="fluentColorApps162" gradientUnits="userSpaceOnUse">
            <stop stopColor="#55595e" />
            <stop offset="1" stopColor="#383b3d" />
          </linearGradient>
          <linearGradient
            y1="7.06"
            x2="9.178"
            y2="2.471"
            x1="12.898"
            id="fluentColorApps163"
            gradientUnits="userSpaceOnUse">
            <stop stopColor="#2764e7" />
            <stop offset="1" stopColor="#36dff1" />
          </linearGradient>
        </defs>
      </g>
    </svg>
  ),
};
