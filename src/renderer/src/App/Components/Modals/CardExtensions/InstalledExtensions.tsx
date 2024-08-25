import {getKeyValue, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@nextui-org/react';
import {message} from 'antd';
import {motion} from 'framer-motion';
import {filter, find, isEmpty} from 'lodash';
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

import {GitProgressCallback} from '../../../../../../cross/IpcChannelAndTypes';
import {useModalsState} from '../../../Redux/AI/ModalsReducer';
import rendererIpc from '../../../RendererIpc';
import {fetchRepoDetails} from '../../../Utils/LocalStorage';
import {
  emptyTableElement,
  extensionsColumns,
  loadingTableElement,
  tabContentVariants,
  useRowElements,
} from './Constants';
import {InstalledExtensionsTable} from './Types';

type Props = {
  visible: boolean;
  updatesAvailable: string[];
  setUpdatesAvailable: Dispatch<SetStateAction<string[]>>;
  setIsUpdatingAll: Dispatch<SetStateAction<boolean>>;
};

/**
 * Table displaying installed extensions.
 * - It handles updating, removing, and trashing extensions.
 */
const InstalledExtensions = forwardRef(
  ({setIsUpdatingAll, setUpdatesAvailable, updatesAvailable, visible}: Props, ref) => {
    const {dir, isOpen} = useModalsState('cardExtensions');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean[]>([]);
    const [rows, setRows] = useState<InstalledExtensionsTable[]>([]);
    const [isTableEmpty, setIsTableEmpty] = useState(false);
    const [emptyContent, setEmptyContent] = useState<ReactNode>(loadingTableElement);
    const [loadUpdateStatus, setLoadUpdateStatus] = useState(false);

    // Delete or trash an extension
    const handleDeleteExtension = useCallback(
      (name: string, type: 'removeDir' | 'trashDir', index: number) => {
        setIsDeleteModalOpen(prevState => prevState.map((value, i) => (i === index ? false : value)));

        rendererIpc.file[type](`${dir}/${name}`)
          .then(() => {
            message.success(`${name} extension ${type === 'removeDir' ? 'removed' : 'moved to trash'} successfully.`);
            setRows(prevState => filter(prevState, row => row.key !== name));
          })
          .catch(() => {
            message.error(`Error: Unable to ${type === 'removeDir' ? 'remove' : 'move to trash'} the folder.`);
          });
      },
      [dir],
    );

    // Update an extension
    const updateExtension = useCallback(
      async (name: string): Promise<void> => {
        const extDir = `${dir}/${name}`;
        const pullId = `${name}_pull`;

        setRows(prevState =>
          prevState.map(row => (row.key === name ? {...row, update: useRowElements.updateBtn.updating} : row)),
        );

        return new Promise((resolve, reject) => {
          rendererIpc.git.pull(extDir, pullId);

          const onProgress: GitProgressCallback = (_e, id, state) => {
            if (id !== pullId) return;

            switch (state) {
              case 'Failed':
                message.error(`Error: Unable to update ${name}.`);
                reject();
                break;
              case 'Completed':
                message.success(`${name} updated successfully!`);
                setRows(prevState =>
                  prevState.map(row => (row.key === name ? {...row, update: useRowElements.updateBtn.updated} : row)),
                );
                setUpdatesAvailable(prevState => filter(prevState, update => update !== name));
                resolve();
                break;
            }
          };

          rendererIpc.git.offProgress(onProgress);
          rendererIpc.git.onProgress(onProgress);
        });
      },
      [dir],
    );

    // Update all extensions with available updates
    const updateAll = useCallback(async () => {
      setIsUpdatingAll(true);
      await Promise.all(updatesAvailable.map(updateExtension));
      setIsUpdatingAll(false);
    }, [updatesAvailable, updateExtension]);

    // Retrieves the update status of extensions and updates the UI accordingly
    const getUpdateStatus = useCallback(() => {
      if (isEmpty(rows)) return;

      rendererIpc.utils.getExtensionsUpdateStatus(dir).then(updateStatus => {
        if (isEmpty(updateStatus)) return;

        setRows(prevState =>
          prevState.map((row, index) => {
            const isUpdateAvailable = find(updateStatus, {id: row.key})?.updateAvailable;
            if (isUpdateAvailable) setUpdatesAvailable(prevState1 => [...prevState1, row.key]);

            setIsDeleteModalOpen(prevState => [...prevState, false]);

            return {
              ...row,
              remove: useRowElements.removeBtn.enabled(
                row.key,
                open => {
                  setIsDeleteModalOpen(prevState => {
                    const result = [...prevState];
                    result[index] = open;
                    return result;
                  });
                },
                isDeleteModalOpen[index],
                () => handleDeleteExtension(row.key, 'removeDir', index),
                () => handleDeleteExtension(row.key, 'trashDir', index),
              ),
              update: isUpdateAvailable
                ? useRowElements.updateBtn.available(async () => {
                    await updateExtension(row.key);
                  })
                : useRowElements.updateBtn.updated,
            };
          }),
        );
        setLoadUpdateStatus(false);
      });
    }, [dir, rows, isDeleteModalOpen, handleDeleteExtension, updateExtension]);

    // Fetches installed extensions
    const getExtensions = useCallback(() => {
      rendererIpc.utils.getExtensionsDetails(dir).then(async data => {
        if (data === 'empty') {
          setIsTableEmpty(true);
        } else {
          const resultRow = await Promise.all(
            data.map(async dataRow => {
              const details = await fetchRepoDetails(dataRow.remoteUrl);
              return {
                key: dataRow.name,
                name: useRowElements.nameLink(dataRow.remoteUrl, dataRow.name),
                remove: useRowElements.removeBtn.disabled,
                size: dataRow.size,
                stars: useRowElements.stars(details),
                update: useRowElements.updateBtn.initializing,
              };
            }),
          );
          setRows(resultRow);
          setLoadUpdateStatus(true);
        }
        setEmptyContent(emptyTableElement);
      });
    }, [dir]);

    // Expose updateAll and getExtensions methods to parent components
    useImperativeHandle(ref, () => ({
      getExtensions: () => {
        setIsTableEmpty(false);
        setIsDeleteModalOpen([]);
        setUpdatesAvailable([]);
        setRows([]);
        setEmptyContent(loadingTableElement);
        getExtensions();
      },
      updateAll,
    }));

    useEffect(() => {
      if (loadUpdateStatus) getUpdateStatus();
    }, [loadUpdateStatus, getUpdateStatus]);

    useEffect(() => {
      setIsDeleteModalOpen([]);
      setUpdatesAvailable([]);

      if (isOpen) {
        getExtensions();
      } else {
        setIsTableEmpty(false);
        setRows([]);
        setEmptyContent(loadingTableElement);
        rendererIpc.utils.cancelExtensionsData();
      }
    }, [isOpen, getExtensions]);

    // Open selected extension folder
    const onDoubleClick = (name: Key) => {
      rendererIpc.file.openPath(`${dir}/${name}`);
    };

    if (!visible) return null;
    return (
      <motion.div initial="init" animate="animate" variants={tabContentVariants}>
        <Table
          selectionMode="multiple"
          hideHeader={isTableEmpty}
          selectionBehavior="replace"
          onRowAction={onDoubleClick}
          aria-label="Update changed files"
          removeWrapper>
          <TableHeader columns={extensionsColumns}>
            {columns => <TableColumn key={columns.key}>{columns.label}</TableColumn>}
          </TableHeader>
          <TableBody items={rows} emptyContent={emptyContent}>
            {row => (
              <TableRow key={row.key} className="hover:bg-black/15">
                {columnKey => <TableCell>{getKeyValue(row, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    );
  },
);
export default InstalledExtensions;
