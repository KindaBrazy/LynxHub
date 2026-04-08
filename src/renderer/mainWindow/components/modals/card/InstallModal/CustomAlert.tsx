import {Alert, AlertProps, Button, Link} from '@heroui/react';
import {AlertTypes, CustomAlertParams, InitialStep} from '@lynx_common/types/plugins/modules';
import {SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';

function getAlertColor(type?: AlertTypes): AlertProps['color'] {
  if (!type) return 'default';

  switch (type) {
    case 'note':
      return 'primary';
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
    <Alert
      description={
        alert.urls && alert.urls.length > 0 ? (
          <div className="flex flex-col gap-y-2 w-full">
            <span>{alert.description}</span>
            {alert.urls.map(url => (
              <Link
                size="sm"
                as={Button}
                variant="flat"
                key={url.title}
                color="foreground"
                endContent={<SquareTopDown />}
                onPress={() => window.open(url.url)}
                isExternal>
                {url.title}
              </Link>
            ))}
          </div>
        ) : (
          alert.description
        )
      }
      key={alert.title}
      title={alert.title}
      color={getAlertColor(alert.type)}
      classNames={{title: alert.description && 'text-start font-bold', description: 'w-full text-start'}}
    />
  );
}

export function renderAlerts(currentStep: InitialStep) {
  if (!currentStep || typeof currentStep === 'string') return null;
  return currentStep.alerts.map(alert => <CustomAlert alert={alert} key={alert.title} />);
}
