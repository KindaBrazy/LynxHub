import compact from 'lodash/compact';
import {Dispatch, SetStateAction} from 'react';

import {
  CustomizeHomePageComponent,
  CustomizePagesComponent,
  ExtensionCustomizePages,
} from '../../../../../cross/ExtensionTypes';

function loadHomePage(homePage: CustomizeHomePageComponent[]) {
  const AddToTop = compact(homePage.map(home => home.AddToTop));
  const AddToBottom = compact(homePage.map(home => home.AddToBottom));
  const AddToScroll_Top = compact(homePage.map(home => home.AddToScroll_Top));
  const AddToScroll_Bottom = compact(homePage.map(home => home.AddToScroll_Bottom));

  const [ReplaceSearchAndFilter] = compact(homePage.map(home => home.ReplaceSearchAndFilter));
  const [ReplaceCategories] = compact(homePage.map(home => home.ReplaceCategories));

  if (
    !AddToTop &&
    !AddToBottom &&
    !AddToScroll_Top &&
    !AddToScroll_Bottom &&
    !ReplaceSearchAndFilter &&
    !ReplaceCategories
  ) {
    return undefined;
  }

  return {
    AddToTop,
    AddToBottom,
    AddToScroll_Top,
    AddToScroll_Bottom,
    ReplaceSearchAndFilter,
    ReplaceCategories,
  };
}

export const loadCustomizePages = (
  setCustomizePages: Dispatch<SetStateAction<ExtensionCustomizePages>>,
  CustomizePages: CustomizePagesComponent[],
) => {
  const CustomizeHomePage = loadHomePage(compact(CustomizePages.map(page => page.CustomizeHomePage)));

  if (!CustomizeHomePage) return;

  setCustomizePages({CustomizeHomePage});
};
