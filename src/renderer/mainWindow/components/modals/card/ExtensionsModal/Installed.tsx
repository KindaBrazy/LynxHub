import {getKeyValue, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/react';
import {validateGitRepoUrl} from '@lynx_common/utils';
import filesIpc from '@lynx_shared/ipc/files';
import gitIpc from '@lynx_shared/ipc/git';
import utilsIpc from '@lynx_shared/ipc/utils';
import {motion} from 'framer-motion';
import {filter, find, isEmpty, startCase} from 'lodash';
import {
  Dispatch,
  forwardRef,
  Key,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {useDispatch} from 'react-redux';

import {AppDispatch} from '../../../../redux/store';
import {lynxTopToast} from '../../../../utils/hooks';
import {
  emptyTableElement,
  extensionsColumns,
  loadingTableElement,
  tabContentVariants,
  useRowElements,
} from './Constants';
import {InstalledExtensionsTable} from './types';

type Props = {
  visible: boolean;
  updatesAvailable: string[];
  setUpdatesAvailable: Dispatch<SetStateAction<string[]>>;
  setIsUpdatingAll: Dispatch<SetStateAction<boolean>>;
  setInstalledExtensions: Dispatch<SetStateAction<string[]>>;
  dir: string;
  isOpen: boolean;
};

/**
 * Table displaying installed extensions with update, remove, and disable functionality.
 */
const Installed = forwardRef<{updateAll: () => void; getExtensions: () => void}, Props>(
  ({setIsUpdatingAll, setUpdatesAvailable, updatesAvailable, visible, setInstalledExtensions, dir, isOpen}, ref) => {
    const [deleteModalStates, setDeleteModalStates] = useState<Map<string, boolean>>(new Map());
    const [rows, setRows] = useState<InstalledExtensionsTable[]>([]);
    const [isTableEmpty, setIsTableEmpty] = useState(false);
    const [emptyContent, setEmptyContent] = useState<ReactNode>(loadingTableElement);
    const [loadUpdateStatus, setLoadUpdateStatus] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    // Toggle delete confirmation modal for a specific extension
    const toggleDeleteModal = useCallback((name: string, isOpen: boolean) => {
      setDeleteModalStates(prev => new Map(prev).set(name, isOpen));
    }, []);

    // Update specific properties of a row by extension name
    const updateRowState = useCallback((name: string, updates: Partial<InstalledExtensionsTable>) => {
      setRows(prev => prev.map(row => (row.key === name ? {...row, ...updates} : row)));
    }, []);

    // Delete or move extension to trash
    const handleDeleteExtension = useCallback(
      (name: string, type: 'removeDir' | 'trashDir') => {
        toggleDeleteModal(name, false);

        filesIpc[type](`${dir}/${name}`)
          .then(() => {
            const action = type === 'removeDir' ? 'removed' : 'moved to trash';
            lynxTopToast(dispatch).success(`${name} extension ${action} successfully.`);
            setRows(prev => filter(prev, row => row.key !== name));
          })
          .catch(() => {
            const action = type === 'removeDir' ? 'remove' : 'move to trash';
            lynxTopToast(dispatch).error(`Error: Unable to ${action} the folder.`);
          });
      },
      [dir, dispatch, toggleDeleteModal],
    );

    // Toggle extension enabled/disabled state
    const handleDisableExtension = useCallback(
      (isDisabled: boolean, targetDir: string, name: string) => {
        updateRowState(name, {disable: useRowElements.disableBtn.disable});

        utilsIpc
          .disableExtension(!isDisabled, targetDir)
          .then(resultDir => {
            updateRowState(name, {
              disable: useRowElements.disableBtn.enabled(!isDisabled, () =>
                handleDisableExtension(!isDisabled, resultDir, name),
              ),
            });
          })
          .catch(() => {
            const action = isDisabled ? 'enabling' : 'disabling';
            lynxTopToast(dispatch).error(`Something went wrong when ${action} extension.`);
          });
      },
      [dispatch, updateRowState],
    );

    // Update a single extension via git pull
    const updateExtension = useCallback(
      async (name: string): Promise<void> => {
        const extDir = `${dir}/${name}`;
        const pullId = `${name}_pull`;

        updateRowState(name, {update: useRowElements.updateBtn.updating});

        return new Promise((resolve, reject) => {
          const removeListener = gitIpc.onProgress((id, state) => {
            if (id !== pullId) return;

            if (state === 'Failed') {
              removeListener();
              lynxTopToast(dispatch).error(`Error: Unable to update ${name}.`);
              reject(new Error(`Unable to update ${name}`));
            } else if (state === 'Completed') {
              removeListener();
              lynxTopToast(dispatch).success(`${name} updated successfully!`);
              updateRowState(name, {update: useRowElements.updateBtn.updated});
              setUpdatesAvailable(prev => filter(prev, update => update !== name));
              resolve();
            }
          });

          gitIpc.pull(extDir, pullId);
        });
      },
      [dir, dispatch, updateRowState, setUpdatesAvailable],
    );

    // Update all extensions that have updates available
    const updateAll = useCallback(async () => {
      setIsUpdatingAll(true);
      await Promise.all(updatesAvailable.map(updateExtension));
      setIsUpdatingAll(false);
    }, [updatesAvailable, updateExtension, setIsUpdatingAll]);

    // Build action buttons (remove, disable, update) for a row
    const buildRowActions = useCallback(
      (name: string, isUpdateAvailable: boolean, isDisabled: boolean, resultDir: string) => {
        const isDeleteModalOpen = deleteModalStates.get(name) || false;

        return {
          remove: useRowElements.removeBtn.enabled(
            name,
            open => toggleDeleteModal(name, open),
            isDeleteModalOpen,
            () => handleDeleteExtension(name, 'removeDir'),
            () => handleDeleteExtension(name, 'trashDir'),
          ),
          disable: useRowElements.disableBtn.enabled(isDisabled, () =>
            handleDisableExtension(isDisabled, resultDir, name),
          ),
          update: isUpdateAvailable
            ? useRowElements.updateBtn.available(() => updateExtension(name))
            : useRowElements.updateBtn.updated,
        };
      },
      [deleteModalStates, toggleDeleteModal, handleDeleteExtension, handleDisableExtension, updateExtension],
    );

    // Fetch update status for all extensions and update row actions
    const getUpdateStatus = useCallback(() => {
      if (isEmpty(rows)) return;

      utilsIpc.getExtensionsUpdateStatus(dir).then(updateStatus => {
        if (isEmpty(updateStatus)) return;

        const newUpdatesAvailable: string[] = [];
        const updatedRows = rows.map(row => {
          const status = find(updateStatus, {id: row.key});
          if (!status) return row;

          const {updateAvailable: isUpdateAvailable, isDisabled = false, id: resultID = ''} = status;
          const resultDir = `${dir}/${resultID}`;

          if (isUpdateAvailable) newUpdatesAvailable.push(row.key);

          return {
            ...row,
            ...buildRowActions(row.key, isUpdateAvailable, isDisabled, resultDir),
          };
        });

        setRows(updatedRows);
        setUpdatesAvailable(prev => [...prev, ...newUpdatesAvailable]);
        setLoadUpdateStatus(false);
      });
    }, [dir, rows, buildRowActions, setUpdatesAvailable]);

    // Fetch installed extensions and initialize table rows
    const getExtensions = useCallback(() => {
      utilsIpc.getExtensionsDetails(dir).then(async data => {
        if (data === 'empty') {
          setIsTableEmpty(true);
          setInstalledExtensions([]);
          setEmptyContent(emptyTableElement);
          return;
        }

        setInstalledExtensions(data.map(ext => validateGitRepoUrl(ext.remoteUrl)));

        const initialRows = data.map(dataRow => ({
          key: dataRow.name,
          name: useRowElements.nameLink(dataRow.remoteUrl, startCase(dataRow.name)),
          remove: useRowElements.removeBtn.disabled,
          size: dataRow.size,
          update: useRowElements.updateBtn.initializing,
          disable: useRowElements.disableBtn.disable,
        }));

        setRows(initialRows);
        setLoadUpdateStatus(true);
        setEmptyContent(emptyTableElement);
      });
    }, [dir, setInstalledExtensions]);

    // Reset all component state to initial values
    const resetState = useCallback(() => {
      setIsTableEmpty(false);
      setDeleteModalStates(new Map());
      setUpdatesAvailable([]);
      setRows([]);
      setEmptyContent(loadingTableElement);
    }, [setUpdatesAvailable]);

    // Expose methods to parent component
    useImperativeHandle(
      ref,
      () => ({
        getExtensions: () => {
          resetState();
          getExtensions();
        },
        updateAll,
      }),
      [resetState, getExtensions, updateAll],
    );

    // Trigger update status check after initial load
    useEffect(() => {
      if (loadUpdateStatus) getUpdateStatus();
    }, [loadUpdateStatus, getUpdateStatus]);

    // Load extensions when modal opens, cleanup when closed
    useEffect(() => {
      if (isOpen) {
        resetState();
        getExtensions();
      } else {
        resetState();
        utilsIpc.cancelExtensionsData();
      }
    }, [isOpen, getExtensions, resetState]);

    // Open extension folder on double-click
    const onDoubleClick = useCallback(
      (name: Key) => {
        filesIpc.openPath(`${dir}/${name}`);
      },
      [dir],
    );

    if (!visible) return null;

    return (
      <motion.div initial="init" animate="animate" variants={tabContentVariants}>
        <Table
          selectionMode="multiple"
          hideHeader={isTableEmpty}
          selectionBehavior="replace"
          onRowAction={onDoubleClick}
          aria-label="Installed extensions table"
          removeWrapper>
          <TableHeader columns={extensionsColumns}>
            {column => <TableColumn key={column.key}>{column.label}</TableColumn>}
          </TableHeader>
          <TableBody items={rows} emptyContent={emptyContent}>
            {row => (
              <TableRow key={row.key}>{columnKey => <TableCell>{getKeyValue(row, columnKey)}</TableCell>}</TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    );
  },
);

export default Installed;
