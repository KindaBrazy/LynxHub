import TerminalOutput from './TerminalOutput';
import WebViewBrowser from './WebViewBrowser';

export default function WebUiViewer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 top-10">
      <TerminalOutput />
      <WebViewBrowser />
    </div>
  );
}
