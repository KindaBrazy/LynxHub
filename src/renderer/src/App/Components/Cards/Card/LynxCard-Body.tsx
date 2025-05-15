import {CardBody} from '@heroui/react';
import {Divider} from 'antd';
import {observer} from 'mobx-react-lite';

import {formatSizeKB} from '../../../../../../cross/CrossUtils';
import {Download_Icon, Fork_Icon, Star_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
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
          <div className="flex flex-col items-center justify-center hover:opacity-50 transition duration-300">
            <span className="font-bold">{formatNumber(repoDetails.stars)}</span>
            <div className="flex flex-row items-center">
              <Star_Icon className="fill-yellow-500 mx-1" />
              <span>Stars</span>
            </div>
          </div>

          <Divider type="vertical" />

          <div className="flex flex-col items-center justify-center hover:opacity-50 transition duration-300">
            <span className="font-bold">{formatNumber(repoDetails.forks)}</span>

            <div className="flex flex-row items-center">
              <Fork_Icon className="mx-1" />
              <span>Forks</span>
            </div>
          </div>

          {!installed && (
            <>
              <Divider type="vertical" />

              <div className="flex flex-col items-center justify-center hover:opacity-50 transition duration-300">
                <span className="font-bold">{formatSizeKB(repoDetails.size)}</span>

                <div className="flex flex-row items-center">
                  <Download_Icon className="mx-1" />
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
