import rendererIpc from '@renderer/App/RendererIpc';
import {Steps} from 'antd';
import {startCase} from 'lodash';
import {MutableRefObject, useEffect, useState} from 'react';

import {extractGitUrl, validateGitRepoUrl} from '../../../../../../../cross/CrossUtils';

type Props = {
  extensionsURLs: {urls: string[]; dir: string} | undefined;
  extensionsResolver: MutableRefObject<(() => void) | null>;
};

export default function InstallExtensions({extensionsURLs, extensionsResolver}: Props) {
  const [current, setCurrent] = useState<number>(0);
  const [steps, setSteps] = useState<{title: string}[]>([]);

  useEffect(() => {
    setSteps(
      extensionsURLs?.urls
        .map(url => {
          const validUrl = validateGitRepoUrl(url);
          return {
            title: startCase(extractGitUrl(validUrl).repo),
          };
        })
        .filter(Boolean) || [],
    );
    setCurrent(0);

    async function startInstall() {
      console.log('extensionsURLs', extensionsURLs);
      for (const extensionsURL of extensionsURLs?.urls || []) {
        console.log('installing: ', extensionsURL);
        try {
          const validUrl = validateGitRepoUrl(extensionsURL);
          await rendererIpc.git.clonePromise(validUrl, `${extensionsURLs?.dir}/${extractGitUrl(validUrl).repo}`);
          setCurrent(prevState => prevState + 1);
        } catch (e) {
          console.error(e);
          setCurrent(prevState => prevState + 1);
        }
      }
      extensionsResolver.current?.();
    }

    startInstall();
  }, [extensionsURLs]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <span className="mt-4 text-xl font-semibold">Installing extensions, Please wait...</span>
      <Steps items={steps} current={current} direction="vertical" className="ml-10 w-fit" />
    </div>
  );
}
