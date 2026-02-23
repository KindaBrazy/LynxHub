import type {SVGProps} from 'react';

/**
 * Generic SVG props for icon components that do not require unique IDs.
 */
export type SvgProps = SVGProps<SVGSVGElement>;

/**
 * SVG props for icons that define gradients/defs and need a stable unique `id`
 * to avoid collisions when multiple instances are rendered on the same page.
 */
export type GradientSvgProps = SvgProps & {id: string};
