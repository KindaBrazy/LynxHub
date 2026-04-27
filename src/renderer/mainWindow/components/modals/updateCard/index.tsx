import {useOverlayState} from '@heroui-v3/react';
import {useState} from 'react';
import {PullResult} from 'simple-git';

import UpdateDetails from './UpdateDetails';
import {useUpdatingProgress} from './useUpdatingProgress';

const initialDetails: PullResult = {
  created: [],
  deleted: [],
  deletions: {},
  files: [],
  insertions: {},
  remoteMessages: {
    all: [],
  },
  summary: {
    changes: 0,
    deletions: 0,
    insertions: 0,
  },
};

/**
 * Component to display the updated card notification and modal.
 * Note: This component doesn't render any visible UI itself (except the modal when open),
 * but it manages the notifications via the hook.
 */
const UpdatingNotification = () => {
  const modalState = useOverlayState();
  const [details, setDetails] = useState<PullResult>(initialDetails);
  const [title, setTitle] = useState<string>('');

  useUpdatingProgress(modalState, setTitle, setDetails);

  return <UpdateDetails title={title} details={details} state={modalState} />;
};

export default UpdatingNotification;
