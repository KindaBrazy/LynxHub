import {Alert, Button, Image} from '@heroui/react';
import {AnimatePresence, motion} from 'framer-motion';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {APP_ICON_TRANSPARENT, APP_NAME, APP_NAME_VERSION_V} from '../../../../../cross/CrossConstants';
import {CheckDuo_Icon} from '../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../RendererIpc';
import Initializer_Extensions from './Initializer_Extensions';
import {InitializerRequirements} from './Initializer_Requirements';
import {RowData, WizardProps} from './InitTypes';
import CheckRow from './Req_CheckRow';

const containerVariants = {
  hidden: {opacity: 0, y: 10},
  enter: {opacity: 1, y: 0, transition: {when: 'beforeChildren', staggerChildren: 0.06}},
  exit: {opacity: 0, y: -6},
};

const cardVariants = {
  hidden: {opacity: 0, y: 10},
  enter: {opacity: 1, y: 0},
};

export default function OnboardingWizard({isOldDone}: WizardProps) {
  const [step, setStep] = useState<number>(0);
  const [installedExtensions, setInstalledExtensions] = useState<string[]>([]);
  const [requirementsSatisfied, setRequirementsSatisfied] = useState<boolean>(false);
  const [installingExtensions, setInstallingExtensions] = useState<boolean>(false);
  const [reqStatus, setReqStatus] = useState({git: '', pwsh: '', appModule: ''});

  const [pwsh, setPwsh] = useState<RowData>({result: 'unknown'});
  const [pwshSatisfied, setPwshSatisfied] = useState<boolean>(false);

  const canGoNext = useMemo(
    () => requirementsSatisfied && !installingExtensions,
    [requirementsSatisfied, installingExtensions],
  );

  const onComplete = useCallback(() => {
    rendererIpc.storage.update('app', {inited: true});
    rendererIpc.win.changeWinState('restart');
  }, []);

  const checkPwsh = useCallback(() => {
    setPwsh({result: 'checking'});
    rendererIpc.init
      .checkPwsh7Installed()
      .then(result => {
        if (result) {
          setPwsh({result: 'ok', label: result});
          setPwshSatisfied(true);
        } else {
          setPwsh({result: 'failed'});
          setPwshSatisfied(false);
        }
      })
      .catch(() => {
        setPwsh({result: 'failed'});
        setPwshSatisfied(false);
      });
  }, []);

  useEffect(() => {
    if (isOldDone) {
      checkPwsh();
    }
  }, [isOldDone, checkPwsh]);

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 p-6">
      <div
        className={
          'relative bg-gradient-to-br from-slate-900/95 via-indigo-900/95 to-sky-900/95' +
          ' rounded-2xl shadow-2xl overflow-hidden'
        }>
        {/* Background animated shapes */}
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 0.14}}
          transition={{duration: 1.6}}
          className="absolute inset-0 pointer-events-none">
          <svg
            viewBox="0 0 800 600"
            className="w-full h-full"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient x1="0" x2="1" y1="0" y2="1" id="g1">
                <stop offset="0%" stopOpacity="0.35" stopColor="#4f46e5" />
                <stop offset="100%" stopOpacity="0.22" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <motion.path
              fill="url(#g1)"
              initial={{pathLength: 0}}
              animate={{pathLength: 1}}
              transition={{duration: 1.8}}
              d="M0 300 C150 200 350 400 800 200 L800 600 L0 600 Z"
            />
          </svg>
        </motion.div>

        <div className="relative z-10 p-8 md:p-12">
          <div className="flex items-center justify-between text-white mb-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/10 p-1">
                <Image radius="full" className="size-10" src={APP_ICON_TRANSPARENT} />
              </div>
              <div>
                <div className="text-lg font-semibold">{APP_NAME_VERSION_V}</div>
                <div className="text-xs text-white/70">Let's get you setup</div>
              </div>
            </div>
            <div className="text-sm text-white/80">{isOldDone ? 'Updating Requirements' : `Step ${step + 1} of 3`}</div>
          </div>

          {isOldDone ? (
            <motion.div
              animate="enter"
              initial="hidden"
              key="welcome-back"
              className="text-white"
              variants={containerVariants}>
              <motion.h1 variants={cardVariants} className="text-3xl md:text-4xl font-extrabold mb-3">
                Welcome back to {APP_NAME}!
              </motion.h1>
              <motion.p variants={cardVariants} className="max-w-2xl text-white/80 mb-6">
                Updated some requirements for newer versions. Just need to ensure you have PowerShell 7+ installed and
                you'll be good to go.
              </motion.p>
              <motion.div variants={cardVariants} className="bg-white/6 p-4 rounded-xl my-6">
                <CheckRow status={pwsh} label="PowerShell 7+" description="pwsh (v7 or later)" />
                {pwsh.result === 'failed' && (
                  <Alert
                    endContent={
                      <Button
                        onPress={() =>
                          rendererIpc.win.openUrlDefaultBrowser(
                            'https://github.com/PowerShell/PowerShell/releases/latest',
                          )
                        }
                        size="sm"
                        variant="flat"
                        color="warning"
                        className="light">
                        Website
                      </Button>
                    }
                    color="warning"
                    className="mt-4 max-h-16"
                    title="PowerShell 7+ is Missing"
                    classNames={{title: 'text-[9pt]', description: 'text-[8pt]'}}
                    description="PowerShell 7 or a later version is required. Please install it."
                  />
                )}
              </motion.div>
              <motion.div className="flex gap-3" variants={cardVariants}>
                <Button
                  color="success"
                  variant="shadow"
                  onPress={onComplete}
                  isDisabled={!pwshSatisfied}
                  className="light font-semibold"
                  startContent={<CheckDuo_Icon className="size-5" />}>
                  {pwshSatisfied ? `Finish & Restart ${APP_NAME}` : 'Waiting for PowerShell...'}
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {step === 0 && (
                <motion.div
                  exit="exit"
                  key="welcome"
                  animate="enter"
                  initial="hidden"
                  className="text-white"
                  variants={containerVariants}>
                  <motion.h1 variants={cardVariants} className="text-3xl md:text-4xl font-extrabold mb-3">
                    Welcome to {APP_NAME}
                  </motion.h1>
                  <motion.p variants={cardVariants} className="max-w-2xl text-white/80 mb-6">
                    Thanks for installing {APP_NAME}! I'll walk you through a quick setup to check requirements and get
                    the tools and extensions you need.
                  </motion.p>

                  <motion.div className="flex gap-3" variants={cardVariants}>
                    <Button color="default" className="light" onPress={() => setStep(1)}>
                      Start setup
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  exit="exit"
                  key="checks"
                  animate="enter"
                  initial="hidden"
                  className="text-white"
                  variants={containerVariants}>
                  <motion.h2 variants={cardVariants} className="text-2xl font-bold mb-3">
                    System checks & extensions
                  </motion.h2>
                  <motion.p variants={cardVariants} className="mb-6 text-white/80">
                    Ensuring all requirements are satisfied and select extensions you are interested to use.
                  </motion.p>

                  <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <InitializerRequirements
                      start={step === 1}
                      setReqStatus={setReqStatus}
                      setRequirementsSatisfied={setRequirementsSatisfied}
                    />

                    <Initializer_Extensions
                      isInstalling={installingExtensions}
                      requirementsSatisfied={requirementsSatisfied}
                      setInstalledExtensions={setInstalledExtensions}
                      setInstallingExtensions={setInstallingExtensions}
                    />
                  </motion.div>

                  <motion.div variants={cardVariants} className="flex justify-end items-center">
                    <Button className="light" isDisabled={!canGoNext} onPress={() => setStep(2)}>
                      {canGoNext
                        ? 'Continue'
                        : installingExtensions
                          ? 'Wait for Extensions Installation'
                          : 'Complete Requirements to Continue'}
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="done"
                  exit="exit"
                  animate="enter"
                  initial="hidden"
                  className="text-white"
                  variants={containerVariants}>
                  <motion.h2 variants={cardVariants} className="text-3xl font-extrabold mb-3">
                    All done!
                  </motion.h2>
                  <motion.p variants={cardVariants} className="text-white/80 mb-6">
                    You're ready to go. Restart {APP_NAME} to apply changes and start using the app.
                  </motion.p>

                  <motion.div className="mb-4" variants={cardVariants}>
                    <div className="bg-white/6 p-4 rounded-lg">
                      <div className="font-medium mb-2">Summary</div>
                      <div className="text-sm text-white/70">
                        Requirements: {`Git: ${reqStatus.git}`}, {`PowerShell: ${reqStatus.pwsh}`},{' '}
                        {`Module: ${reqStatus.appModule}`}
                      </div>
                      <div className="text-sm text-white/70 mt-2">
                        Extensions: {installedExtensions.join(', ') || 'None!'}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="flex gap-3" variants={cardVariants}>
                    <Button
                      color="success"
                      variant="shadow"
                      onPress={onComplete}
                      className="light font-semibold"
                      startContent={<CheckDuo_Icon className="size-5" />}>
                      Restart {APP_NAME}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
