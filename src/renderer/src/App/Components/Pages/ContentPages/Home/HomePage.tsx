import {ScrollShadow} from '@nextui-org/react';
import {AnimatePresence, LayoutGroup} from 'framer-motion';
import {isEmpty} from 'lodash';
import {useMemo, useState} from 'react';

import {useExtensions} from '../../../../Extensions/ExtensionsContext';
import {useCardsState} from '../../../../Redux/AI/CardsReducer';
import {AllCardsSection, CardsBySearch, PinnedCars, RecentlyCards} from '../../../Cards/CardsByCategory';
import Page from '../../Page';
import HomeFilter from './HomeFilter';
import HomeSearchBox from './HomeSearchBox';

export const homeRoutePath: string = '/homePage';
export const homeElementId: string = 'homePageElement';

export default function HomePage() {
  const {customizePages} = useExtensions();
  const homeCategory = useCardsState('homeCategory');
  const [searchValue, setSearchValue] = useState<string>('');

  const customizeHome = useMemo(() => {
    return customizePages?.CustomizeHomePage;
  }, [customizePages]);

  return (
    <Page id={homeElementId}>
      <div className="flex size-full shrink-0 flex-col">
        {customizeHome?.ReplaceSearchAndFilter ? (
          <customizeHome.ReplaceSearchAndFilter />
        ) : (
          <div className="my-4 flex w-full items-center justify-between space-x-3 px-2">
            <HomeSearchBox searchValue={searchValue} setSearchValue={setSearchValue} />
            <HomeFilter selectedCategories={homeCategory} />
          </div>
        )}

        {customizeHome?.AddToTop && customizeHome?.AddToTop.map((Top, index) => <Top key={index} />)}

        <ScrollShadow size={20} offset={-1} className="size-full space-y-8 overflow-y-scroll py-4 scrollbar-hide">
          {customizeHome?.AddToScroll_Top && customizeHome?.AddToScroll_Top.map((Top, index) => <Top key={index} />)}

          {customizeHome?.ReplaceCategories ? (
            <customizeHome.ReplaceCategories />
          ) : isEmpty(searchValue) ? (
            <LayoutGroup>
              <AnimatePresence>{homeCategory.includes('Pin') && <PinnedCars />}</AnimatePresence>
              <AnimatePresence>{homeCategory.includes('Recently') && <RecentlyCards />}</AnimatePresence>
              <AnimatePresence>{homeCategory.includes('All') && <AllCardsSection />}</AnimatePresence>
            </LayoutGroup>
          ) : (
            <CardsBySearch searchValue={searchValue} />
          )}

          {customizeHome?.AddToScroll_Bottom &&
            customizeHome?.AddToScroll_Bottom.map((Top, index) => <Top key={index} />)}
        </ScrollShadow>

        {customizeHome?.AddToBottom && customizeHome?.AddToBottom.map((Top, index) => <Top key={index} />)}
      </div>
    </Page>
  );
}
