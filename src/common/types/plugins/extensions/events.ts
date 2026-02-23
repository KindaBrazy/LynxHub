import type {FindInPageOptions, OpenDialogOptions} from 'electron';
import type {FC} from 'react';

import type {ChosenArgumentsData, ContextResizeData, FolderNames} from '../../index';
import type {
  AgentTypes,
  ChangeWindowState,
  CustomRunBehaviorData,
  DarkModeTypes,
  HomeCategory,
  PreCommands,
  PreOpen,
  RecentlyOperation,
  StorageOperation,
  TaskbarStatus,
  WHType,
} from '../../ipc';
import type StorageTypes from '../../storage';
import type {InstalledCard} from '../../storage';

/**
 * Events related to extension lifecycle and interactions within the renderer process.
 */
export type ExtensionEvents = {
  /**
   * Triggered before a card starts running.
   * @param id - The ID of the card.
   */
  before_card_start: {id: string};

  /**
   * Triggered before a card installation begins.
   * @param id - The ID of the card.
   */
  before_card_install: {id: string};

  /**
   * Allows adding a custom step to the card installation process.
   * @param id - The ID of the card.
   * @param addStep - Function to add a step.
   * @param addStep.atIndex - The index at which to insert the step.
   * @param addStep.title - The title of the step.
   * @param addStep.content - The React component to render for the step.
   */
  card_install_addStep: {
    id: string;
    addStep: (atIndex: number, title: string, content: FC) => void;
  };

  /**
   * Allows collecting user input for a card.
   * @param id - The ID of the card.
   * @param addElements - Function to add input elements.
   * @param addElements.elements - Array of React components to render as input fields.
   */
  card_collect_user_input: {
    id: string;
    addElements: (elements: FC[]) => void;
  };
};

/**
 * Events used for Inter-Process Communication (IPC) between the main and renderer processes
 * regarding extensions.
 */
