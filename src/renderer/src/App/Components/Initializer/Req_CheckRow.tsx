import {Chip, Spinner} from '@heroui/react';
import {motion} from 'framer-motion';
import {useMemo} from 'react';

import {CheckResult, RowData} from './InitTypes';

function statusColor(s: CheckResult) {
  switch (s) {
    case 'ok':
      return 'success';
    case 'failed':
      return 'danger';
    case 'installing':
    case 'checking':
    default:
      return 'default';
  }
}

function statusLabel(s: RowData) {
  switch (s.result) {
    case 'ok':
      return s.label || 'Done';
    case 'failed':
      return 'Missing';
    case 'checking':
      return 'Checking';
    case 'installing':
      return 'Installing';
    default:
      return 'Unknown';
  }
}

type CheckRowProps = {
  label: string;
  description?: string;
  status: RowData;
};

export default function CheckRow({label, description, status}: CheckRowProps) {
  const useBgWhite = useMemo(
    () => status.result === 'unknown' || status.result === 'checking' || status.result === 'installing',
    [status],
  );
  return (
    <motion.div
      whileTap={{scale: 0.98}}
      whileHover={{scale: 1.02}}
      transition={{duration: 0.2}}
      className="flex items-center justify-between">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-white/60">{description}</div>
      </div>

      <div className="flex items-center gap-3 light">
        <Chip
          startContent={
            (status.result === 'checking' || status.result === 'installing') && (
              <Spinner size="sm" className="mr-1" variant="gradient" />
            )
          }
          variant="flat"
          color={statusColor(status.result)}
          classNames={{content: 'flex items-center'}}
          className={`${useBgWhite && 'bg-white/10 text-white/70 '}` + ` text-xs`}>
          {statusLabel(status)}
        </Chip>
      </div>
    </motion.div>
  );
}
