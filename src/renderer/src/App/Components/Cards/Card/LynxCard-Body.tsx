import {CardBody} from '@nextui-org/react';
import {Divider} from 'antd';
import {observer} from 'mobx-react-lite';

import {formatSizeKB} from '../../../../../../cross/CrossUtils';
import {getIconByName} from '../../../../assets/icons/SvgIconsContainer';
import {useRepoDetails} from '../../../Utils/LocalStorage';
import {formatNumber} from '../../../Utils/UtilFunctions';
import {useCardData} from '../CardsDataManager';

const LynxCardBody = observer(() => {
  const {repoUrl, installed} = useCardData();
  const repoDetails = useRepoDetails(repoUrl);

  return (
    repoDetails && (
      <>
        <CardBody className="flex flex-row items-center justify-center gap-x-2 bg-[#f7f7f7] text-xs dark:bg-[#292929]">
          <div className="flex flex-col items-center justify-center">
            <span className="font-bold">{formatNumber(repoDetails.stars)}</span>
            <div className="flex flex-row items-center">
              {getIconByName('Star', {className: 'fill-yellow-500 mx-1'})}
              <span>Stars</span>
            </div>
          </div>

          <Divider type="vertical" />

          <div className="flex flex-col items-center justify-center">
            <span className="font-bold">{formatNumber(repoDetails.forks)}</span>

            <div className="flex flex-row items-center">
              {getIconByName('Fork', {className: 'mx-1'})}
              <span>Forks</span>
            </div>
          </div>

          {!installed && (
            <>
              <Divider type="vertical" />

              <div className="flex flex-col items-center justify-center">
                <span className="font-bold">{formatSizeKB(repoDetails.size)}</span>

                <div className="flex flex-row items-center">
                  {getIconByName('Download', {className: 'mx-1'})}
                  <span>Size</span>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </>
    )
  );
});
export default LynxCardBody;
