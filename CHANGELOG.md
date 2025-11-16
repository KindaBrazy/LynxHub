# LynxHub Changelog

## 3.3.0 (Build 32)

### ✨ New Features

- New Plugin System:
    - Centralized all module and extension logic into a new plugin system.
    - Plugins now install faster using a single-branch clone.
    - Added the ability to select or change plugin versions.
    - Added a progress indicator for plugin installation.
    - Improved plugin compatibility and version control based on subscription plans.
- Added a new Welcome window.
- Drag-and-Drop Reordering:
    - You can now reorder tabs.
    - You can now reorder arguments.
    - You can now reorder custom run commands.
    - You can now reorder pre-terminal commands.
- Search or Ask AI from Terminal:
    - Select text in the terminal to search with Google, DuckDuckGo, Reddit, or ask ChatGPT, Perplexity, or Claude.
- Added options to control how UI addresses are detected from the terminal:
    - Options: Module Default Detection, Scan Specific Line, Custom URL, or Do Not Open.

### ⚡ Improvements

- 🎨 Visual Updates:
    - Introduced a new card design with performance enhancements.
    - Redesigned the navigation bar with new animations.
    - Enhanced the overall background look and feel.
    - Added a new ripple animation and improved loading window styles.
    - Added a theme-switching animation with a QR scan effect.
- Improved overall app performance and responsiveness.
- Improved the browser address bar's behavior and style.
- Added better error handling for browser pages that fail to load.
- Improved the 'git reset' command with fetch and unshallow support.
- Added support for relative paths for pre-opened files and folders.
- Improved error handling for loading modules and extensions.
- Improved the terminal's internal structure and behavior.
- Disabled relative path arguments for modules without a directory.

### 🪲 Bug Fixes

- Fixed a memory leak that could cause the app to crash during long-running AI tasks.
- Fixed an issue where the AI UI would open in the wrong tab.
- Fixed browser search and zoom buttons not appearing correctly.
- Fixed the update button in the menu not showing the correct status.
- Fixed icon rendering on the Agents and Tools pages.
- Fixed the arguments tab incorrectly appearing for AI tools with no arguments.
- Fixed an issue where restarting an AI would sometimes fail.
- Fixed the context menu sometimes opening with the wrong size. #36
- Fixed an error when trying to open the context menu. #37
- Fixed issues that could prevent the browser from loading correctly.
- Fixed an ENOSPC error by adding a polling fallback.
- Fixed an error when animating a closing context menu.
- Fixed a browser URL handling error.
- Fixed the tab title and icon not updating correctly when terminating an AI.
- Fixed checkbox arguments not working correctly.

### 📌 Minor Changes

- Added new pages for Agents and other tools.
- Added the Chromium version to the dashboard.
- Added an option to launch the app maximized.
- Disabled shallow clone and depth by default in AI installation options.
- Changed the default cursor to a pointer for some buttons.
- Reduced the terminal scrollback history from 10,000 to 1,000 lines to save memory.
- UI Tweaks:
    - Updated styles and margins for pages and containers.
    - Updated AI installation section styles.
    - Updated 'shiny' text effect to be visible in light mode.
    - Updated card container styles.
    - Updated number input element styles.
    - Updated home page style and animations.
- Changed the hotkey for switching tabs to Alt + Right/Left Arrow.
- Fixed terminal scroll bar color in light and dark modes.
- Improved fetching repository information and disabled caching.
- Fixed an issue where tabs could lose their rounded corners.
- Optimized pattern matching for terminal text coloring.
- Fixed the insider update channel not being disabled for non-subscribed users.
- Added support for numeric badge counts in the navigation bar.
- Removed shadows and borders for images in the Markdown viewer.
- Disabled terminal text coloring by default.

## 3.2.0 (Build 29)

### ✨ New Features

- Added Browser download manager.
- Added screen sharing functionality.

### ⚡ Improvements

- Improve home searching performance.
- Improve card's loading and usage performance.
- Improve loading modules performance.
- Improve UI performances.
- Caching encryption and decryption of browser URLs for better performance.
- Handle Git ownership warnings and add safe directories handling.
- Added retry mechanisms for extension and modules server port selecting. (When port already in use)
- Added error handling for the clipboard copy action in the terminal.
- Show a window error message on calculating folder size issues.
- Improve reloading modules and extensions and add error handling.
- Implement smooth and robust context menu animations.
- Added the ability to clear browser history and related data.

### 🪲 Bug Fixes

