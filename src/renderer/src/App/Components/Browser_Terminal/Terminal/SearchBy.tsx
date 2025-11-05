import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Image} from '@heroui/react';
import {AnimatePresence, motion} from 'framer-motion';
import {memo, useCallback} from 'react';

import {SearchQuerySites} from '../../../../../../cross/CrossTypes';
import {getSearchUrl} from '../../../../../../cross/CrossUtils';
import {ExternalDuo_Icon} from '../../../../../context_menu/Components/SvgIcons';
import {Magnifier_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';

const endContent = <ExternalDuo_Icon className="size-3 group-hover:opacity-100 opacity-0 transition duration-300" />;

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
            <DropdownTrigger>
              <Button size="sm" variant="light" isIconOnly>
                <Magnifier_Icon className="size-3.5" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              topContent={<span className="tracking-tighter text-foreground-700">Search selected text by:</span>}>
              <DropdownItem
                key="Google"
                endContent={endContent}
                onPress={() => searchSelectedText('Google')}
                startContent={<Image alt="Google icon" className="size-4" src="https://www.google.com/favicon.ico" />}>
                Google
              </DropdownItem>
              <DropdownItem
                startContent={
                  <Image className="size-4" alt="DuckDuckGo icon" src="https://duckduckgo.com/favicon.ico" />
                }
                key="DuckDuckGo"
                endContent={endContent}
                onPress={() => searchSelectedText('DuckDuckGo')}>
                DuckDuckGo
              </DropdownItem>
              <DropdownItem
                key="Reddit"
                endContent={endContent}
                onPress={() => searchSelectedText('Reddit')}
                startContent={<Image alt="Reddit icon" className="size-4" src="https://www.reddit.com/favicon.ico" />}>
                Reddit
              </DropdownItem>
              <DropdownItem
                startContent={<Image alt="ChatGPT icon" className="size-4" src="https://chat.openai.com/favicon.ico" />}
                key="ChatGPT"
                endContent={endContent}
                onPress={() => searchSelectedText('ChatGPT')}>
                ChatGPT
              </DropdownItem>
              <DropdownItem
                startContent={
                  <Image
                    src={
                      'https://registry.npmmirror.com/@lobehub/icons-static-png/1.74.0/files' +
                      '/dark/perplexity-color.png'
                    }
                    className="size-4"
                    alt="Perplexity icon"
                  />
                }
                key="Perplexity"
                endContent={endContent}
                onPress={() => searchSelectedText('Perplexity')}>
                Perplexity
              </DropdownItem>
              <DropdownItem
                startContent={
                  <Image alt="Claude icon" className="size-4" src="https://www.anthropic.com/favicon.ico" />
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
