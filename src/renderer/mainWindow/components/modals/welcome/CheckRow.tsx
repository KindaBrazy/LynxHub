import {Chip, Spinner} from '@heroui/react';
import {motion} from 'framer-motion';
import {useMemo} from 'react';

import {CheckResult, RowData} from './types';

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
    case 'skipped':
      return {color: 'default', label: 'Skipped'};
    default:
      return {color: 'default', label: 'Unknown'};
  }
}

type Props = {label: string; description?: string; status: RowData};

export default function CheckRow({label, description, status}: Props) {
  const {color, label: statusLabelText} = useMemo(() => getStatusProps(status.result), [status.result]);
  const isBusy = status.result === 'checking' || status.result === 'installing';
  const labelText = status.result === 'ok' && status.label ? status.label : statusLabelText;

  return (
    <motion.div
      className={'flex items-center justify-between p-3 bg-surface rounded-3xl border border-surface-secondary'}>
      <div>
        <div className="font-medium text-gray-800 dark:text-gray-100">{label}</div>
        {description && <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>}
      </div>

      <Chip color={color} variant="soft" className="gap-x-1">
        {isBusy && <Spinner size="sm" />}
        {labelText}
      </Chip>
    </motion.div>
  );
}
