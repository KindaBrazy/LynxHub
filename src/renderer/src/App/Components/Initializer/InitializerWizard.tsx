import {Button, Image} from '@heroui/react';
import {AnimatePresence, motion} from 'framer-motion';
import {useMemo, useState} from 'react';

import {APP_ICON_TRANSPARENT, APP_NAME, APP_NAME_VERSION_V} from '../../../../../cross/CrossConstants';
import Initializer_Extensions from './Initializer_Extensions';
import {InitializerRequirements} from './Initializer_Requirements';

const containerVariants = {
  hidden: {opacity: 0, y: 10},
  enter: {opacity: 1, y: 0, transition: {when: 'beforeChildren', staggerChildren: 0.06}},
  exit: {opacity: 0, y: -6},
};

const cardVariants = {
  hidden: {opacity: 0, y: 10},
  enter: {opacity: 1, y: 0},
};

export default function OnboardingWizard() {
  const [step, setStep] = useState<number>(0);
  const [installedExtensions, setInstalledExtensions] = useState<string[]>([]);
  const [requirementsSatisfied, setRequirementsSatisfied] = useState<boolean>(false);
  const [installingExtensions, setInstallingExtensions] = useState<boolean>(false);

  const canGoNext = useMemo(
    () => requirementsSatisfied && !installingExtensions,
    [requirementsSatisfied, installedExtensions],
  );

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 p-6">
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
                {/* Logo-ish animated cat/lynx SVG */}
                <Image radius="full" className="size-10" src={APP_ICON_TRANSPARENT} />
              </div>
              <div>
                <div className="text-lg font-semibold">{APP_NAME_VERSION_V}</div>
                <div className="text-xs text-white/70">Let's get you setup</div>
              </div>
            </div>
            <div className="text-sm text-white/80">Step {step + 1} of 3</div>
          </div>

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
                  {/* Requirements card */}
                  <InitializerRequirements start={step === 1} setRequirementsSatisfied={setRequirementsSatisfied} />

                  <Initializer_Extensions
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
                  You're ready to go. Restart {APP_NAME} to apply changes and start using the app with your selected
                  tools and extensions.
                </motion.p>

                <motion.div className="mb-4" variants={cardVariants}>
                  <div className="bg-white/6 p-4 rounded-lg">
                    <div className="font-medium mb-2">Summary</div>
                    <div className="text-sm text-white/70">
                      Requirements: {`Git: ${'git'}`}, {`PowerShell: ${'pwsh'}`}, {`Module: ${'appModule'}`}
                    </div>
                    <div className="text-sm text-white/70 mt-2">
                      Extensions: {installedExtensions.join(', ') || 'None'}
                    </div>
                  </div>
                </motion.div>

                <motion.div className="flex gap-3" variants={cardVariants}>
                  <button
                    onClick={() => {
                      // TODO
                    }}
                    className="px-5 py-2 rounded-lg bg-emerald-400 text-slate-900 font-semibold shadow">
                    Restart {APP_NAME}
                  </button>

                  <button
                    onClick={() => {
                      // TODO
                    }}
                    className="px-5 py-2 rounded-lg bg-white/10 border border-white/20">
                    Finish without restart
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
