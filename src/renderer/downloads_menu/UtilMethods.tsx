import {CheckDuo_Icon, CloseSimple_Icon, DownloadDuo_Icon, Pause_Icon} from '../src/assets/icons/SvgIcons/SvgIcons';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'downloading':
      return 'primary';
    case 'paused':
      return 'warning';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'default';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'downloading':
      return <DownloadDuo_Icon className="size-4 text-blue-500" />;
    case 'paused':
      return <Pause_Icon className="size-3.5 text-warning" />;
    case 'completed':
      return <CheckDuo_Icon className="size-5 text-success" />;
    case 'cancelled':
      return <CloseSimple_Icon className="size-4 text-danger" />;
    default:
      return null;
  }
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const formatSpeed = (bytesPerSecond: number): string => {
  return formatBytes(bytesPerSecond) + '/s';
};

export const formatETA = (totalBytes: number, receivedBytes: number, bytesPerSecond: number): string => {
  if (bytesPerSecond === 0) return '--';
  const remainingBytes = totalBytes - receivedBytes;
  const etaSeconds = Math.ceil(remainingBytes / bytesPerSecond);

  if (etaSeconds < 60) return `${etaSeconds}s`;
  if (etaSeconds < 3600) return `${Math.floor(etaSeconds / 60)}m ${etaSeconds % 60}s`;
  return `${Math.floor(etaSeconds / 3600)}h ${Math.floor((etaSeconds % 3600) / 60)}m`;
};

export const getProgress = (received: number, total: number): number => {
  return (received / total) * 100;
};
