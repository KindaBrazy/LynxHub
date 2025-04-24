import {Image} from '@heroui/react';
import {isEmpty} from 'lodash';
import {ReactNode, useEffect, useState} from 'react';

import {DevInfo, RepoDetails} from '../../../../cross/CrossTypes';
import {extractGitUrl} from '../../../../cross/CrossUtils';
import {User_Icon} from '../../assets/icons/SvgIcons/SvgIcons3';
import {useAppState} from '../Redux/Reducer/AppReducer';
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
 * Fetches repository details from GitHub or GitLab API or local storage.
 * @param url - The GitHub or GitLab repository URL
 * @returns A promise that resolves to RepoDetails or undefined
 */
export async function fetchRepoDetails(url: string): Promise<RepoDetails | undefined> {
  if (!url) return undefined;

  const {owner, repo, platform} = extractGitUrl(url);
  const cacheKey = `${owner}_${repo}_repo_details`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) return JSON.parse(cachedData) as RepoDetails;

  try {
    let apiUrl: string;
    let repoDetails: RepoDetails;

    if (platform === 'github') {
      apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const response = await fetch(apiUrl);
      const {forks_count, open_issues_count, stargazers_count, size} = await response.json();

      if (!stargazers_count || !forks_count || !open_issues_count || !size) return undefined;

      repoDetails = {
        forks: forks_count,
        issues: open_issues_count,
        stars: stargazers_count,
        size,
      };
      localStorage.setItem(cacheKey, JSON.stringify(repoDetails));
    } else if (platform === 'gitlab') {
      apiUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(`${owner}/${repo}`)}`;
      const response = await fetch(apiUrl);
      const {forks_count, star_count} = await response.json();

      if (!star_count || !forks_count) return undefined;

      repoDetails = {
        forks: forks_count,
        stars: star_count,
      };
      localStorage.setItem(cacheKey, JSON.stringify(repoDetails));
    } else {
      console.error(`Unsupported platform: ${platform}`);
      return undefined;
    }

    return repoDetails;
  } catch (error) {
    console.error('Error fetching repo details:', error);
    return undefined;
  }
}

/**
 * Custom hook to fetch and cache developer information from GitHub or GitLab.
 * @param repoUrl - The GitHub or GitLab repository URL
 * @returns DevInfo object
 */
export function useDevInfo(repoUrl: string): DevInfo {
  const isOnline = useAppState('isOnline');
  const [devInfo, setDevInfo] = useState<DevInfo>({name: 'Unknown', picUrl: ''});

  useEffect(() => {
    if (!repoUrl) return;

    const fetchDevInfo = async () => {
      const {owner, repo, platform} = extractGitUrl(repoUrl);
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
        let apiUrl: string;
        let newDevInfo: DevInfo;

        if (platform === 'github') {
          apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
          const response = await fetch(apiUrl);
          const {
            owner: {login, avatar_url},
          } = await response.json();

          if (login && avatar_url) {
            newDevInfo = {name: login, picUrl: avatar_url};
            localStorage.setItem(cacheKey, JSON.stringify(newDevInfo));
          } else {
            newDevInfo = {name: 'Unknown', picUrl: ''};
            console.error('Invalid GitHub API response');
          }
        } else if (platform === 'gitlab') {
          apiUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(`${owner}/${repo}`)}`;
          const response = await fetch(apiUrl);
          const resp = await response.json();
          const {avatar_url: a_url} = resp;
          const {
            namespace: {avatar_url, name},
          } = resp;

          console.info('resp', resp);

          if (name && a_url) {
            newDevInfo = {name, picUrl: a_url};
            localStorage.setItem(cacheKey, JSON.stringify(newDevInfo));
          } else if (name && avatar_url) {
            newDevInfo = {name, picUrl: avatar_url};
            localStorage.setItem(cacheKey, JSON.stringify(newDevInfo));
          } else {
            newDevInfo = {name: 'Unknown', picUrl: ''};
            console.error('Invalid GitLab API response');
          }
        } else {
          newDevInfo = {name: 'Unknown', picUrl: ''};
          console.error(`Unsupported platform: ${platform}`);
        }

        setDevInfo(newDevInfo);
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

    if (url) {
      const cachedImage = localStorage.getItem(id);
      if (cachedImage) {
        setImageSrc(cachedImage);
      } else if (isOnline) {
        fetchAndStoreImage();
      }
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
        setImageSrc(
          type === 'avatar' ? (
            <User_Icon className="size-full p-2 dark:bg-LynxRaisinBlack/70 bg-white/70" />
          ) : (
            <div className={`${darkMode ? 'darkPattern' : 'lightPattern'}`} />
          ),
        );
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
          <User_Icon className="size-full p-2 dark:bg-LynxRaisinBlack/70 bg-white/70" />
        ) : (
          <div className={`${darkMode ? 'darkPattern' : 'lightPattern'} `} />
        ),
      );
    }
  }, [id, url, type, darkMode, isOnline]);

  return imageSrc;
}
