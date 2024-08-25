import {ScrollShadow} from '@nextui-org/react';
import {AnimatePresence, LayoutGroup} from 'framer-motion';
import {isEmpty} from 'lodash';
import {useState} from 'react';

import {useCardsState} from '../../../../Redux/AI/CardsReducer';
import {AllCardsSection, CardsBySearch, PinnedCars, RecentlyCards} from '../../../Cards/CardsByCategory';
import Page from '../../Page';
import HomeFilter from './HomeFilter';
import HomeSearchBox from './HomeSearchBox';

export const homeRoutePath: string = '/homePage';
export const homeElementId: string = 'homePageElement';

export default function HomePage() {
  const homeCategory = useCardsState('homeCategory');
  const [searchValue, setSearchValue] = useState<string>('');

  return (
    <Page id={homeElementId}>
      <div className="flex size-full shrink-0 flex-col">
        <div className="my-4 flex w-full items-center justify-between space-x-3 px-2">
          <HomeSearchBox searchValue={searchValue} setSearchValue={setSearchValue} />
          <HomeFilter selectedCategories={homeCategory} />
        </div>

        <ScrollShadow size={20} offset={-1} className="size-full space-y-8 overflow-y-scroll py-4 scrollbar-hide">
          {isEmpty(searchValue) ? (
            <LayoutGroup>
              <AnimatePresence>{homeCategory.includes('Pin') && <PinnedCars />}</AnimatePresence>
              <AnimatePresence>{homeCategory.includes('Recently') && <RecentlyCards />}</AnimatePresence>
              <AnimatePresence>{homeCategory.includes('All') && <AllCardsSection />}</AnimatePresence>
            </LayoutGroup>
          ) : (
            <CardsBySearch searchValue={searchValue} />
          )}
        </ScrollShadow>
      </div>
    </Page>
  );
}
