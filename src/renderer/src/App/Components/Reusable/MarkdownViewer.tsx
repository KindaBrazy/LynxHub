import {Spinner} from '@nextui-org/react';
import {Result} from 'antd';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import React, {useEffect, useState} from 'react';
import type {Components} from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import {useAppState} from '../../Redux/App/AppReducer';

interface MarkdownViewerProps {
  repoPath: string;
}

// Define custom props for components that need additional properties
interface CustomDivProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-align'?: string;
}

interface CustomCodeProps extends React.HTMLAttributes<HTMLElement> {
  'data-inline'?: boolean;
}

export default function MarkdownViewer({repoPath}: MarkdownViewerProps) {
  const [content, setContent] = useState<string>('');
  const isDarkMode = useAppState('darkMode');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const fetchReadme = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${repoPath}/readme`, {
          headers: {
            Accept: 'application/vnd.github.raw+json',
          },
        });

        if (!response.ok) {
          setError('README is not accessible.');
        }

        const data = await response.text();
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch README');
      } finally {
        setLoading(false);
      }
    };

    fetchReadme();
  }, []);

  const transformImageUrl = (src: string) => {
    if (src.startsWith('http')) {
      return src;
    }

    if (repoPath) {
      const cleanPath = src.replace(/^\.?\//, '');
      return `https://raw.githubusercontent.com/${repoPath}/HEAD/${cleanPath}`;
    }

    return src;
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href');
    if (href?.startsWith('#')) {
      e.preventDefault();
      const element = document.getElementById(href.slice(1));
      if (element) {
        element.scrollIntoView({behavior: 'smooth'});
      }
    }
  };

  const components: Components = {
    img: ({src, alt, height, width, ...props}) => {
      const style: React.CSSProperties = {};

      if (height) {
        style.height = `${height}px`;
        style.objectFit = 'contain';
      }

      if (width) {
        style.width = `${width}px`;
      }

      return (
        <img
          onError={e => {
            const target = e.target as HTMLImageElement;
            if (target.src.includes('/HEAD/')) {
              target.src = target.src.replace('/HEAD/', '/master/');
            }
          }}
          style={style}
          loading="lazy"
          alt={alt || ''}
          src={transformImageUrl(src || '')}
          className="mx-1 inline-block rounded-md shadow-sm"
          {...props}
        />
      );
    },
    a: ({href, children, ...props}) => {
      if (href?.startsWith('#')) {
        return (
          <a
            href={href}
            onClick={handleLinkClick}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            {...props}>
            {children}
          </a>
        );
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          {...props}>
          {children}
        </a>
      );
    },
    code: ({className, children, 'data-inline': inline, ...props}: CustomCodeProps) => {
      const language = /language-(\w+)/.exec(className || '');

      if (inline) {
        return (
          <code className="rounded bg-gray-100 px-1 py-0.5 text-sm dark:bg-gray-800" {...props}>
            {children}
          </code>
        );
      }

      return (
        <code className={language ? className : ''} {...props}>
          {children}
        </code>
      );
    },
    pre: ({children, ...props}) => (
      <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800" {...props}>
        {children}
      </pre>
    ),
    div: ({className, 'data-align': align, children, ...props}: CustomDivProps) => (
      <div
        className={`${className || ''} ${
          align === 'center' ? 'flex flex-wrap items-center justify-center gap-2 text-center' : ''
        }`}
        {...props}>
        {children}
      </div>
    ),
    p: ({children, ...props}) => {
      const childArray = React.Children.toArray(children);
      const hasOnlyImages = childArray.every(child => React.isValidElement(child) && child.type === 'img');
      const hasMultipleImages =
        childArray.filter(child => React.isValidElement(child) && child.type === 'img').length > 1;

      return (
        <p
          className={
            ` ${hasOnlyImages ? 'flex flex-wrap gap-2' : ''} ` +
            ` ${hasMultipleImages ? 'flex-col items-start' : 'items-center'} `
          }
          {...props}>
          {children}
        </p>
      );
    },
    kbd: ({...props}) => (
      <kbd
        className={
          'rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs' +
          ' font-semibold text-gray-800 dark:border-gray-500 dark:bg-gray-600' +
          ' dark:text-gray-100'
        }
        {...props}
      />
    ),
    details: ({...props}) => <details className="my-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50" {...props} />,
    summary: ({...props}) => <summary className="cursor-pointer font-medium" {...props} />,
  };

  return loading ? (
    <Spinner size="lg" color="primary" className="size-full" label="Please wait..." />
  ) : error ? (
    <Result title={error} status="error" subTitle="Please check your internet and try again." />
  ) : (
    <OverlayScrollbarsComponent
      options={{
        overflow: {x: 'hidden', y: 'scroll'},
        scrollbars: {
          autoHide: 'scroll',
          clickScroll: true,
          theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
        },
      }}
      className="size-full">
      <div className="prose prose-slate mr-4 max-w-none rounded-xl bg-white p-8 dark:prose-invert dark:bg-[#0d1117]">
        <ReactMarkdown
          components={components}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeSlug]}>
          {content}
        </ReactMarkdown>
      </div>
    </OverlayScrollbarsComponent>
  );
}
