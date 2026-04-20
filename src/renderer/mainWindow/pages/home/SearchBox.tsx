import {SearchField} from '@heroui-v3/react';
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
    <SearchField variant="secondary" value={searchValue} onChange={setSearchValue} fullWidth>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input spellCheck="false" placeholder="Search interfaces..." />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
});

export default HomeSearchBox;
