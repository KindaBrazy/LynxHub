import Highlighter from 'react-highlight-words';

import {useSettingsSearchHighlightWords} from './SettingsSearchHighlightContext';

type Props = {
  text?: string;
  children?: string;
  className?: string;
  highlightClassName?: string;
};

const SettingsSearchHighlight = ({text, children, className, highlightClassName}: Props) => {
  const searchWords = useSettingsSearchHighlightWords();
  const content = text ?? children ?? '';

  if (!content) {
    return null;
  }

  if (!searchWords.length) {
    return <span className={className}>{content}</span>;
  }

  return (
    <Highlighter
      autoEscape
      className={className}
      highlightClassName={highlightClassName ?? 'bg-warning/40 rounded-sm px-0.5'}
      searchWords={searchWords}
      textToHighlight={content}
    />
  );
};

export default SettingsSearchHighlight;
