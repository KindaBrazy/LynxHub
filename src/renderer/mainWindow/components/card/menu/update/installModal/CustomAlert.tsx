import {Alert, AlertProps, Link} from '@heroui/react';
import {AlertTypes, CustomAlertParams, InitialStep} from '@lynx_common/types/plugins/modules';

function getAlertColor(type?: AlertTypes): AlertProps['status'] {
  if (!type) return 'default';

  switch (type) {
    case 'note':
      return 'accent';
    case 'warning':
      return 'warning';
    case 'danger':
      return 'danger';
    case 'default':
    default:
      return 'default';
  }
}

type Props = {alert: CustomAlertParams};
export default function CustomAlert({alert}: Props) {
  return (
    <Alert className="bg-surface-secondary" status={getAlertColor(alert.type)}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{alert.title}</Alert.Title>
        <Alert.Description className="w-full text-start">
          {alert.urls && alert.urls.length > 0 ? (
            <div className="flex flex-col gap-y-2 w-full">
              <span>{alert.description}</span>
              {alert.urls.map(url => (
                <Link key={url.title} onPress={() => window.open(url.url)}>
                  {url.title}
                  <Link.Icon />
                </Link>
              ))}
            </div>
          ) : (
            alert.description
          )}
        </Alert.Description>
      </Alert.Content>
    </Alert>
  );
}

export function renderAlerts(currentStep: InitialStep) {
  if (!currentStep || typeof currentStep === 'string') return null;
  return currentStep.alerts.map(alert => <CustomAlert alert={alert} key={alert.title} />);
}
