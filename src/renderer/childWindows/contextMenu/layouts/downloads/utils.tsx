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
