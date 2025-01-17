import {ScrollShadow} from '@heroui/react';
import {AnimatePresence, LayoutGroup} from 'framer-motion';
import {isEmpty} from 'lodash';
import {useMemo, useState} from 'react';

import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import {useCardsState} from '../../../../Redux/AI/CardsReducer';
import {AllCardsSection, CardsBySearch, PinnedCars, RecentlyCards} from '../../../Cards/CardsByCategory';
import Page from '../../Page';
import HomeFilter from './HomeFilter';
import HomeSearchBox from './HomeSearchBox';

export const homeRoutePath: string = '/homePage';
export const homeElementId: string = 'homePageElement';

const HomePage = () => {
  const homeCategory = useCardsState('homeCategory');
  const [searchValue, setSearchValue] = useState<string>('');

  const {
    searchAndFilter: SearchAndFilter,
    categories: Categories,
    searchResult: SearchResult,
  } = useMemo(() => extensionsData.customizePages.home.replace, []);
  const {bottom, scrollBottom, scrollTop, top} = useMemo(() => extensionsData.customizePages.home.add, []);

  return (
    <Page id={homeElementId}>
      <div className="flex size-full shrink-0 flex-col">
        {SearchAndFilter ? (
          <SearchAndFilter />
        ) : (
          <div className="my-4 flex w-full items-center justify-between space-x-3 px-2">
            <HomeSearchBox searchValue={searchValue} setSearchValue={setSearchValue} />
            <HomeFilter selectedCategories={homeCategory} />
          </div>
        )}

        {top && top.map((Top, index) => <Top key={index} />)}

        <ScrollShadow size={20} offset={-1} className="size-full space-y-8 overflow-y-scroll py-4 scrollbar-hide">
          {scrollTop && scrollTop.map((Top, index) => <Top key={index} />)}

          {Categories ? (
            <Categories />
          ) : isEmpty(searchValue) ? (
            <LayoutGroup>
              <AnimatePresence>{homeCategory.includes('Pin') && <PinnedCars />}</AnimatePresence>
              <AnimatePresence>{homeCategory.includes('Recently') && <RecentlyCards />}</AnimatePresence>
              <AnimatePresence>{homeCategory.includes('All') && <AllCardsSection />}</AnimatePresence>
            </LayoutGroup>
          ) : SearchResult ? (
            <SearchResult searchValue={searchValue} />
          ) : (
            <CardsBySearch searchValue={searchValue} />
          )}

          {scrollBottom && scrollBottom.map((Top, index) => <Top key={index} />)}
        </ScrollShadow>

        {bottom && bottom.map((Top, index) => <Top key={index} />)}
      </div>
    </Page>
  );
};

export default HomePage;
