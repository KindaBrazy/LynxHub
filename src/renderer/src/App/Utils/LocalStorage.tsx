import {RepoDetails} from '../../../../cross/CrossTypes';
import {extractGitUrl} from '../../../../cross/CrossUtils';

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
