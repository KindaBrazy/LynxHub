export type CheckResult = 'unknown' | 'checking' | 'ok' | 'failed' | 'installing' | 'skipped';

export type RowData = {
  result: CheckResult;
  label?: string;
};

export type RequirementStatus = {
  git: string;
  pwsh: string;
  appModule: string;
};

export type ExtensionItem = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  url: string;
};

export type FailureType = 'git' | 'pwsh' | 'appModule' | null;
