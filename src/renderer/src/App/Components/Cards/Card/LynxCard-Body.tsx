import {CardBody, Chip} from '@nextui-org/react';
import {Space} from 'antd';
import {observer} from 'mobx-react-lite';

import {formatSizeKB} from '../../../../../../cross/CrossUtils';
import {getIconByName} from '../../../../assets/icons/SvgIconsContainer';
import {useSettingsState} from '../../../Redux/App/SettingsReducer';
import {useRepoDetails} from '../../../Utils/LocalStorage';
import {formatNumber} from '../../../Utils/UtilFunctions';
import {useCardData} from '../CardsDataManager';

const LynxCardBody = observer(() => {
  const {repoUrl, installed} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');
  const repoDetails = useRepoDetails(repoUrl);

  return (
    !compactMode &&
    repoDetails && (
      <>
        <CardBody className="bg-[#f7f7f7] dark:bg-[#292929]">
          <Space wrap>
            <Chip
              size="sm"
              radius="sm"
              variant="flat"
              className="transition duration-500 hover:bg-black/0"
              startContent={getIconByName('Star', {className: 'fill-yellow-400 mx-1'})}>
              Stars: {formatNumber(repoDetails.stars)}
            </Chip>
            <Chip
              size="sm"
              radius="sm"
              variant="flat"
              className="transition duration-500 hover:bg-black/0"
              startContent={getIconByName('Fork', {className: 'mx-1'})}>
              Forks: {formatNumber(repoDetails.forks)}
            </Chip>
            <Chip
              size="sm"
              radius="sm"
              variant="flat"
              className="transition duration-500 hover:bg-black/0"
              startContent={getIconByName('Issue', {className: 'mx-1'})}>
              Issues: {formatNumber(repoDetails.issues)}
            </Chip>
            {!installed && (
              <Chip
                size="sm"
                radius="sm"
                variant="flat"
                className="transition duration-500 hover:bg-black/0"
                startContent={getIconByName('Download', {className: 'mx-1'})}>
                Size: {formatSizeKB(repoDetails.size)}
              </Chip>
            )}
          </Space>
        </CardBody>
      </>
    )
  );
});
export default LynxCardBody;
