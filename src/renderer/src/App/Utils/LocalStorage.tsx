import {useEffect, useState} from 'react';

import {DevInfo, RepoDetails} from '../../../../cross/CrossTypes';
import {extractGitUrl} from '../../../../cross/CrossUtils';
import {useAppState} from '../Redux/Reducer/AppReducer';

/**
 * Fetches repository details from GitHub or GitLab API or local storage.
 * @param url - The GitHub or GitLab repository URL
 * @returns A promise that resolves to RepoDetails or undefined
 */
export async function fetchRepoDetails(url: string): Promise<RepoDetails | undefined> {
  if (!url) return undefined;

  const {owner, repo, platform} = extractGitUrl(url);

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
    } else if (platform === 'gitlab') {
      apiUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(`${owner}/${repo}`)}`;
      const response = await fetch(apiUrl);
      const {forks_count, star_count} = await response.json();

      if (!star_count || !forks_count) return undefined;

      repoDetails = {
        forks: forks_count,
        stars: star_count,
      };
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
