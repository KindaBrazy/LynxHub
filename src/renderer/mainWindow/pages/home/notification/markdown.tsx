import {Fragment, ReactNode} from 'react';

/**
 * A lightweight, safe parser to render basic markdown formatting in React.
 * Supports:
 * - Bold: **text**
 * - Italic: *text*
 * - Inline Code: `text`
 * - Links: [label](url)
 */
export function formatMarkdown(text: string | null | undefined): ReactNode {
  if (!text) return '';

  const lines = text.split('\n');

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // 1. Headings
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} className="text-sm font-bold mt-2.5 mb-0.5 text-foreground leading-snug">
              {parseLineContent(trimmed.substring(4))}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} className="text-base font-extrabold mt-3.5 mb-1 text-foreground leading-snug">
              {parseLineContent(trimmed.substring(3))}
            </h2>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={i} className="text-lg font-black mt-4 mb-1.5 text-foreground leading-snug">
              {parseLineContent(trimmed.substring(2))}
            </h1>
          );
        }

        // 2. List Items
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2 pl-2 my-0.5">
              <span className="mt-2 size-1 rounded-full bg-foreground/60 flex-shrink-0" />
              <div className="flex-1 text-xs sm:text-sm leading-relaxed">{parseLineContent(trimmed.substring(2))}</div>
            </div>
          );
        }

        // 3. Empty Line
        if (trimmed === '') {
          return <div key={i} className="h-1.5" />;
        }

        // 4. Paragraph
        return (
          <p key={i} className="my-0.5 text-xs sm:text-sm leading-relaxed">
            {parseLineContent(line)}
          </p>
        );
      })}
    </div>
  );
}

function parseLineContent(text: string): ReactNode {
  // Match links: [label](url)
  const linkRegex = /(\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(linkRegex);

  return parts.map((part, i) => {
    // Check if this part is a link
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        const [, label, url] = match;
        const isSafeUrl = /^https?:\/\//i.test(url) || url.startsWith('/') || url.startsWith('#');
        const safeUrl = isSafeUrl ? url : '#';
        return (
          <a
            key={i}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open link: ${label}`}
            className="text-accent hover:underline font-semibold">
            {label}
          </a>
        );
      }
    }

    // Otherwise, parse bold, italic, and inline code within this text segment
    return parseInlineStyles(part, i);
  });
}

function parseInlineStyles(text: string, keyPrefix: string | number): ReactNode {
  // We can use a regex to match bold (**), italic (*), and code (`)
  const styleRegex = /(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`|\*[^*]+\*)/g;
  const tokens = text.split(styleRegex);

  if (tokens.length === 1) {
    return text;
  }

  return (
    <Fragment key={keyPrefix}>
      {tokens.map((token, index) => {
        if (token.startsWith('**') && token.endsWith('**')) {
          return (
            <strong key={index} className="font-bold text-foreground">
              {token.slice(2, -2)}
            </strong>
          );
        }
        if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
          return (
            <em key={index} className="italic">
              {token.slice(1, -1)}
            </em>
          );
        }
        if (token.startsWith('`') && token.endsWith('`')) {
          return (
            <code
              className={
                'font-JetBrainsMono bg-default/50 px-1 py-0.5 rounded ' + 'text-xs text-warning border border-border/30'
              }
              key={index}>
              {token.slice(1, -1)}
            </code>
          );
        }
        return token;
      })}
    </Fragment>
  );
}
