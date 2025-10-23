export type CheckResult = 'unknown' | 'checking' | 'ok' | 'failed' | 'installing';

export type RowData = {
  result: CheckResult;
  label?: string;
};

export type RequirementStatus = {
  git: string;
  pwsh: string;
  appModule: string;
};
