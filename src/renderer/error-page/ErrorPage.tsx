import {Button} from '@heroui/react';
import {motion, stagger, Variants} from 'framer-motion';
import {useMemo} from 'react';

import {Refresh3_Icon, ShieldCross_Icon} from '../src/assets/icons/SvgIcons/SvgIcons';

// Animation variants
const containerVariants: Variants = {
  hidden: {opacity: 0},
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      delayChildren: stagger(0.1),
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const iconVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
    rotate: -180,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.3,
    },
  },
};

const floatingVariants: Variants = {
  float: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.2, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export default function ErrorPage() {
  const errorInfo = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('url') || 'an unknown page';

    document.title = `Error - ${url}`;
    return {
      url,
      errorCode: params.get('errorCode') || 'N/A',
      errorDescription: params.get('errorDescription') || 'No description available.',
    };
  }, []);

  const handleRetry = () => {
    window.location.href = errorInfo.url;
  };

  return (
    <div
      className={
        'min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark ' +
        ' text-slate-300 flex flex-col justify-center items-center p-8 relative overflow-hidden'
      }>
      {/* Animated background elements */}
      <motion.div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate="pulse"
          variants={pulseVariants}
          className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate="pulse"
          transition={{delay: 1}}
          variants={pulseVariants}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"
        />
        <motion.div
          className={
            'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' +
            ' size-96 bg-purple-500/3 rounded-full blur-3xl'
          }
          animate="pulse"
          transition={{delay: 2}}
          variants={pulseVariants}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 max-w-4xl w-full text-center">
        {/* Icon with animation */}
        <motion.div variants={itemVariants} className="mb-8 relative">
          <motion.div
            animate="pulse"
            variants={pulseVariants}
            className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"
          />
          <motion.div whileHover="hover" variants={iconVariants} className="relative inline-block">
            <ShieldCross_Icon className="size-32 text-red-400 mx-auto" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold text-white mb-4">
          Oops! Something went wrong
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-400 mb-8">
          {"LynxHub couldn't load the page you requested"}
        </motion.p>

        {/* URL display */}
        <motion.div className="mb-8" variants={itemVariants}>
          <motion.p variants={itemVariants} className="text-lg mb-2 text-slate-300">
            Failed to load:
          </motion.p>
          <motion.div
            whileHover={{
              borderColor: 'rgb(59 130 246 / 0.5)',
              boxShadow: '0 0 20px rgb(59 130 246 / 0.1)',
            }}
            transition={{duration: 0.3}}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 shadow-xl">
            <code className="text-cyan-400 break-all font-mono text-sm md:text-base">{errorInfo.url}</code>
          </motion.div>
        </motion.div>

        {/* Error details */}
        <motion.div
          whileHover={{
            borderColor: 'rgb(148 163 184 / 0.5)',
            boxShadow: '0 0 30px rgb(0 0 0 / 0.2)',
          }}
          className={
            'bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl mb-8 text-left'
          }
          variants={itemVariants}
          transition={{duration: 0.3}}>
          <motion.h3 variants={itemVariants} className="text-lg font-semibold text-white mb-4 flex items-center">
            <motion.span
              animate={{scale: [1, 1.2, 1]}}
              transition={{duration: 2, repeat: Infinity}}
              className="w-2 h-2 bg-red-400 rounded-full mr-3"
            />
            Error Details
          </motion.h3>
          <div className="space-y-3 font-mono text-sm">
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-slate-400 font-medium min-w-24">Code:</span>
              <motion.span
                whileHover={{scale: 1.02}}
                transition={{duration: 0.2}}
                className="text-red-400 bg-red-400/10 px-3 py-1 rounded-lg border border-red-400/20">
                {errorInfo.errorCode}
              </motion.span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <span className="text-slate-400 font-medium">Description:</span>
              <motion.span
                whileHover={{scale: 1.01}}
                transition={{duration: 0.2}}
                className="text-slate-300 bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-600/50">
                {errorInfo.errorDescription}
              </motion.span>
            </motion.div>
          </div>
        </motion.div>

        {/* Action buttons */}

        <Button
          size="lg"
          color="primary"
          onPress={handleRetry}
          className="hover:scale-105"
          startContent={<Refresh3_Icon className="size-5" />}>
          Try Again
        </Button>

        {/* Additional help text */}
        <motion.div animate="float" variants={floatingVariants} className="mt-12 text-sm text-slate-500">
          <p>If this problem persists, please contact support or try refreshing the page.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
