import {CardInfoCallback, CardInfoDescriptions} from '../../../src/cross/plugin/ModuleTypes';

export let isWin: boolean = true;

async function isWinOS(): Promise<boolean> {
  if (typeof window !== 'undefined' && window.osPlatform) {
    isWin = window.osPlatform === 'win32';
  } else if (typeof process !== 'undefined') {
    const result = await import('os');
    isWin = result.platform() === 'win32';
  }

  return isWin;
}

isWinOS();

export function formatSize(size: number | undefined): string {
  if (!size) return '0KB';
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

export class DescriptionManager {
  description: CardInfoDescriptions;
  callback: CardInfoCallback;

  constructor(description: CardInfoDescriptions, callback: CardInfoCallback) {
    this.description = description;
    this.callback = callback;
    this.callback.setDescription(description);
  }

  public updateItem(sectionIndex: number, itemIndex: number, value: string | 'loading' | undefined | null) {
    if (this.description) {
      this.description[sectionIndex].items[itemIndex].result = value;
      this.callback.setDescription([...this.description]);
    }
  }
}

export function extractGitUrl(url: string): {owner: string; repo: string; platform: 'github' | 'gitlab'} {
  // Regular expression to match GitHub and GitLab repository URLs with or without protocol
  const gitRepoRegex = /^(https?:\/\/)?(www\.)?(github|gitlab)\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/;
  const match = url.match(gitRepoRegex);

  if (!match) {
    throw new Error(`Invalid Git repository URL: ${url}`);
  }

  const [, , , platform, owner, repo] = match;
  return {owner, repo, platform: platform as 'github' | 'gitlab'};
}

export function removeAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

export function getCdCommand(dirPath: string): string {
  const escapedPath = dirPath.replace(/ /g, '\\ ');
  const quotedPath = `"${dirPath}"`;

  if (isWin) {
    return `cd ${quotedPath}`;
  } else {
    return `cd ${escapedPath}`;
  }
}

export function getVenvPythonPath(venvPath: string): string {
  return isWin ? `${venvPath}\\Scripts\\python.exe` : `${venvPath}/bin/python`;
}