export type ExtensionEvents_IPC = {
  /**
   * Emitted when a terminal process is started for a card.
   */
  terminal_process: {id: string; cardId: string};

  /**
   * Emitted when a custom terminal process is started.
   */
  terminal_process_custom: {
    id: string;
    dir?: string;
    file?: string;
  };

  /**
   * Emitted when a custom command is executed in the terminal.
   */
  terminal_process_custom_command: {id: string; commands?: string | string[]; dir?: string};

  /**
   * Emitted when an empty terminal process is started.
   */
  terminal_process_empty: {id: string; dir?: string};

  /**
   * Emitted to stop a terminal process.
   */
  terminal_process_stop: {id: string};

  /**
   * Emitted to write data to the terminal.
   */
  terminal_write: {id: string; data: string};

  /**
   * Emitted to clear the terminal.
   */
  terminal_clear: {id: string};

  /**
   * Emitted when the terminal is resized.
   */
  terminal_resize: {id: string; cols: number; rows: number};

  // ----------------------------------------------------------------------
  // Window Management
  // ----------------------------------------------------------------------

  /**
   * Change the window state (minimize, maximize, close, etc.).
   */
  win_change_state: {state: ChangeWindowState};

  /**
   * Set the application's dark mode preference.
   */
  win_set_dark_mode: {darkMode: DarkModeTypes};

  /**
   * Request the system's current dark mode setting.
   */
  win_get_system_dark_mode: Record<string, never>;

  /**
   * Set the status of the taskbar icon (e.g., progress, error).
   */
  win_set_taskbar_status: {status: TaskbarStatus};

  /**
   * Request system information.
   */
  win_get_system_info: Record<string, never>;

  /**
   * Open a URL in the user's default browser.
   */
  win_open_url_default_browser: {url: string};

  // ----------------------------------------------------------------------
  // File System Operations
  // ----------------------------------------------------------------------

  /**
   * Open a file dialog.
   */
  file_open_dialog: {option: OpenDialogOptions};

  /**
   * Open a specific path in the file explorer.
   */
  file_open_path: {dir: string};

  /**
   * Get the path of a specific application directory.
   */
  file_get_app_directories: {name: FolderNames};

  /**
   * Remove a directory.
   */
  file_remove_dir: {dir: string};

  /**
   * Move a directory to the trash.
   */
  file_trash_dir: {dir: string};

  /**
   * List contents of a directory.
   */
  file_list_dir: {dirPath: string; relatives: string[]};

  /**
   * Check if specific files exist in a directory.
   */
  file_check_files_exist: {dir: string; fileNames: string[]};

  /**
   * Calculate the size of a folder.
   */
  file_calc_folder_size: {dir: string};

  /**
   * Get the relative path from a base path to a target path.
   */
  file_get_relative_path: {basePath: string; targetPath: string};

  /**
   * Get the absolute path from a base path and a target path.
   */
  file_get_absolute_path: {basePath: string; targetPath: string};

  /**
   * Check if a directory is empty.
   */
  file_is_empty_dir: {dir: string};

  // ----------------------------------------------------------------------
  // Git Operations
  // ----------------------------------------------------------------------

  /**
   * Perform a shallow git clone.
   */
  git_clone_shallow: {
    url: string;
    directory: string;
    singleBranch: boolean;
    depth?: number;
    branch?: string;
  };

  /**
   * Perform a shallow git clone returning a promise.
   */
  git_clone_shallow_promise: {
    url: string;
    directory: string;
    singleBranch: boolean;
    depth?: number;
    branch?: string;
  };

  /**
   * Get information about a git repository.
   */
  git_get_repo_info: {dir: string};

  /**
   * Change the current branch of a git repository.
   */
  git_change_branch: {dir: string; branchName: string};

  /**
   * Unshallow a git repository (fetch full history).
   */
  git_unshallow: {dir: string};

  /**
   * Hard reset a git repository.
   */
  git_reset_hard: {dir: string};

  /**
   * Validate if a directory is a valid git repository for a specific URL.
   */
  git_validate_git_dir: {dir: string; url: string};

  /**
   * Pull changes from the remote repository.
   */
  git_pull: {repoDir: string; id: string};

  /**
   * Drop the latest stash entry.
   */
  git_stash_drop: {dir: string};

  // ----------------------------------------------------------------------
  // Module Management
  // ----------------------------------------------------------------------

  /**
   * Notify that an update is available for a card module.
   */
  module_card_update_available: {card: InstalledCard; updateType: 'git' | 'stepper' | undefined};

  /**
   * Get data for all modules.
   */
  module_get_modules_data: Record<string, never>;

  /**
   * Get information about installed modules.
   */
  module_get_installed_modules_info: Record<string, never>;

  /**
   * Get list of skipped modules.
   */
  module_get_skipped: Record<string, never>;

  /**
   * Install a module from a URL.
   */
  module_install_module: {url: string};

  /**
   * Uninstall a module by ID.
   */
  module_uninstall_module: {id: string};

  /**
   * Uninstall a card by ID.
   */
  module_uninstall_card_by_id: {id: string};

  /**
   * Check if an update is available for a module.
   */
  module_is_update_available: {id: string};

  /**
   * Get a list of available module updates.
   */
  module_update_available_list: Record<string, never>;

  /**
   * Update a specific module.
   */
  module_update_module: {id: string};

  /**
   * Update all modules.
   */
  module_update_all_modules: Record<string, never>;

  /**
   * Check for updates for cards at a specific interval.
   */
  module_check_cards_update_interval: {updateType: {id: string; type: 'git' | 'stepper'}[]};

  // ----------------------------------------------------------------------
  // Module API
  // ----------------------------------------------------------------------

  /**
   * Get the creation time of a folder.
   */
  module_api_get_folder_creation_time: {dir: string};

  /**
   * Get the date of the last pull operation.
   */
  module_api_get_last_pulled_date: {dir: string};

  /**
   * Get the current release tag of the module.
   */
  module_api_get_current_release_tag: {dir: string};

  // ----------------------------------------------------------------------
  // Extension Management
  // ----------------------------------------------------------------------

  /**
   * Get data for all extensions.
   */
  extension_get_extensions_data: Record<string, never>;

  /**
   * Get information about installed extensions.
   */
  extension_get_installed_extensions_info: Record<string, never>;

  /**
   * Get list of skipped extensions.
   */
  extension_get_skipped: Record<string, never>;

  /**
   * Install an extension from a URL.
   */
  extension_install_extension: {url: string};

  /**
   * Uninstall an extension by ID.
   */
  extension_uninstall_extension: {id: string};

  /**
   * Check if an update is available for an extension.
   */
  extension_is_update_available: {id: string};

  /**
   * Get a list of available extension updates.
   */
  extension_update_available_list: Record<string, never>;

  /**
   * Update a specific extension.
   */
  extension_update_extension: {id: string};

  /**
   * Check for Early Access (EA) or Insider status.
   */
  extension_check_ea: {isEA: boolean; isInsider: boolean};

  /**
   * Update all extensions.
   */
  extension_update_all_extensions: Record<string, never>;

  // ----------------------------------------------------------------------
  // Storage Utils
  // ----------------------------------------------------------------------

  /**
   * Add an installed card to storage.
   */
  storage_utils_add_installed_card: {cardData: InstalledCard};

  /**
   * Remove an installed card from storage.
   */
  storage_utils_remove_installed_card: {cardId: string};

  /**
   * Enable auto-update for a card.
   */
  storage_utils_add_auto_update_card: {cardId: string};

  /**
   * Disable auto-update for a card.
   */
  storage_utils_remove_auto_update_card: {cardId: string};

  /**
   * Enable auto-update for extensions.
   */
  storage_utils_add_auto_update_extensions: {cardId: string};

  /**
   * Disable auto-update for extensions.
   */
  storage_utils_remove_auto_update_extensions: {cardId: string};

  /**
   * Manage pinned cards.
   */
  storage_utils_pinned_cards: {opt: StorageOperation; id: string; pinnedCards?: string[]};

  /**
   * Manage pre-commands.
   */
  storage_utils_pre_commands: {opt: StorageOperation; data: PreCommands};

  /**
   * Manage custom run configurations.
   */
  storage_utils_custom_run: {opt: StorageOperation; data: PreCommands};

  /**
   * Update custom run behavior.
   */
  storage_utils_update_custom_run_behavior: {data: CustomRunBehaviorData};

  /**
   * Manage pre-open configurations.
   */
  storage_utils_pre_open: {opt: StorageOperation; open: PreOpen};

  /**
   * Get arguments for a card.
   */
  storage_utils_get_card_arguments: {cardId: string};

  /**
   * Set arguments for a card.
   */
  storage_utils_set_card_arguments: {cardId: string; args: ChosenArgumentsData};

  /**
   * Manage recently used cards.
   */
  storage_utils_recently_used_cards: {opt: RecentlyOperation; id: string};

  /**
   * Manage home categories.
   */
  storage_utils_home_category: {opt: StorageOperation; data: HomeCategory};

  /**
   * Set system startup preference.
   */
  storage_utils_set_system_startup: {startup: boolean};

  /**
   * Update the application zoom factor.
   */
  storage_utils_update_zoom_factor: {zoomFactor: number};

  /**
   * Add an entry to browser recent history.
   */
  storage_utils_add_browser_recent: {recentEntry: string};

  /**
   * Add an entry to browser favorites.
   */
  storage_utils_add_browser_favorite: {favoriteEntry: string};

  /**
   * Add an entry to browser history.
   */
  storage_utils_add_browser_history: {historyEntry: string};

  /**
   * Add a favicon to a recent browser entry.
   */
  storage_utils_add_browser_recent_favicon: {url: string; favIcon: string};

  /**
   * Remove an entry from browser recent history.
   */
  storage_utils_remove_browser_recent: {url: string};

  /**
   * Remove an entry from browser favorites.
   */
  storage_utils_remove_browser_favorite: {url: string};

  /**
   * Remove an entry from browser history.
   */
  storage_utils_remove_browser_history: {url: string};

  /**
   * Configure confirmation dialog settings.
   */
  storage_utils_set_show_confirm: {
    type: 'closeConfirm' | 'terminateAIConfirm' | 'closeTabConfirm';
    enable: boolean;
  };

  /**
   * Mark a notification as read.
   */
  storage_utils_add_read_notif: {id: string};

  /**
   * Set pre-commands for a card's terminal.
   */
  storage_utils_setCardTerminalPreCommands: {id: string; commands: string[]};

  /**
   * Unassign a card.
   */
  storage_utils_unassignCard: {id: string; clearConfigs: boolean};

  // ----------------------------------------------------------------------
  // General Utilities
  // ----------------------------------------------------------------------

  /**
   * Update all extensions given specific data.
   */
  utils_update_all_extensions: {data: {id: string; dir: string}};

  /**
   * Get details of extensions in a directory.
   */
  utils_get_extensions_details: {dir: string};

  /**
   * Get update status of extensions in a directory.
   */
  utils_get_extensions_update_status: {dir: string};

  /**
   * Enable or disable an extension.
   */
  utils_disable_extension: {disable: boolean; dir: string};

  /**
   * Cancel retrieval of extension data.
   */
  utils_cancel_extensions_data: Record<string, never>;

  /**
   * Download a file from a URL.
   */
  utils_download_file: {url: string};

  /**
   * Cancel a file download.
   */
  utils_cancel_download: Record<string, never>;

  /**
   * Decompress a file.
   */
  utils_decompress_file: {filePath: string};

  /**
   * Check if a URL response is valid.
   */
  utils_is_response_valid: {url: string};

  /**
   * Get an image as a Data URL.
   */
  utils_get_image_as_data_url: {url: string};

  // ----------------------------------------------------------------------
  // App Update
  // ----------------------------------------------------------------------

  /**
   * Initiate app update download.
   */
  app_update_download: Record<string, never>;

  /**
   * Cancel app update.
   */
  app_update_cancel: Record<string, never>;

  /**
   * Install the downloaded app update.
   */
  app_update_install: Record<string, never>;

  // ----------------------------------------------------------------------
  // App Data
  // ----------------------------------------------------------------------

  /**
   * Get the current application data path.
   */
  app_data_get_current_path: Record<string, never>;

  /**
   * Select another application data path.
   */
  app_data_select_another: Record<string, never>;

  /**
   * Check if a directory is the application directory.
   */
  app_data_is_app_dir: {dir: string};

  // ----------------------------------------------------------------------
  // Storage Access
  // ----------------------------------------------------------------------

  /**
   * Get a custom storage value.
   */
  storage_get_custom: {key: string};

  /**
   * Set a custom storage value.
   */

  storage_set_custom: {key: string; data: any};

  /**
   * Get a value from storage.
   */
  storage_get: {key: keyof StorageTypes};

  /**
   * Get all storage data.
   */
  storage_get_all: Record<string, never>;

  /**
   * Update a value in storage.
   */

  storage_update: {key: keyof StorageTypes; updateData: any};

  /**
   * Clear all storage data.
   */
  storage_clear: Record<string, never>;

  // ----------------------------------------------------------------------
  // Context Menu
  // ----------------------------------------------------------------------

  /**
   * Resize the context menu window.
   */
  context_menu_resize_window: {data: ContextResizeData};

  /**
   * Show the context menu window.
   */
  context_menu_show_window: Record<string, never>;

  /**
   * Hide the context menu window.
   */
  context_menu_hide_window: Record<string, never>;

  /**
   * Open the terminate AI confirmation.
   */
  context_menu_open_terminate_ai: {id: string};

  /**
   * Open the terminate tab confirmation.
   */
  context_menu_open_terminate_tab: {id: string; customPosition?: {x: number; y: number}};

  /**
   * Open the close app confirmation.
   */
  context_menu_open_close_app: Record<string, never>;

  /**
   * Relaunch the AI.
   */
  context_menu_relaunch_ai: {id: string};

  /**
   * Stop the AI.
   */
  context_menu_stop_ai: {id: string};

  /**
   * Remove a tab.
   */
  context_menu_remove_tab: {tabID: string};

  // ----------------------------------------------------------------------
  // Context Items
  // ----------------------------------------------------------------------

  /**
   * Copy operation.
   */
  context_items_copy: {id: number};

  /**
   * Cut operation.
   */
  context_items_cut: {id: number};

  /**
   * Paste operation.
   */
  context_items_paste: {id: number};

  /**
   * Replace misspelled text.
   */
  context_items_replace_misspelling: {id: number; text: string};

  /**
   * Select all operation.
   */
  context_items_select_all: {id: number};

  /**
   * Undo operation.
   */
  context_items_undo: {id: number};

  /**
   * Redo operation.
   */
  context_items_redo: {id: number};

  /**
   * Open a new tab with a URL.
   */
  context_items_new_tab: {url: string};

  /**
   * Open a URL externally.
   */
  context_items_open_external: {url: string};

  /**
   * Download an image.
   */
  context_items_download_image: {id: number; url: string};

  /**
   * Copy an image.
   */
  context_items_copy_image: {url: string};

  /**
   * Search Google with selected text.
   */
  context_items_search_google: {text: string};

  /**
   * Inspect element at coordinates.
   */
  context_items_inspect_element: {id: number; x: number; y: number};

  /**
   * Navigate (back, forward, refresh).
   */
  context_items_navigate: {id: number; action: 'back' | 'forward' | 'refresh'};

  // ----------------------------------------------------------------------
  // Browser
  // ----------------------------------------------------------------------

  /**
   * Create a new browser instance.
   */
  browser_create: {id: string};

  /**
   * Remove a browser instance.
   */
  browser_remove: {id: string};

  /**
   * Load a URL in a browser instance.
   */
  browser_load_url: {id: string; url: string};

  /**
   * Set visibility of a browser instance.
   */
  browser_set_visible: {id: string; visible: boolean};

  /**
   * Open 'Find in Page' dialog.
   */
  browser_open_find_in_page: {id: string; customPosition?: {x: number; y: number}};

  /**
   * Open Zoom controls.
   */
  browser_open_zoom: {id: string};

  /**
   * Open Volume controls.
   */
  browser_open_volume: {id: string};

  /**
   * Perform 'Find in Page'.
   */
  browser_find_in_page: {id: string; value: string; options: FindInPageOptions};

  /**
   * Stop 'Find in Page'.
   */
  browser_stop_find_in_page: {
    id: string;
    action: 'clearSelection' | 'keepSelection' | 'activateSelection';
  };

  /**
   * Focus the web view.
   */
  browser_focus_web_view: {id: string};

  /**
   * Clear browser cache.
   */
  browser_clear_cache: Record<string, never>;

  /**
   * Clear browser cookies.
   */
  browser_clear_cookies: Record<string, never>;

  /**
   * Set zoom factor for a browser instance.
   */
  browser_set_zoom_factor: {id: string; factor: number};

  /**
   * Reload the browser.
   */
  browser_reload: {id: string};

  /**
   * Go back in browser history.
   */
  browser_go_back: {id: string};

  /**
   * Go forward in browser history.
   */
  browser_go_forward: {id: string};

  /**
   * Get the user agent string.
   */
  browser_get_user_agent: {type?: AgentTypes};

  /**
   * Update the user agent string.
   */
  browser_update_user_agent: Record<string, never>;

  /**
   * Add offset to a browser instance.
   */
  browser_add_offset: {id: string; offset: WHType};

  // ----------------------------------------------------------------------
  // Volume Control
  // ----------------------------------------------------------------------

  /**
   * Set volume for a browser instance.
   */
  volume_set_volume: {id: string; volume: number};

  /**
   * Mute/unmute a browser instance.
   */
  volume_set_muted: {id: string; muted: boolean};

  /**
   * Get volume state for a browser instance.
   */
  volume_get_state: {id: string};

  // ----------------------------------------------------------------------
  // Static Resources
  // ----------------------------------------------------------------------

  /**
   * Pull static resources.
   */
  statics_pull: Record<string, never>;

  /**
   * Get releases information.
   */
  statics_get_releases: Record<string, never>;

  /**
   * Get insider build information.
   */
  statics_get_insider: Record<string, never>;

  /**
   * Get notifications.
   */
  statics_get_notification: Record<string, never>;

  /**
   * Get modules information.
   */
  statics_get_modules: Record<string, never>;

  /**
   * Get extensions information.
   */
  statics_get_extensions: Record<string, never>;

  /**
   * Get early access extensions information.
   */
  statics_get_extensions_ea: Record<string, never>;

  /**
   * Get patrons information.
   */
  statics_get_patrons: Record<string, never>;
};
