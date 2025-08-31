type SetKeys = 'installing' | 'updating' | 'unInstalling';
type ManageOperation = 'add' | 'remove';
type IdType = string | string[] | undefined;

export type ExtensionPageState = {
  installing: Set<string>;
  updating: Set<string>;
  unInstalling: Set<string>;

  manageSet: (key: SetKeys, id: IdType, operation: ManageOperation) => void;
  getHasId: (key: SetKeys, id: IdType) => boolean;
};
