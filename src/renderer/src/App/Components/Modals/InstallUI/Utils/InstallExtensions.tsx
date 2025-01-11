import {Spinner} from '@nextui-org/react';
import {StepProps, Steps} from 'antd';
import {startCase} from 'lodash';
import {RefObject, useEffect, useState} from 'react';

import {extractGitUrl, validateGitRepoUrl} from '../../../../../../../cross/CrossUtils';
import rendererIpc from '../../../../RendererIpc';

type Props = {
  extensionsURLs: {urls: string[]; dir: string} | undefined;
  extensionsResolver: RefObject<(() => void) | null>;
};

export default function InstallExtensions({extensionsURLs, extensionsResolver}: Props) {
  const [current, setCurrent] = useState<number>(0);
  const [steps, setSteps] = useState<StepProps[]>([]);

  useEffect(() => {
    setSteps(prevState =>
      prevState.map((step, index) => {
        if (index === current) {
          return {...step, icon: <Spinner />};
        } else {
          return {...step, icon: undefined};
        }
      }),
    );
  }, [current, setSteps]);

  useEffect(() => {
    setSteps(
      extensionsURLs?.urls
        .map((url, index) => {
          const validUrl = validateGitRepoUrl(url);
          return {
            title: startCase(extractGitUrl(validUrl).repo),
            icon: index === 0 ? <Spinner /> : undefined,
          };
        })
        .filter(Boolean) || [],
    );

    setCurrent(0);

    async function startInstall() {
      for (const extensionsURL of extensionsURLs?.urls || []) {
        try {
          const validUrl = validateGitRepoUrl(extensionsURL);
          await rendererIpc.git.cloneShallowPromise(
            validUrl,
            `${extensionsURLs?.dir}/${extractGitUrl(validUrl).repo}`,
            true,
            1,
          );
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
