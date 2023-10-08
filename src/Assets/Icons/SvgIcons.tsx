/* eslint-disable */
import {ReactElement, SVGProps} from 'react';

type SvgProps = SVGProps<SVGSVGElement>;

export function MinimizeIcon(props: SvgProps): ReactElement {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
      <path fill="current" d="M2 6a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 2 6Z" />
    </svg>
  );
}

export function MaximizeIcon(props: SvgProps): ReactElement {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill="current"
        d="M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6Z"
      />
    </svg>
  );
}

export function CloseIcon(props: SvgProps): ReactElement {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
      <path
        fill="current"
        d="M116 128V48a12 12 0 0 1 24 0v80a12 12 0 0 1-24 0Zm66.55-82a12 12 0 0 0-13.1 20.1C191.41 80.37 204 103 204 128a76 76 0 0 1-152 0c0-25 12.59-47.63 34.55-61.95A12 12 0 0 0 73.45 46C44.56 64.78 28 94.69 28 128a100 100 0 0 0 200 0c0-33.31-16.56-63.22-45.45-82Z"
      />
    </svg>
  );
}

export function SimpleArrow(props: SvgProps): ReactElement {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <path
        fill="current"
        d="M104.704 685.248a64 64 0 0 0 90.496 0l316.8-316.8l316.8 316.8a64 64 0 0 0 90.496-90.496L557.248 232.704a64 64 0 0 0-90.496 0L104.704 594.752a64 64 0 0 0 0 90.496z"
      />
    </svg>
  );
}

export function SimpleClose(props: SvgProps): ReactElement {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <path
        fill="current"
        d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504L738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512L828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496L285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512L195.2 285.696a64 64 0 0 1 0-90.496z"
      />
    </svg>
  );
}

export function ThreeDots(props: SvgProps): ReactElement {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="current" d="M7 12a2 2 0 1 1-4 0a2 2 0 0 1 4 0Zm7 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0Zm7 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0Z" />
    </svg>
  );
}

export function PlayIcon(props: SvgProps): ReactElement {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <path
        fill="current"
        d="M12.225 4.462C9.89 3.142 7 4.827 7 7.508V24.5c0 2.682 2.892 4.367 5.226 3.045l14.997-8.498c2.367-1.341 2.366-4.751 0-6.091L12.224 4.462Z"
      />
    </svg>
  );
}

export function StopFilled(props: SvgProps): ReactElement {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="current" d="M8 6h8c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2z" />
    </svg>
  );
}

export function ReloadIcon(props: SvgProps): ReactElement {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <g fill="none" stroke="current" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <path d="M19.933 13.041a8 8 0 1 1-9.925-8.788c3.899-1 7.935 1.007 9.425 4.747" />
        <path d="M20 4v5h-5" />
      </g>
    </svg>
  );
}

export function TickIcon(props: SvgProps): ReactElement {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <path fill="none" stroke="current" strokeLinecap="round" strokeLinejoin="round" strokeWidth="current" d="m2.75 8.75l3.5 3.5l7-7.5" />
    </svg>
  );
}

export function FilterIcon(props: SvgProps): ReactElement {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill="current"
        stroke="current"
        strokeWidth="2"
        d="M18 4H6c-1.105 0-2.026.91-1.753 1.98a8.018 8.018 0 0 0 4.298 5.238c.823.394 1.455 1.168 1.455 2.08v6.084a1 1 0 0 0 1.447.894l2-1a1 1 0 0 0 .553-.894v-5.084c0-.912.632-1.686 1.454-2.08a8.017 8.017 0 0 0 4.3-5.238C20.025 4.91 19.103 4 18 4z"
      />
    </svg>
  );
}

export function SearchIcon(props: SvgProps): ReactElement {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill="current"
        fillRule="evenodd"
        d="M11 2a9 9 0 1 0 5.618 16.032l3.675 3.675a1 1 0 0 0 1.414-1.414l-3.675-3.675A9 9 0 0 0 11 2Zm-6 9a6 6 0 1 1 12 0a6 6 0 0 1-12 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function LightMode(props: SvgProps): ReactElement {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill="current"
        d="M12 17q-2.075 0-3.538-1.463T7 12q0-2.075 1.463-3.538T12 7q2.075 0 3.538 1.463T17 12q0 2.075-1.463 3.538T12 17ZM2 13q-.425 0-.713-.288T1 12q0-.425.288-.713T2 11h2q.425 0 .713.288T5 12q0 .425-.288.713T4 13H2Zm18 0q-.425 0-.713-.288T19 12q0-.425.288-.713T20 11h2q.425 0 .713.288T23 12q0 .425-.288.713T22 13h-2Zm-8-8q-.425 0-.713-.288T11 4V2q0-.425.288-.713T12 1q.425 0 .713.288T13 2v2q0 .425-.288.713T12 5Zm0 18q-.425 0-.713-.288T11 22v-2q0-.425.288-.713T12 19q.425 0 .713.288T13 20v2q0 .425-.288.713T12 23ZM5.65 7.05L4.575 6q-.3-.275-.288-.7t.288-.725q.3-.3.725-.3t.7.3L7.05 5.65q.275.3.275.7t-.275.7q-.275.3-.687.288T5.65 7.05ZM18 19.425l-1.05-1.075q-.275-.3-.275-.713t.275-.687q.275-.3.688-.287t.712.287L19.425 18q.3.275.288.7t-.288.725q-.3.3-.725.3t-.7-.3ZM16.95 7.05q-.3-.275-.288-.687t.288-.713L18 4.575q.275-.3.7-.288t.725.288q.3.3.3.725t-.3.7L18.35 7.05q-.3.275-.7.275t-.7-.275ZM4.575 19.425q-.3-.3-.3-.725t.3-.7l1.075-1.05q.3-.275.712-.275t.688.275q.3.275.288.688t-.288.712L6 19.425q-.275.3-.7.288t-.725-.288Z"
      />
    </svg>
  );
}

export function DarkMode(props: SvgProps): ReactElement {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill="current"
        d="M11.01 3.05C6.51 3.54 3 7.36 3 12a9 9 0 0 0 9 9c4.63 0 8.45-3.5 8.95-8c.09-.79-.78-1.42-1.54-.95A5.403 5.403 0 0 1 11.1 7.5c0-1.06.31-2.06.84-2.89c.45-.67-.04-1.63-.93-1.56z"
      />
    </svg>
  );
}
