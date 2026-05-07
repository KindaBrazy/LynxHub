import {Spinner} from '@heroui/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import {extractGitUrl} from '@lynx_common/utils';
import {Link} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash-es';
import {
  Children,
  CSSProperties,
  HTMLAttributes,
  isValidElement,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import ReactMarkdown, {Components} from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import LynxScroll from './LynxScroll';

type MarkdownViewerProps = {
  url: string;
  rounded?: boolean;
  showBackground?: boolean;
  urlType?: 'repository' | 'raw';
};

type CustomDivProps = HTMLAttributes<HTMLDivElement> & {
  'data-align'?: string;
};

type CustomCodeProps = HTMLAttributes<HTMLElement> & {
  'data-inline'?: boolean;
};

/**
 * Custom hook to fetch markdown content.
 */
const useMarkdownContent = (url: string, urlType: MarkdownViewerProps['urlType']) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const repository = useMemo(() => {
    if (urlType === 'raw' || !url) return '';
    const {repo, owner} = extractGitUrl(url);
    return `${owner}/${repo}`;
  }, [url, urlType]);

  useEffect(() => {
    setLoading(true);
    setError('');
    setContent('');

    const controller = new AbortController();

    const fetchContent = async () => {
      try {
        let urlToFetch: string | undefined;
        const fetchOptions: RequestInit = {signal: controller.signal};
        let notFoundMessage = 'Content is not accessible.';

        if (urlType === 'raw') {
          urlToFetch = url;
        } else if (!isEmpty(repository)) {
          urlToFetch = `https://api.github.com/repos/${repository}/readme`;
          fetchOptions.headers = {
            Accept: 'application/vnd.github.raw+json',
          };
          notFoundMessage = 'README is not accessible.';
        }

        if (!urlToFetch) {
          setLoading(false);
          return;
        }

        const response = await fetch(urlToFetch, fetchOptions);

        if (!response.ok) {
          setError(notFoundMessage);
          return;
        }

        const data = await response.text();
        setContent(data);
      } catch (err) {
        // Ignore abort errors when component unmounts
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // Handle network errors gracefully
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          setError('Unable to connect. Please check your internet connection.');
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to fetch content');
      } finally {
        setLoading(false);
      }
    };

    void fetchContent();

    return () => controller.abort();
  }, [url, urlType, repository]);

  return {content, loading, error, repository};
};

/**
 * Renders a markdown viewer with syntax highlighting, raw HTML support, and GitHub integration.
 */
const MarkdownViewer = ({url, rounded = true, showBackground, urlType}: MarkdownViewerProps) => {
  const {content, loading, error, repository} = useMarkdownContent(url, urlType);

  const transformImageUrl = useCallback(
    (src: string) => {
      if (src.startsWith('http')) {
        return src;
      }

      if (urlType === 'raw' && url) {
        try {
          // Resolve relative paths against the full URL of the markdown file
          return new URL(src, url).href;
        } catch (e) {
          console.error('Failed to construct image URL', e);
          return src; // Fallback to original src if URL parsing fails
        }
      }

      if (repository) {
        const cleanPath = src.replace(/^\.?\//, '');
        return `https://raw.githubusercontent.com/${repository}/HEAD/${cleanPath}`;
      }

      return src;
    },
    [repository, urlType, url],
  );

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href');
    if (href?.startsWith('#')) {
      e.preventDefault();
      const element = document.getElementById(href.slice(1));
      if (element) {
        element.scrollIntoView({behavior: 'smooth'});
      }
    }
  };

  const components: Components = useMemo(
    () => ({
      img: ({src, alt, height, width, ...props}) => {
        const style: CSSProperties = {};

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
            className="mx-1 inline-block"
            src={transformImageUrl(src || '')}
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
            <code className="rounded bg-gray-100 dark:bg-gray-800 px-1 py-0.5 text-semi-muted text-sm" {...props}>
              {children}
            </code>
          );
        }

        return (
          <code className={`${language ? className : ''} text-semi-muted`} {...props}>
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
        const childArray = Children.toArray(children);
        const hasOnlyImages = childArray.every(child => isValidElement(child) && child.type === 'img');
        const hasMultipleImages = childArray.filter(child => isValidElement(child) && child.type === 'img').length > 1;

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
      kbd: ({...props}) => <kbd {...props} />,
      details: ({...props}) => <details className="my-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50" {...props} />,
      summary: ({...props}) => <summary className="cursor-pointer font-medium" {...props} />,
    }),
    [transformImageUrl],
  );

  return loading ? (
    <div className="flex flex-col items-center gap-2 size-full justify-center py-4">
      <Spinner size="lg" color="accent" />
      <span className="text-xs text-muted">Please wait...</span>
    </div>
  ) : error ? (
    <EmptyStateCard
      title={error}
      bodyClassName="py-8"
      className="mt-8 mx-16"
      icon={<Link size={45} className="text-warning" />}
      description="Please check your internet connection and try again."
    />
  ) : (
    <LynxScroll className={`size-full ${rounded && 'rounded-xl'}`}>
      <div
        className={
          `prose prose-slate mr-4 max-w-none rounded-xl p-8` +
          ` dark:prose-invert ${showBackground && 'bg-white dark:bg-[#0d1117]'}`
        }>
        <ReactMarkdown
          components={components}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeSlug]}>
          {content}
        </ReactMarkdown>
      </div>
    </LynxScroll>
  );
};

export default MarkdownViewer;
