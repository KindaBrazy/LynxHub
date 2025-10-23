import {Alert, Button} from '@heroui/react';
import {motion} from 'framer-motion';
import {useCallback, useEffect, useState} from 'react';

import {APP_NAME} from '../../../../../../cross/CrossConstants';
import {CheckDuo_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../../RendererIpc';
import CheckRow from '../components/CheckRow';
import {RowData} from '../types';

const containerVariants = {
  hidden: {opacity: 0, y: 20},
  enter: {opacity: 1, y: 0, transition: {staggerChildren: 0.1}},
  exit: {opacity: 0, y: -20},
};

const itemVariants = {hidden: {opacity: 0, y: 10}, enter: {opacity: 1, y: 0}};

type Props = {onComplete: () => void};

export default function StepUpdate({onComplete}: Props) {
  const [pwsh, setPwsh] = useState<RowData>({result: 'unknown'});
  const pwshSatisfied = pwsh.result === 'ok';

  const checkPwsh = useCallback(() => {
    setPwsh({result: 'checking'});
    rendererIpc.init
      .checkPwsh7Installed()
      .then(result => setPwsh(result ? {result: 'ok', label: result} : {result: 'failed'}))
      .catch(() => setPwsh({result: 'failed'}));
  }, []);

  useEffect(() => {
    checkPwsh();
  }, [checkPwsh]);

  return (
    <motion.div exit="exit" key="update" animate="enter" initial="hidden" className="pt-8" variants={containerVariants}>
      <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
        Welcome back to {APP_NAME}!
      </motion.h1>
      <motion.p variants={itemVariants} className="max-w-3xl text-lg text-gray-600 dark:text-gray-300 mb-8">
        I've updated some system requirements. Before you continue, I just need to ensure you have PowerShell 7+
        installed.
      </motion.p>

      <motion.div variants={itemVariants} className="bg-gray-50 dark:bg-white/10 p-6 rounded-xl my-6">
        <CheckRow status={pwsh} label="PowerShell 7+" description="Required for new features (pwsh v7 or later)" />
        {pwsh.result === 'failed' && (
          <Alert
            endContent={
              <Button
                onPress={() =>
                  rendererIpc.win.openUrlDefaultBrowser('https://github.com/PowerShell/PowerShell/releases/latest')
                }
                size="sm"
                variant="flat"
                color="warning">
                Download
              </Button>
            }
            color="warning"
            className="mt-4"
            title="PowerShell 7+ is Missing"
            description="PowerShell 7 or later is now required. Please install it to continue."
          />
        )}
      </motion.div>

      <motion.div className="flex gap-3" variants={itemVariants}>
        <Button
          variant="shadow"
          onPress={onComplete}
          className="font-semibold"
          isDisabled={!pwshSatisfied}
          color={pwshSatisfied ? 'success' : 'default'}
          startContent={pwshSatisfied && <CheckDuo_Icon className="size-5" />}>
          {pwshSatisfied ? `Finish & Restart ${APP_NAME}` : 'Waiting for PowerShell...'}
        </Button>
      </motion.div>
    </motion.div>
  );
}