- Fixed installer terminal will be add commands to terminal pre commands or assignments.
- Fixed extensions performance issues. (By loading extension initializers just once)
- Fixed URL handling in the browser.
- Fixed browser freezing by validating URLs.
- Fixed app crash on using Statics before initialization.
- Fixed the white screen during initialization.
- Fixed the terminal installer font wasn't loaded.
- Fixed the issue when the app tries to communicate with the closed browser tab.
- Fixed Context Menu wrong sizes by validating window size before resizing.
- Fixed app crash in some situations by ignoring system files and directories while watching.
- Fixed some app errors by closing modules and plugins server before app exit.
- Fixed the issue when Context Menu tries to communicate with the closed main window.
- Fixed Update All button in modules' page causing app error.
- Fixed terminal clear button not working correctly on Windows.
- Fixed changing custom run behavior not working.
- Fixed extensions items installing or updating buttons states.
- Removed extension update state after uninstallation.

### 📌 Minor Changes

- Close the next popover in the installer and open the restart terminal popover on error.
- Adjust padding for switch components in config cards.
- Update close buttons cursor.
- Improve card menu styling and structure adjustments.
- Enhance the preview argument's UI with improved styling.
- Open Issue's page in error page in user default browser.
- Update unloaded styles and button in modules and extensions pages.
- Adjust unloaded tooltip styles and consolidate button.
- Update button and chip styles, add icons for unloaded and update states.
- Update extensions button and chip color for improved clarity.

## 3.1.4 (Build 28)

### 🪲 Bug Fixes

- Fixed installer terminal font.
- Fixed auto-update choosing wrong target file.

## 3.1.2 (Build 26)

### ⚡ Improvements

- Add bulk encryption and decryption for browser history data for performance improvements.

### 🪲 Bug Fixes

- Fixed: White screen on startup.
- Fixed: App freeze during navigation.

## 3.1.1 (Build 25)

### ✨ New Features

- New browser setting option to clear history data.

### ⚡ Improvements

- Caching encrypt and decryption browser history data for performance improvements.

## 3.1.0 (Build 24)

### ✨ New Features

- Added **insider build** for **Gold sponsors** and above.
- Added support for **browser Favorites management** features.
- Added **unassign card** feature.

### ⚡ Improvements

- 🌍 **Browser**:
    - Improve address bar focus handling and input validation.
    - Google search for non-URLs and enhanced URL visibility.
    - Add custom error page with animations and retry functionality when URL is not accessible.
    - Enhanced empty new tab animations, styling, and refactored sections.
    - Encrypt and securely manage URLs.
- 🖥️ **Terminal**:
    - Implemented process exit handling and tab cleanup, and "Close Tab on Exit" option for disabling this.
    - Added clear button to top bar for clearing terminal content.
- Optimize browser and terminal rendering performance.
- Cache favicon URLs.
- Improve styling and interactivity for context menu items.
- Redesign extension page layout.
- Improve dashboard page design.

### 🪲 Bug Fixes

- 🌍 **Browser**:
    - Fix browser may not work correctly in some situations.
    - Ensure browser content resizes properly on maximize, unmaximize, fullscreen toggle, and resize. Fixed #32.
    - Improve browser window initialization to ensure loading and managing web pages correctly.
    - Fix errors after closing browser tab.
    - Fix error on resizing browser window.
- 🖥️ **Terminal**:
    - Ensure terminal resizes properly when window is resized with a non-terminal tab active.
    - Prevent content loss during window resizing.
    - Update font loading and error handling logic.
    - Prevent accidental automatic switching to browser view.
- Resolve out-of-memory crashes.
- Fix git manager stash & drop not working correctly.
- Correct branch check logic when fetching repository info on installation.
- Fix some icons may not appear.
- Handle errors and permission during writing configs and show toast notification.
- Add validation for working directory and fallback for inaccessible paths.
- Show warning when branches fail to fetch (Use default branch for cloning).
- Show warning window for DU64 setup issues.
- Fix Status bar not calculating size correctly for browser resizing.

### 📌 Minor Changes

- Replace icons for Dashboard and Settings pages with updated designs.
- Add error handling for locating card or validating selected directory.
- Enhance error handling for changing app data folder.
- Handle app data directory creation failure.
- Add error handling for repository info retrieval.
- Show error when selected directory for cloning is not empty.
- Display download page button on 403 error during auto-update check.

## 3.0.1 (Build 21)

### 🪲 Bug Fixes

- Fix card containers layout.

## 3.0.0 (Build 20)

### ✨ New Features

- Tabs for Multitasking:
    - Open multiple modal instances, each in its own tab.
    - Run multiple AI instances at the same time in separate tabs.
- Standalone Terminal & Browser Windows:
    - You can now open an empty terminal, browser, or a combination.
- Expanded Context Menu (Right-Click):
    - Includes new actions for text (copy, paste, undo), links (open, copy address), images (save, open), and page
      navigation (back, forward).
- Notification Drawer:
    - A new drawer to keep you updated with notifications.

### ⚡ Improvements

- Improved Hotkey System:
    - Hotkeys are now more reliable.
    - Added new hotkeys for browser, terminal, and tab management.
