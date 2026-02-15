import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Image, Tooltip} from '@heroui/react';
import {SearchQuerySites} from '@lynx_common/types';
import {getCacheUrl, getSearchUrl} from '@lynx_common/utils';
import {Earth, SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';
import {AnimatePresence, motion} from 'framer-motion';
import {memo, useCallback} from 'react';

const endContent = <SquareTopDown className="size-3 group-hover:opacity-100 opacity-0 transition duration-300" />;

type Props = {
  selectedTerminalText: string;
};

const SearchBy = memo(({selectedTerminalText}: Props) => {
  const searchSelectedText = useCallback(
    (key: SearchQuerySites) => {
      window.open(getSearchUrl(selectedTerminalText, key));
    },
    [selectedTerminalText],
  );

  return (
    <AnimatePresence>
      {selectedTerminalText && (
        <motion.div
          exit={{translateY: 5, opacity: 0, scale: 0.7}}
          animate={{translateY: 0, opacity: 1, scale: 1}}
          initial={{translateY: 5, opacity: 0, scale: 0.7}}>
          <Dropdown>
            <Tooltip delay={500} content="Search selected text by">
              <div className="max-w-fit">
                <DropdownTrigger>
                  <Button size="sm" variant="light" isIconOnly>
                    <Earth className="size-3.5" />
                  </Button>
                </DropdownTrigger>
              </div>
            </Tooltip>

            <DropdownMenu
              topContent={<span className="tracking-tighter text-foreground-700">Search selected text by:</span>}>
              <DropdownItem
                startContent={
                  <Image alt="Google icon" className="size-4" src={getCacheUrl('https://www.google.com/favicon.ico')} />
                }
                key="Google"
                endContent={endContent}
                onPress={() => searchSelectedText('Google')}>
                Google
              </DropdownItem>
              <DropdownItem
                startContent={
                  <Image
                    className="size-4"
                    alt="DuckDuckGo icon"
                    src={getCacheUrl('https://duckduckgo.com/favicon.ico')}
                  />
                }
                key="DuckDuckGo"
                endContent={endContent}
                onPress={() => searchSelectedText('DuckDuckGo')}>
                DuckDuckGo
              </DropdownItem>
              <DropdownItem
                startContent={
                  <Image alt="Reddit icon" className="size-4" src={getCacheUrl('https://www.reddit.com/favicon.ico')} />
                }
                key="Reddit"
                endContent={endContent}
                onPress={() => searchSelectedText('Reddit')}>
                Reddit
              </DropdownItem>
              <DropdownItem
                startContent={
                  <Image
                    alt="ChatGPT icon"
                    className="size-4"
                    src={getCacheUrl('https://chat.openai.com/favicon.ico')}
                  />
                }
                key="ChatGPT"
                endContent={endContent}
                onPress={() => searchSelectedText('ChatGPT')}>
                ChatGPT
              </DropdownItem>
              <DropdownItem
                startContent={
                  <Image
                    className="size-4"
                    alt="Perplexity icon"
                    src={getCacheUrl('https://www.perplexity.ai/favicon.ico')}
                  />
                }
                key="Perplexity"
                endContent={endContent}
                onPress={() => searchSelectedText('Perplexity')}>
                Perplexity
              </DropdownItem>
              <DropdownItem
                startContent={
                  <Image
                    alt="Claude icon"
                    className="size-4"
                    src={getCacheUrl('https://www.anthropic.com/favicon.ico')}
                  />
                }
                key="Claude"
                endContent={endContent}
                onPress={() => searchSelectedText('Claude')}>
                Claude
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default SearchBy;
