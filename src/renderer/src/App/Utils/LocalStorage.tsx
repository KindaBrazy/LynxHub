import {Image} from '@nextui-org/react';
import {isEmpty} from 'lodash';
import {ReactNode, useEffect, useState} from 'react';

import {DevInfo, RepoDetails} from '../../../../cross/CrossTypes';
import {extractGitHubUrl} from '../../../../cross/CrossUtils';
import {getIconByName} from '../../assets/icons/SvgIconsContainer';
import {useAppState} from '../Redux/App/AppReducer';
import {convertBlobToDataUrl} from './UtilFunctions';

/**
 * Renders an image component based on the provided type and image source.
 * @param type - The type of image ('bg' for the background or 'avatar' for user avatar)
 * @param img - The image source URL
 * @returns A React component for the image
 */
function renderImage(type: 'bg' | 'avatar', img: string): ReactNode {
  const commonProps = {
    src: img,
    className: 'size-full object-cover',
    isZoomed: true,
    removeWrapper: true,
    disableSkeleton: true,
  };

  return type === 'avatar' ? (
    <Image {...commonProps} className="absolute size-full object-cover" />
  ) : (
    <div className="absolute size-full overflow-hidden">
      <Image {...commonProps} radius="none" />
    </div>
  );
}

/**
 * Fetches repository details from GitHub API or local storage.
 * @param url - The GitHub repository URL
 * @returns A promise that resolves to RepoDetails or undefined
 */
export async function fetchRepoDetails(url: string): Promise<RepoDetails | undefined> {
  if (!url) return undefined;

  const {owner, repo} = extractGitHubUrl(url);
  const cacheKey = `${owner}_${repo}_repo_details`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) return JSON.parse(cachedData) as RepoDetails;

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    const {forks_count, open_issues_count, stargazers_count, size} = await response.json();

    if (!stargazers_count || !forks_count || !open_issues_count || !size) return undefined;

    const repoDetails: RepoDetails = {forks: forks_count, issues: open_issues_count, stars: stargazers_count, size};
    localStorage.setItem(cacheKey, JSON.stringify(repoDetails));
    return repoDetails;
  } catch (error) {
    console.error('Error fetching repo details:', error);
    return undefined;
  }
}

/**
 * Retrieves developer information from local storage.
 * @param repoUrl - The GitHub repository URL
 * @returns DevInfo if available, otherwise undefined
 */
export function getDevInfo(repoUrl: string): DevInfo | undefined {
  const {owner, repo} = extractGitHubUrl(repoUrl);
  const cacheKey = `${owner}_${repo}_dev_info`;
  const cachedData = localStorage.getItem(cacheKey);
  return cachedData ? (JSON.parse(cachedData) as DevInfo) : undefined;
}

/**
 * Custom hook to fetch and cache developer information.
 * @param repoUrl - The GitHub repository URL
 * @returns DevInfo object
 */
export function useDevInfo(repoUrl: string): DevInfo {
  const isOnline = useAppState('isOnline');
  const [devInfo, setDevInfo] = useState<DevInfo>({name: 'Unknown', picUrl: ''});

  useEffect(() => {
    if (!repoUrl) return;

    const fetchDevInfo = async () => {
      const {owner, repo} = extractGitHubUrl(repoUrl);
      const cacheKey = `${owner}_${repo}_dev_info`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        setDevInfo(JSON.parse(cachedData) as DevInfo);
        return;
      }

      if (!isOnline) {
        setDevInfo({name: 'Unknown', picUrl: ''});
        return;
      }

      try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        const {
          owner: {login, avatar_url},
        } = await response.json();

        if (login && avatar_url) {
          const newDevInfo: DevInfo = {name: login, picUrl: avatar_url};
          setDevInfo(newDevInfo);
          localStorage.setItem(cacheKey, JSON.stringify(newDevInfo));
        } else {
          setDevInfo({name: 'Unknown', picUrl: ''});
        }
      } catch (error) {
        console.error('Error fetching dev info:', error);
        setDevInfo({name: 'Unknown', picUrl: ''});
      }
    };

    fetchDevInfo();
  }, [repoUrl, isOnline]);

  return devInfo;
}

/**
 * Custom hook to fetch and cache repository details.
 * @param url - The GitHub repository URL
 * @returns RepoDetails object or undefined
 */
export function useRepoDetails(url: string): RepoDetails | undefined {
  const isOnline = useAppState('isOnline');
  const [repoDetails, setRepoDetails] = useState<RepoDetails | undefined>(undefined);

  useEffect(() => {
    if (!url) return;

    const repoDetails = async () => {
      const details = await fetchRepoDetails(url);
      setRepoDetails(details);
    };

    repoDetails();
  }, [url, isOnline]);

  return repoDetails;
}

/**
 * Custom hook to fetch and cache image URLs.
 * @param id - Unique identifier for caching
 * @param url - The image URL
 * @returns Cached or fetched image URL
 */
export function useCachedImageUrl(id: string, url: string): string {
  const isOnline = useAppState('isOnline');
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    const fetchAndStoreImage = async () => {
      try {
        const response = await fetch(url);
        const data = await response.blob();
        const imageDataUrl = await convertBlobToDataUrl(data);
        localStorage.setItem(id, imageDataUrl);
        setImageSrc(imageDataUrl);
      } catch (error) {
        console.error('Error fetching and storing image:', error);
      }
    };

    const cachedImage = localStorage.getItem(id);
    if (cachedImage) {
      setImageSrc(cachedImage);
    } else if (isOnline) {
      fetchAndStoreImage();
    }
  }, [id, url, isOnline]);

  return imageSrc;
}

/**
 * Custom hook to load and cache images, with fallback for offline scenarios.
 * @param id - Unique identifier for caching
 * @param url - The image URL
 * @param type - The type of image ('bg' for the background or 'avatar' for user avatar)
 * @param darkMode - Boolean indicating if dark mode is active
 * @returns ReactNode containing the image component or fallback
 */
export function useLoadImage(
  id: string,
  url: string,
  type: 'bg' | 'avatar' = 'bg',
  darkMode?: boolean,
): ReactNode | undefined {
  const isOnline = useAppState('isOnline');
  const [imageSrc, setImageSrc] = useState<ReactNode | undefined>(undefined);

  useEffect(() => {
    if (isEmpty(url)) return;

    const fetchAndStoreImage = async () => {
      try {
        const response = await fetch(url);
        const data = await response.blob();
        const imageDataUrl = await convertBlobToDataUrl(data);
        localStorage.setItem(id, imageDataUrl);
        setImageSrc(renderImage(type, imageDataUrl));
      } catch (error) {
        console.error('Error fetching and storing image:', error);
      }
    };

    const cachedImage = localStorage.getItem(id);
    if (cachedImage) {
      setImageSrc(renderImage(type, cachedImage));
    } else if (isOnline) {
      fetchAndStoreImage();
    } else {
      setImageSrc(
        type === 'avatar' ? (
          getIconByName('User', {className: 'size-full p-2 dark:bg-LynxRaisinBlack/70 bg-white/70'})
        ) : (
          <div className={`${darkMode ? 'darkPattern' : 'lightPattern'} absolute size-full`} />
        ),
      );
    }
  }, [id, url, type, darkMode, isOnline]);

  return imageSrc;
}