- Enhanced In-App Browser:
    - Now includes an Address Bar, Find in Page, and Back/Forward/Reload controls.
    - Added mouse wheel zoom and full-screen mode for web content.
    - New setting to choose how links open (external browser or new tab) and to change the browser user agent.
- Enhanced In-App Terminal:
    - Added a button to copy all terminal content.
    - Displays elapsed time since the AI interface started.
    - WebUI addresses are now detected faster.
- Argument Handling:
    - Paths for files and directories can now be dynamically converted between relative and absolute.
- Search Highlighting:
    - Searched words are now highlighted in card extensions.
    - Search terms are highlighted within argument names and descriptions.
- Card Extensions:
    - New button to open extension Readmes directly in an in-app modal.
- Settings & Performance:
    - Added a hardware acceleration toggle in settings.

### 🎨 Style & UI Changes

- New App Icon: LynxHub has a fresh new icon.
- Dynamic Loading Backgrounds:
    - New animated backgrounds (Threads, LiquidChrome) during loading.
    - Option to disable loading animations in settings.
- Progressive Card Loading:
    - Cards now load more smoothly with skeleton placeholders.
- Redesigned Toast Messages: Notifications have an updated look.
- Visual Updates:
    - Refreshed colors for home containers, filter, and search elements.
    - Updated home background colors and filter icon.
    - Improved page transition animations.
    - Adjusted dark mode background colors for consistency.
- UI Enhancements:
    - Icons added to buttons in settings for better clarity.
- New Error Page: A more user-friendly error boundary page.

### 🪲 Bug Fixes

- Fixed an issue causing terminal font corruption in some cases.
- Prevent errors when quitting the app with active AI processes.
- Corrected placement of modals and windows.
- The "update available" badge is now hidden when an AI is running.
- Ensured relative paths work correctly in portable mode for AI interfaces.
- Improved app title rendering to be accurate and prevent duplicate hyphens.
- Addressed potential data inconsistencies for users upgrading from versions below 2.0.0 by resetting relevant storage.

### 📌 Minor Changes

- Re-enabled tab animations in modals.
- Prevent storing data in LynxHub Directory:
    - Error message now shown if LynxHub's installation directory is selected for AI data to prevent issues.
    - Warnings are added to prevent locating AI instances within the main LynxHub directory.
- The start button and menu button are now disabled/hidden when an AI is active.
- Adjust the positioning of extension previews.
- For portable builds, the update process now opens the download page.
- Added a setting to toggle error reporting.

## 2.4.0 (Build 19)

### ✨ New Features

- Added ARM64 architecture:
    - Windows, macOS.
- Added Portable app:
    - Windows, Linux.
- Added option for dynamic title/taskbar name based on AI or page.
- Added option to open app at last position/size or maximized.
- Added ability to enable/disable AI interface extensions.
- Added option to configure AI update check frequency.
- Check for update on new card locate/install.

### ⚡ Improvements

- Improve terminal process killing on terminate/close.
- Update dashboard and audio generation icons.
- Update Styles:
    - Update AI installation and Settings clear popconfirm design.
    - Update uninstall modal design.
    - Update update details modal design.

### 🪲 Bug Fixes

- Resolve AI interface extension installation issues.
- Correctly handle dots in repository names.
- Fix error on closing app when an AI interface is running.

### 📌 Minor Changes

- Portable changes:
    - Use relative path for app config storage path.
    - Add executable path retrieval on multiple platforms.
    - Remove Restart button on Linux portable AppImage and show exit instead of restart.
- In modules page auto switch to download tab if no modules installed.
- Change button cursor to pointer in specific situations.
- Reorder settings content and navigation buttons.
- Update module changelog close button style.
- Update initializer style.
- Lower Patreon login card border opacity.
- Disable Google sync data checkbox.

## 2.3.1 (Build 18)

### ⚡ Improvements

- Repositioned "Close" and "Terminate AI" confirmation pop-up.
- Improved module update checking behavior and performance.
- Added stash and drop functionality to card repository menu.
- Added animation to command items upon addition.
- Removed markdown viewer background.
- Removed modals footer background; close button is now minimal.

### 🪲 Bug Fixes

- Refresh modules list after installing or uninstalling a module.
- Resolve AI interface extension installation issues.

### 📌 Minor Changes

- Added security notice for extensions and modules installation.
- Extensions Page:
    - Added skeleton loading, updated panel colors, and changed selected item indicator.
    - Modified tab appearance and improved empty search result text, and updated styles.
- Modules Page:
    - Added changelog viewer, displays unloaded state, updated "Update All" button, and improved list item design.
    - Smaller tabs, button icons, homepage link, and fixed update checking with no modules.
- Use custom array for app release log.
- Updated design of update details and notification.
- Close menu on "Open Folder" or "Open Homepage".

## 2.2.1 (Build 17)

### 🪲 Bug Fixes

- Prevent modal overlay persistence when closing modals with tabs.
