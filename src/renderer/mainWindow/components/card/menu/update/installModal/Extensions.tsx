import {Spinner} from '@heroui-v3/react';
import {extractGitUrl, validateGitRepoUrl} from '@lynx_common/utils';
import gitIpc from '@lynx_shared/ipc/git';
import {startCase} from 'lodash-es';
import {RefObject, useEffect, useMemo, useState} from 'react';

import StepProgress from './StepProgress';

export interface InstallExtensionsProps {
  /** The list of git repository URLs representing the extensions to clone, along with a target directory inside the base module folder. */
  extensionsURLs: {urls: string[]; dir: string} | undefined;
  /** Ref to a function fired when all extensions have been cloned. */
  extensionsResolver: RefObject<(() => void) | null>;
}

/**
 * Handles the background cloning/installation of any required sub-extensions for a module.
 *
 * @param {InstallExtensionsProps} props - The component props.
 */
export default function InstallExtensions({extensionsURLs, extensionsResolver}: InstallExtensionsProps) {
  const [current, setCurrent] = useState<number>(0);
  const stepItems = useMemo(
    () =>
      (extensionsURLs?.urls || []).map(url => {
        const validUrl = validateGitRepoUrl(url);
        return startCase(extractGitUrl(validUrl).repo);
      }),
    [extensionsURLs?.urls],
  );

  useEffect(() => {
    setCurrent(0);

    async function startInstall() {
      const urls = extensionsURLs?.urls || [];

      for (const [index, extensionsURL] of urls.entries()) {
        try {
          const validUrl = validateGitRepoUrl(extensionsURL);
          await gitIpc.cloneShallowPromise({
            url: validUrl,
            directory: `${extensionsURLs?.dir}/${extractGitUrl(validUrl).repo}`,
            singleBranch: true,
            depth: 1,
          });
        } catch (e) {
          console.error(e);
        } finally {
          setCurrent(index + 1);
        }
      }
      extensionsResolver.current?.();
    }

    void startInstall();
  }, [extensionsURLs, extensionsResolver]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <span className="mt-4 text-xl font-semibold">Installing extensions, Please wait...</span>
      {stepItems.length === 0 ? (
        <Spinner size="lg" color="accent" />
      ) : (
        <StepProgress steps={stepItems} current={current} orientation="vertical" className="w-full max-w-md" />
      )}
    </div>
  );
}
