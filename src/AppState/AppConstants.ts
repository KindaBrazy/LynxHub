import chalk from 'chalk';
import colors from 'colors/safe';
import {Variants} from 'framer-motion';
import exp from 'constants';

/* Styled Logging in the main process */
// Chalk red text style
export const MainLogError = chalk.hex('#e74c3c');
// Chalk orange text style
export const MainLogWarning = chalk.hex('#e67e22');
// Chalk green text style
export const MainLogInfo = chalk.hex('#2ecc71');
// Chalk gray text style
export const MainLogDebug = chalk.hex('#34495e');

/* Styled Logging in the renderer process */
// Colors red text style
export const RendererLogError = colors.red;
// Colors yellow text style
export const RendererLogWarning = colors.yellow;
// Colors green text style
export const RendererLogInfo = colors.green;
// Colors gray text style
export const RendererLogDebug = colors.gray;

// Default installation directories
export const DefaultWebUiDir: string = '\\WebUi';
// Stable Diffusion Directory
export const DefaultImageGenerateDir: string = `${DefaultWebUiDir}\\ImageGenerate`;
export const DefaultTextGenerateDir: string = `${DefaultWebUiDir}\\TextGenerate`;

/* WebUi Locations */

// AUTOMATIC1111 Repository WebUi Directory
export const DefaultA1Dir: string = `${DefaultImageGenerateDir}\\AUTOMATIC1111`;
// LSHQQYTIGER Repository WebUi Directory
export const DefaultLSHDir: string = `${DefaultImageGenerateDir}\\LSHQQYTIGER`;
export const DefaultComfyDir: string = `${DefaultImageGenerateDir}\\COMFYANONYMOUS`;
export const DefaultOOBADir: string = `${DefaultTextGenerateDir}\\OOBABOOGA`;
export const DefaultRSXDir: string = `${DefaultTextGenerateDir}\\OOBABOOGA`;

/* Shadow styles */

export const NoShadow: string = '0px 0px 0px 0px rgba(0,0,0,0)';
export const SidebarShadow: string = 'inset 0px 0px 5px 0px rgba(0,0,0,0.2)';

// Lynx blue filter style
export const BlueCssFilter: string =
  'brightness(0) saturate(100%) invert(24%) sepia(87%) saturate(3067%) hue-rotate(238deg) brightness(89%) contrast(101%)';

// Lynx purple filter style
export const PurpleCssFilter: string =
  'brightness(0) saturate(100%) invert(10%) sepia(86%) saturate(7499%) hue-rotate(276deg) brightness(106%) contrast(116%)';

/**
 * Generate Raisin Black color in rgba format
 * @param {number} alpha - The alpha value for the color. Default is 1.
 * @returns {string} The rgba color string.
 */
export function getLynxRaisinBlack(alpha: number = 1): string {
  return `rgba(33,33,33,${alpha})`;
}

/**
 * Generate Lynx Blue color in rgba format
 * @param {number} alpha - The alpha value for the color. Default is 1.
 * @returns {string} The rgba color string.
 */
export function getLynxBlue(alpha: number = 1): string {
  return `rgb(73,66,228,${alpha})`;
}

/**
 * Generate Lynx Purple color in rgba format
 * @param {number} alpha - The alpha value for the color. Default is 1.
 * @returns {string} The rgba color string.
 */
export function getLynxPurple(alpha: number = 1): string {
  return `rgb(148,0,255,${alpha})`;
}

/**
 * Generate White color in rgba format
 * @param {number} alpha - The alpha value for the color. Default is 1.
 * @returns {string} The rgba color string.
 */
export function getWhite(alpha: number = 1): string {
  return `rgba(255,255,255,${alpha})`;
}

/**
 * Generate White color in rgba format
 * @param {number} alpha - The alpha value for the color. Default is 1.
 * @returns {string} The rgba color string.
 */
export function getWhiteSecond(alpha: number = 1): string {
  return `rgba(246,246,246,${alpha})`;
}

/**
 * Generate White color in rgba format
 * @param {number} alpha - The alpha value for the color. Default is 1.
 * @returns {string} The rgba color string.
 */
export function getWhiteThird(alpha: number = 1): string {
  return `rgba(236,236,236,${alpha})`;
}

/**
 * Generate White color in rgba format
 * @param {number} alpha - The alpha value for the color. Default is 1.
 * @returns {string} The rgba color string.
 */
