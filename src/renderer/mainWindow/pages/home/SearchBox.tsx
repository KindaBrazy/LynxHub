import {InputGroup} from '@heroui-v3/react';
import {Circle_Icon} from '@lynx_assets/icons';
import {Dispatch, memo, SetStateAction} from 'react';

/**
 * Props for the HomeSearchBox component.
 */
interface HomeSearchBoxProps {
  /** The current value of the search input field. */
  searchValue: string;
  /** State dispatcher function for updating the search string. */
  setSearchValue: Dispatch<SetStateAction<string>>;
}

/**
 * Provide a lightweight UI input component for filtering and searching specific interface cards on the Home view.
 *
 * @param {HomeSearchBoxProps} props The current search state and its mutation dispatch.
 * @returns {JSX.Element} The search input element.
 */
const HomeSearchBox = memo(({searchValue, setSearchValue}: HomeSearchBoxProps) => {
  return (
    <InputGroup variant="secondary" fullWidth>
      <InputGroup.Prefix>
        <Circle_Icon />
      </InputGroup.Prefix>
      <InputGroup.Input
        spellCheck="false"
        value={searchValue}
        placeholder="Search interfaces..."
        onChange={event => setSearchValue(event.target.value)}
      />
    </InputGroup>
  );
});

export default HomeSearchBox;
