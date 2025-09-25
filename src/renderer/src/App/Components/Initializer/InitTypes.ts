export type CheckResult = 'unknown' | 'checking' | 'ok' | 'failed' | 'installing';
export type RowData = {result: CheckResult; label?: string};
export type ReqStatus = {
  git: string;
  pwsh: string;
  appModule: string;
};
export type ReqProps = {
  setRequirementsSatisfied: (value: boolean) => void;
  start: boolean;
  setReqStatus: (value: ReqStatus) => void;
};
