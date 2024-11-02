import {ScrollShadow} from '@nextui-org/react';
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

export default function HomePage() {
  const [customizePages] = useState(extensionsData.customizePages);
  const homeCategory = useCardsState('homeCategory');
  const [searchValue, setSearchValue] = useState<string>('');

  const replace = useMemo(() => {
    return customizePages.home.replace;
  }, [customizePages]);
  const add = useMemo(() => {
    return customizePages.home.add;
  }, [customizePages]);

  return (
    <Page id={homeElementId}>
      <div className="flex size-full shrink-0 flex-col">
        {replace.searchAndFilter ? (
          <replace.searchAndFilter />
        ) : (
          <div className="my-4 flex w-full items-center justify-between space-x-3 px-2">
            <HomeSearchBox searchValue={searchValue} setSearchValue={setSearchValue} />
            <HomeFilter selectedCategories={homeCategory} />
          </div>
        )}

        {add.top && add.top.map((Top, index) => <Top key={index} />)}

        <ScrollShadow size={20} offset={-1} className="size-full space-y-8 overflow-y-scroll py-4 scrollbar-hide">
          {add.scrollTop && add.scrollTop.map((Top, index) => <Top key={index} />)}

          {replace.categories ? (
            <replace.categories />
          ) : isEmpty(searchValue) ? (
            <LayoutGroup>
              <AnimatePresence>{homeCategory.includes('Pin') && <PinnedCars />}</AnimatePresence>
              <AnimatePresence>{homeCategory.includes('Recently') && <RecentlyCards />}</AnimatePresence>
              <AnimatePresence>{homeCategory.includes('All') && <AllCardsSection />}</AnimatePresence>
            </LayoutGroup>
          ) : (
            <CardsBySearch searchValue={searchValue} />
          )}

          {add.scrollBottom && add.scrollBottom.map((Top, index) => <Top key={index} />)}
        </ScrollShadow>

        {add.bottom && add.bottom.map((Top, index) => <Top key={index} />)}
      </div>
    </Page>
  );
}
