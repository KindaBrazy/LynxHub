import {
  Accordion,
  AccordionItem,
  Button,
  getKeyValue,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import {CheckRead} from '@solar-icons/react-perf/LineDuotone';
import {Typography} from 'antd';
import {isEmpty} from 'lodash';
import {ReactNode, useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {useTabVisibility} from '../../../../layouts/tabs/utils';
import {modalActions, useModalsState} from '../../../../redux/reducers/modals';
import {AppDispatch} from '../../../../redux/store';

const {Paragraph, Text} = Typography;

type DetailsRow = {
  key: number;
  name: ReactNode;
  insertions: number;
  deletions: number;
}[];

const columns = [
  {key: 'name', label: 'File Name'},
  {key: 'insertions', label: 'Insertions'},
  {key: 'deletions', label: 'Deletions'},
];

/**
 * Modal showing details and changes about updated card.
 */
export default function UpdateDetails() {
  const {details, isOpen, title, tabID} = useModalsState('updateDetails');
  const dispatch = useDispatch<AppDispatch>();
  const show = useTabVisibility(tabID);

  const handleClose = useCallback(() => {
    dispatch(modalActions.closeUpdateDetails());
  }, [dispatch]);

  const rows = useMemo<DetailsRow>(() => {
    return details.files.map((file, index) => ({
      deletions: details.deletions[file] || 0,
      insertions: details.insertions[file] || 0,
      key: index,
      name: <p className="md:max-w-72! lg:max-w-full! truncate overflow-hidden">{file}</p>,
    }));
  }, [details]);

  const renderFileList = useCallback((files: string[]) => {
    return isEmpty(files) ? (
      <Text>No files found in this category.</Text>
    ) : (
      <Paragraph>
        <ul>
          {files.map((file, index) => (
            <li key={index}>{file}</li>
          ))}
        </ul>
      </Paragraph>
    );
  }, []);

  return (
    <Modal
      classNames={{
        backdrop: `top-10! ${show}`,
        closeButton: 'cursor-default',
        wrapper: `top-10! scrollbar-hide ${show}`,
      }}
      isOpen={isOpen}
      placement="center"
      isDismissable={false}
      scrollBehavior="inside"
      className="max-w-[70%] overflow-hidden"
      hideCloseButton>
      <ModalContent>
        <ModalHeader className="justify-center bg-foreground-100">{title || <Text>Update Details.</Text>}</ModalHeader>
        <ModalBody className="scrollbar-hide">
          <Accordion
            className="mt-4"
            variant="splitted"
            selectionMode="multiple"
            defaultExpandedKeys={['summary']}
            itemClasses={{trigger: 'cursor-default', base: 'bg-foreground-100 shadow'}}
            isCompact>
            <AccordionItem key="created" title="Created Files" subtitle={details.created.length}>
              {renderFileList(details.created)}
            </AccordionItem>
            <AccordionItem key="deleted" title="Deleted Files" subtitle={details.deleted.length}>
              {renderFileList(details.deleted)}
            </AccordionItem>
            <AccordionItem key="files" title="Changed Files" subtitle={details.files.length}>
              {!isEmpty(details.files) ? (
                <Table aria-label="Update changed files">
                  <TableHeader columns={columns}>
                    {col => <TableColumn key={col.key}>{col.label}</TableColumn>}
                  </TableHeader>
                  <TableBody items={rows}>
                    {row => (
                      <TableRow key={row.key}>
                        {columnKey => <TableCell>{getKeyValue(row, columnKey)}</TableCell>}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <Text>No files have been modified.</Text>
              )}
            </AccordionItem>
            <AccordionItem key="summary" title="Summary">
              <Paragraph>
                <ul>
                  <li>Deletions: {details.summary.deletions}</li>
                  <li>Insertions: {details.summary.insertions}</li>
                  <li>Changes: {details.summary.changes}</li>
                </ul>
              </Paragraph>
            </AccordionItem>
          </Accordion>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" color="success" onPress={handleClose}>
            <CheckRead className="size-5" />
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
