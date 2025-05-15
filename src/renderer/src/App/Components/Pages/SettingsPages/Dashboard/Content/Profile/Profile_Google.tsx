import {Button, Card, Checkbox, User} from '@heroui/react';

import {Google_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import {useAppState} from '../../../../../../Redux/Reducer/AppReducer';

export default function Profile_Google() {
  const darkMode = useAppState('darkMode');

  return (
    <Card shadow="sm" radius="lg" className="p-4">
      <div className="mb-3 flex flex-row items-center space-x-1.5">
        <Google_Icon className="text-large" />
        <span className="text-medium">Google</span>
      </div>
      <div className="space-between flex flex-row justify-between items-center">
        <User name="Guest" />
        <Button size="sm" variant="flat" color="success">
          Login
        </Button>
      </div>
      <div className="mt-4 flex flex-row justify-between">
        <Checkbox size="sm" isDisabled>
          Sync Data with Cloud
        </Checkbox>
      </div>
      <div
        className={
          `opacity-80 content-center text-center absolute` + ` inset-0 ${darkMode ? 'bg-LynxRaisinBlack' : 'bg-white'}`
        }>
        Coming Soon...
      </div>
    </Card>
  );
}
