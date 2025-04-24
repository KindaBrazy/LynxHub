import {Avatar, Spinner} from '@heroui/react';
import {useMemo} from 'react';

import {APP_ICON_TRANSPARENT} from '../../../../../cross/CrossConstants';
import {TabInfo} from '../../../../../cross/CrossTypes';
import {getFavIconUrl} from '../../../../../cross/CrossUtils';
import {AudioGeneration_Icon, Extensions_Icon, Extensions2_Icon} from '../../../assets/icons/SvgIcons/SvgIcons1';
import {Home_Icon, ImageGeneration_Icon, Info_Icon} from '../../../assets/icons/SvgIcons/SvgIcons2';
import {Terminal_Icon, TextGeneration_Icon, Web_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';
import {Slider_Icon} from '../../../assets/icons/SvgIcons/SvgIcons4';
import {GamePad_Icon, Rocket_Icon} from '../../../assets/icons/SvgIcons/SvgIcons5';
import {useCardsState} from '../../Redux/Reducer/CardsReducer';
import {PageID} from '../../Utils/Constants';
import {useCachedImageUrl} from '../../Utils/LocalStorage';

type Props = {tab: TabInfo};

export default function TabItem_Icon({tab}: Props) {
  const runningCards = useCardsState('runningCard');
  const favIcon = useCachedImageUrl(`${tab.favIcon.targetUrl}_favicon`, getFavIconUrl(tab.favIcon.targetUrl));

  const icon = useMemo(() => {
    if (tab.favIcon.show) {
      return favIcon ? (
        <Avatar src={favIcon} name={tab.title} className="size-full" />
      ) : (
        <Web_Icon className="size-full" />
      );
    }

    const currentView = runningCards.find(card => card.tabId === tab.id)?.currentView;
    if (currentView === 'browser') return <Web_Icon className="size-full" />;

    if (tab.pageID === PageID.home) return <Home_Icon className="size-full" />;
    if (tab.pageID === PageID.imageGen) return <ImageGeneration_Icon className="size-full" />;
    if (tab.pageID === PageID.textGen) return <TextGeneration_Icon className="size-full" />;
    if (tab.pageID === PageID.audioGen) return <AudioGeneration_Icon className="size-full" />;

    if (tab.pageID === PageID.games) return <GamePad_Icon className="size-full" />;
    if (tab.pageID === PageID.tools) return <Rocket_Icon className="size-full" />;

    if (tab.pageID === PageID.dashboard) return <Info_Icon className="size-full" />;
    if (tab.pageID === PageID.modules) return <Extensions2_Icon className="size-full" />;
    if (tab.pageID === PageID.extensions) return <Extensions_Icon className="size-full" />;
    if (tab.pageID === PageID.settings) return <Slider_Icon className="size-full" />;

    return <Avatar radius="none" className="size-full" src={APP_ICON_TRANSPARENT} />;
  }, [tab]);

  return (
    <>
      {tab.isLoading ? (
        <Spinner size="sm" color="primary" variant="simple" className="scale-80 mb-0.5" />
      ) : tab.isTerminal ? (
        <Terminal_Icon className="shrink-0 mb-0.5" />
      ) : (
        <div className="shrink-0 size-4 content-center mb-0.5">{icon}</div>
      )}
    </>
  );
}
