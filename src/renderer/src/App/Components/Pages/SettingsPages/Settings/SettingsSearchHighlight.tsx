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
      className={className}
      searchWords={searchWords}
      textToHighlight={content}
      highlightClassName={highlightClassName ?? 'bg-warning/40 rounded-sm px-0.5'}
      autoEscape
    />
  );
};

export default SettingsSearchHighlight;