export function getWhiteFourth(alpha: number = 1): string {
  return `rgba(225,225,225,${alpha})`;
}

/**
 * Generate White color in rgba format
 * @param {number} alpha - The alpha value for the color. Default is 1.
 * @returns {string} The rgba color string.
 */
export function getWhiteFifth(alpha: number = 1): string {
  return `rgba(208,208,208,${alpha})`;
}

/**
 * Generate Black color in rgba format
 * @param {number} alpha - The alpha value for the color. Default is 1.
 * @returns {string} The rgba color string.
 */
export function getBlack(alpha: number = 1): string {
  return `rgba(0,0,0,${alpha})`;
}

export type SideBarButtonId = {
  Image: number;
  Text: number;
  Audio: number;
  Settings: number;
};

export const sideBarButtonId: SideBarButtonId = {
  Image: 0,
  Text: 1,
  Audio: 2,
  Settings: 9,
};

export function getTotalPagesNumber(): number {
  return Object.keys(sideBarButtonId).length;
}

export function getSidebarButtonId(Button: 'sideBarPicture' | 'sideBarText' | 'sideBarAudio' | 'sideBarSetting' | string) {
  switch (Button) {
    case 'sideBarPicture':
      return sideBarButtonId.Image;
    case 'sideBarText':
      return sideBarButtonId.Text;
    case 'sideBarAudio':
      return sideBarButtonId.Audio;
    case 'sideBarSetting':
      return sideBarButtonId.Settings;
    default:
      return sideBarButtonId.Image;
  }
}

// Type for repository addresses
type WebUiInfo = {
  ImageGenerate: {
    StableDiffusion: {
      AUTOMATIC1111: {
        name: string;
        address: string;
      };
      LSHQQYTIGER: {
        name: string;
        address: string;
      };
      COMFYANONYMOUS: {
        name: string;
        address: string;
      };
    };
  };
  TextGenerate: {
    OOBABOOGA: {
      name: string;
      address: string;
    };
  };
  AudioGenerate: {
    RSXDALV: {
      name: string;
      address: string;
    };
  };
};

// Object of repository addresses
export const webUiInfo: WebUiInfo = {
  ImageGenerate: {
    StableDiffusion: {
      AUTOMATIC1111: {name: 'AUTOMATIC1111', address: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui'},
      LSHQQYTIGER: {name: 'LSHQQYTIGER', address: 'https://github.com/lshqqytiger/stable-diffusion-webui-directml'},
      COMFYANONYMOUS: {name: 'COMFYANONYMOUS', address: 'https://github.com/comfyanonymous/ComfyUI'},
    },
  },
  TextGenerate: {OOBABOOGA: {name: 'OOBABOOGA', address: 'https://github.com/oobabooga/text-generation-webui'}},
  AudioGenerate: {RSXDALV: {name: 'RSXDALV', address: 'https://github.com/rsxdalv/one-click-installers-tts'}},
};

export function getWebUiUrlByName(uiName: string) {
  switch (uiName) {
    case 'AUTOMATIC1111':
      return webUiInfo.ImageGenerate.StableDiffusion.AUTOMATIC1111.address;
    case 'LSHQQYTIGER':
      return webUiInfo.ImageGenerate.StableDiffusion.LSHQQYTIGER.address;
    case 'COMFYANONYMOUS':
      return webUiInfo.ImageGenerate.StableDiffusion.COMFYANONYMOUS.address;
    case 'OOBABOOGA':
      return webUiInfo.TextGenerate.OOBABOOGA.address;
    case 'RSXDALV':
      return webUiInfo.AudioGenerate.RSXDALV.address;
    default:
      return '';
  }
}

export function getWebUiCatgeoryByName(uiName: string) {
  switch (uiName) {
    case 'AUTOMATIC1111':
      return 'Stable Diffusion';
    case 'LSHQQYTIGER':
      return 'Stable Diffusion';
    case 'COMFYANONYMOUS':
      return 'Modular Stable Diffusion';
    case 'OOBABOOGA':
      return 'Text Generation';
    case 'RSXDALV':
      return 'TTS Generation';
    default:
      return '';
  }
}

export type WebuiList = {
  AUTOMATIC1111: boolean;
  LSHQQYTIGER: boolean;
  COMFYANONYMOUS: boolean;
  OOBABOOGA: boolean;
  RSXDALV: boolean;
};
