import {useUpdatingProgress} from './hooks/useUpdatingProgress';
import UpdateDetails from './UpdateDetails';

/**
 * Component to display the updated card notification and modal.
 * Note: This component doesn't render any visible UI itself (except the modal when open),
 * but it manages the notifications via the hook.
 */
const UpdatingNotification = () => {
  useUpdatingProgress();

  return <UpdateDetails />;
};

export default UpdatingNotification;
