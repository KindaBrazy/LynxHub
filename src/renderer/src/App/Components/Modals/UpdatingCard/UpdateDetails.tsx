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
} from '@nextui-org/react';
import {Typography} from 'antd';
import {isEmpty} from 'lodash';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';

const {Paragraph, Text} = Typography;

type DetailsRow = {
  key: number;
  name: string;
  insertions: number;
  deletions: number;
}[];

type DetailsColumns = {key: string; label: string}[];

const columns: DetailsColumns = [
  {key: 'name', label: 'File Name'},
  {key: 'insertions', label: 'Insertions'},
  {key: 'deletions', label: 'Deletions'},
];

/** Showing details and changes about updated card */
export default function UpdateDetails() {
  const {details, isOpen, title} = useModalsState('updateDetails');
  const dispatch = useDispatch<AppDispatch>();

  const handleClose = useCallback(() => dispatch(modalActions.closeModal('updateDetails')), [dispatch]);

  const rows = useMemo<DetailsRow>(() => {
    return details.files.map((file, index) => {
      return {
        deletions: details.deletions[file] || 0,
        insertions: details.insertions[file] || 0,
        key: index,
        name: file,
      };
    });
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
      isOpen={isOpen}
      className="max-w-[70%]"
      scrollBehavior="inside"
      classNames={{backdrop: '!top-10', closeButton: 'cursor-default', wrapper: '!top-10 scrollbar-hide'}}
      hideCloseButton>
      <ModalContent>
        <ModalHeader>{title || <Text>Update Details.</Text>}</ModalHeader>
        <ModalBody className="scrollbar-hide">
          <Accordion
            className="mt-4"
            variant="splitted"
            selectionMode="multiple"
            defaultExpandedKeys={['summary']}
            itemClasses={{trigger: 'cursor-default'}}
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
                    {columns => <TableColumn key={columns.key}>{columns.label}</TableColumn>}
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
          <Button variant="light" color="success" onPress={handleClose} className="cursor-default">
            Ok
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
