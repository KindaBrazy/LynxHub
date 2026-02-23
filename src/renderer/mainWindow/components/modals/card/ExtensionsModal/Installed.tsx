import {getKeyValue, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/react';
import filesIpc from '@lynx_shared/ipc/files';
import {Empty} from 'antd';
import {motion} from 'framer-motion';
import {startCase} from 'lodash';
import {Key, memo, useCallback, useEffect, useMemo, useState} from 'react';

import {DisableButton, RemoveButton, UpdateButton} from './components/ExtensionActions';
import {extensionsColumns, tabContentVariants} from './Constants';
import {ExtensionData, ExtensionStatus} from './hooks/useInstalledExtensions';

type Props = {
  visible: boolean;
  dir: string;
  isOpen: boolean;
  extensions: ExtensionData[];
  statusMap: Map<string, ExtensionStatus>;
  isLoading: boolean;
  getExtensions: () => void;
  checkUpdates: () => void;
  deleteExtension: (name: string, type: 'removeDir' | 'trashDir') => void;
  disableExtension: (name: string, isDisabled: boolean, targetDir: string) => void;
  updateExtension: (name: string) => void;
};

const Installed = memo(
  ({
    visible,
    dir,
    isOpen,
    extensions,
    statusMap,
    isLoading,
    getExtensions,
    checkUpdates,
    deleteExtension,
    disableExtension,
    updateExtension,
  }: Props) => {
    // Local state for delete confirmation modals
    const [deleteModalStates, setDeleteModalStates] = useState<Map<string, boolean>>(new Map());

    const toggleDeleteModal = useCallback((name: string, isOpen: boolean) => {
      setDeleteModalStates(prev => new Map(prev).set(name, isOpen));
    }, []);

    // Initial data fetch
    useEffect(() => {
      if (isOpen) {
        getExtensions();
      }
    }, [isOpen, getExtensions]);

    // Check updates after extensions are loaded
    useEffect(() => {
      if (!isLoading && extensions.length > 0) {
        checkUpdates();
      }
    }, [isLoading, extensions.length, checkUpdates]);

    const onDoubleClick = useCallback(
      (name: Key) => {
        filesIpc.openPath(`${dir}/${name}`);
      },
      [dir],
    );

    const rows = useMemo(() => {
      return extensions.map(ext => {
        const status = statusMap.get(ext.name) || {
          isUpdating: false,
          isDisabled: false,
          hasUpdate: false,
          isDeleting: false,
          resultDir: `${dir}/${ext.name}`,
        };

        const isDeleteModalOpen = deleteModalStates.get(ext.name) || false;

        return {
          key: ext.name,
          name: ext.name, // We render the link in the cell
          size: ext.size,
          remoteUrl: ext.remoteUrl,
          status,
          isDeleteModalOpen,
        };
      });
    }, [extensions, statusMap, deleteModalStates, dir]);

    const renderCell = useCallback(
      (row: any, columnKey: string | number) => {
        const status = row.status as ExtensionStatus;

        switch (columnKey) {
          case 'name':
            return (
              <a
                target="_blank"
                rel="noreferrer"
                href={row.remoteUrl}
                className="text-small text-foreground hover:underline">
                {startCase(row.name)}
              </a>
            );
          case 'size':
            return row.size;
          case 'update':
            return (
              <UpdateButton
                onPress={() => updateExtension(row.name)}
                status={status.isUpdating ? 'updating' : status.hasUpdate ? 'available' : 'updated'}
              />
            );
          case 'remove':
            return (
              <RemoveButton
                name={row.name}
                isDisabled={status.isDeleting}
                isOpen={row.isDeleteModalOpen}
                onOpenChange={open => toggleDeleteModal(row.name, open)}
                onMoveToTrash={() => deleteExtension(row.name, 'trashDir')}
                onDeletePerman={() => deleteExtension(row.name, 'removeDir')}
              />
            );
          case 'disable':
            return (
              <DisableButton
                isLoading={false} // Loading state not fully tracked for disable in hook yet, or we can add it
                isDisabled={status.isDisabled}
                onPress={() => disableExtension(row.name, status.isDisabled, status.resultDir || `${dir}/${row.name}`)}
              />
            );
          default:
            return getKeyValue(row, columnKey);
        }
      },
      [toggleDeleteModal, deleteExtension, disableExtension, updateExtension, dir],
    );

    if (!visible) return null;

    const emptyContent = isLoading ? (
      <Spinner label="Checking Extensions" />
    ) : (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No extensions to display." />
    );

    return (
      <motion.div initial="init" animate="animate" variants={tabContentVariants}>
        <Table
          selectionMode="multiple"
          selectionBehavior="replace"
          onRowAction={onDoubleClick}
          hideHeader={extensions.length === 0}
          aria-label="Installed extensions table"
          removeWrapper>
          <TableHeader columns={extensionsColumns}>
            {column => <TableColumn key={column.key}>{column.label}</TableColumn>}
          </TableHeader>
          <TableBody items={rows} emptyContent={emptyContent}>
            {row => (
              <TableRow key={row.key}>{columnKey => <TableCell>{renderCell(row, columnKey)}</TableCell>}</TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    );
  },
);

export default Installed;
