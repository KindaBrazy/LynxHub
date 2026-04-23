import {ScrollShadow} from '@heroui-v3/react';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useCardsState} from '@lynx/redux/reducers/cards';
import {useDebounceBreadcrumb} from '@lynx_shared/sentry/Breadcrumbs';
import {AnimatePresence, LayoutGroup} from 'framer-motion';
import {isEmpty} from 'lodash';
import {memo, useMemo, useState} from 'react';

import {AllCardsSection, CardsBySearch, PinnedCars, RecentlyCards} from '../CardsCategory';
import Page from '../Page';
import HomeFilter from './Filter';
import HomeNotificationDrawer from './notification';
import HomeSearchBox from './SearchBox';
import HomeTopBar from './TopBar';

/**
 * The main Home Page component.
 * It renders the search, categories, extension injects, top bars, and cards grid.
 */
const HomePage = memo(() => {
  const homeCategory = useCardsState('homeCategory');
  const [searchValue, setSearchValue] = useState<string>('');

  useDebounceBreadcrumb('Home search', [searchValue]);

  const {
    searchAndFilter: SearchAndFilter,
    categories: Categories,
    searchResult: SearchResult,
  } = useMemo(() => extensionsData.customizePages.home.replace, []);
  const {bottom, scrollBottom, scrollTop, top} = useMemo(() => extensionsData.customizePages.home.add, []);

  return (
    <Page>
      <div className="flex size-full shrink-0 flex-col">
        {SearchAndFilter ? (
          <SearchAndFilter />
        ) : (
          <div className="my-4 flex w-full items-center justify-between space-x-3 px-2">
            <HomeSearchBox searchValue={searchValue} setSearchValue={setSearchValue} />
            <HomeFilter selectedCategories={homeCategory} />
            <HomeNotificationDrawer />
          </div>
        )}

        <HomeTopBar />

        {top && top.map((Top, index) => <Top key={index} />)}

        <ScrollShadow className="scrollbar-hide size-full space-y-8 overflow-y-scroll pb-4 pt-6 px-2">
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
});

export default HomePage;
