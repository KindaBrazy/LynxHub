import {Chip, Spinner} from '@heroui/react';
import {motion} from 'framer-motion';

import {CheckResult, RowData} from '../types';

function getStatusProps(status: CheckResult): {color: 'success' | 'danger' | 'default'; label: string} {
  switch (status) {
    case 'ok':
      return {color: 'success', label: 'Ready'};
    case 'failed':
      return {color: 'danger', label: 'Missing'};
    case 'checking':
      return {color: 'default', label: 'Checking...'};
    case 'installing':
      return {color: 'default', label: 'Installing...'};
    default:
      return {color: 'default', label: 'Unknown'};
  }
}

type Props = {label: string; description?: string; status: RowData};

export default function CheckRow({label, description, status}: Props) {
  const {color, label: statusLabelText} = getStatusProps(status.result);
  const isBusy = status.result === 'checking' || status.result === 'installing';
  const labelText = status.result === 'ok' && status.label ? status.label : statusLabelText;

  return (
    <motion.div
      className={
        'flex items-center justify-between p-3 bg-white dark:bg-gray-900/50' +
        ' rounded-lg border border-gray-200 dark:border-gray-700/50'
      }>
      <div>
        <div className="font-medium text-gray-800 dark:text-gray-100">{label}</div>
        {description && <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>}
      </div>

      <Chip
        classNames={{
          base: 'text-xs font-semibold',
          content: 'flex items-center gap-1.5',
        }}
        color={color}
        variant="flat"
        startContent={isBusy && <Spinner size="sm" color="current" />}>
        {labelText}
      </Chip>
    </motion.div>
  );
}
