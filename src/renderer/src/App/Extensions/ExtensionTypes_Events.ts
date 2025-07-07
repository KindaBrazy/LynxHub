// ExtensionTypes_Events.ts
import {FindInPageOptions, OpenDialogOptions} from 'electron';
import {FC} from 'react';

import {ChosenArgumentsData, DiscordRPC, FolderNames} from '../../../../cross/CrossTypes';
import {
  AgentTypes,
  ChangeWindowState,
  CustomRunBehaviorData,
  DarkModeTypes,
  DiscordRunningAI,
  HomeCategory,
  PreCommands,
  PreOpen,
  PtyProcessOpt,
  RecentlyOperation,
  StorageOperation,
  TaskbarStatus,
  WHType,
} from '../../../../cross/IpcChannelAndTypes';
import StorageTypes, {InstalledCard} from '../../../../cross/StorageTypes';

export type ExtensionEvents = {
  /** Will be called before a card starts running */
  before_card_start: {id: string};
  /** Will be called before a card start installing */
  before_card_install: {id: string};
  card_install_addStep: {id: string; addStep: (atIndex: number, title: string, content: FC) => void};
  /** Add terminal commands to be executed before module terminal action
   * (like before runTerminalScript or executeTerminalCommands) */
  card_install_command_before_terminal_action: {id: string; addCommand: (commands: string | string[]) => void};
  card_collect_user_input: {id: string; addElements: (elements: FC[]) => void};
  card_start_pre_commands: {id: string; addCommand: (commands: string | string[]) => void};
  card_uninstall_pre_commands: {id: string; addCommand: (commands: string | string[]) => void};
};

export type ExtensionEvents_IPC = {
  terminal_process: {id: string; opt: PtyProcessOpt; cardId: string; preCommands?: string | string[]};
  terminal_process_custom: {
    id: string;
    opt: PtyProcessOpt;
    dir?: string;
    file?: string;
    preCommands?: string | string[];
  };
  terminal_process_custom_command: {id: string; opt: PtyProcessOpt; commands?: string | string[]; dir?: string};
  terminal_process_empty: {id: string; opt: PtyProcessOpt; dir?: string};
  terminal_write: {id: string; data: string};
  terminal_resize: {id: string; cols: number; rows: number};

  // win
  win_change_state: {state: ChangeWindowState};
  win_set_dark_mode: {darkMode: DarkModeTypes};
  win_get_system_dark_mode: Record<string, never>;
  win_set_taskbar_status: {status: TaskbarStatus};
  win_set_discord_rp: {discordRp: DiscordRPC};
  win_set_discord_rp_ai_running: {status: DiscordRunningAI};
  win_get_system_info: Record<string, never>;
  win_open_url_default_browser: {url: string};

  // file
  file_open_dialog: {option: OpenDialogOptions};
  file_open_path: {dir: string};
  file_get_app_directories: {name: FolderNames};
  file_remove_dir: {dir: string};
  file_trash_dir: {dir: string};
  file_list_dir: {dirPath: string; relatives: string[]};
  file_check_files_exist: {dir: string; fileNames: string[]};
  file_calc_folder_size: {dir: string};
  file_get_relative_path: {basePath: string; targetPath: string};
  file_get_absolute_path: {basePath: string; targetPath: string};
  file_is_empty_dir: {dir: string};

  // git
  git_clone_shallow: {url: string; directory: string; singleBranch: boolean; depth?: number; branch?: string};
  git_clone_shallow_promise: {
    url: string;
    directory: string;
    singleBranch: boolean;
    depth?: number;
    branch?: string;
  };
  git_get_repo_info: {dir: string};
  git_change_branch: {dir: string; branchName: string};
  git_unshallow: {dir: string};
  git_reset_hard: {dir: string};
  git_validate_git_dir: {dir: string; url: string};
  git_pull: {repoDir: string; id: string};
  git_stash_drop: {dir: string};

  // module
  module_card_update_available: {card: InstalledCard; updateType: 'git' | 'stepper' | undefined};
  module_get_modules_data: Record<string, never>;
  module_get_installed_modules_info: Record<string, never>;
  module_get_skipped: Record<string, never>;
  module_check_ea: {isEA: boolean; isInsider: boolean};
  module_install_module: {url: string};
  module_uninstall_module: {id: string};
  module_uninstall_card_by_id: {id: string; uninstallPreCommands: string[]};
  module_is_update_available: {id: string};
  module_update_available_list: Record<string, never>;
  module_update_module: {id: string};
  module_update_all_modules: Record<string, never>;
  module_check_cards_update_interval: {updateType: {id: string; type: 'git' | 'stepper'}[]};

  // moduleApi
  module_api_get_folder_creation_time: {dir: string};
  module_api_get_last_pulled_date: {dir: string};
  module_api_get_current_release_tag: {dir: string};

  // extension
  extension_get_extensions_data: Record<string, never>;
  extension_get_installed_extensions_info: Record<string, never>;
  extension_get_skipped: Record<string, never>;
  extension_install_extension: {url: string};
  extension_uninstall_extension: {id: string};
  extension_is_update_available: {id: string};
  extension_update_available_list: Record<string, never>;
  extension_update_extension: {id: string};
  extension_check_ea: {isEA: boolean; isInsider: boolean};
  extension_update_all_extensions: Record<string, never>;

  // storageUtils
  storage_utils_add_installed_card: {cardData: InstalledCard};
  storage_utils_remove_installed_card: {cardId: string};
  storage_utils_add_auto_update_card: {cardId: string};
  storage_utils_remove_auto_update_card: {cardId: string};
  storage_utils_add_auto_update_extensions: {cardId: string};
  storage_utils_remove_auto_update_extensions: {cardId: string};
  storage_utils_pinned_cards: {opt: StorageOperation; id: string; pinnedCards?: string[]};
  storage_utils_pre_commands: {opt: StorageOperation; data: PreCommands};
  storage_utils_custom_run: {opt: StorageOperation; data: PreCommands};
  storage_utils_update_custom_run_behavior: {data: CustomRunBehaviorData};
  storage_utils_pre_open: {opt: StorageOperation; open: PreOpen};
  storage_utils_get_card_arguments: {cardId: string};
  storage_utils_set_card_arguments: {cardId: string; args: ChosenArgumentsData};
  storage_utils_recently_used_cards: {opt: RecentlyOperation; id: string};
  storage_utils_home_category: {opt: StorageOperation; data: HomeCategory};
  storage_utils_set_system_startup: {startup: boolean};
  storage_utils_update_zoom_factor: {zoomFactor: number};
  storage_utils_add_browser_recent: {recentEntry: string};
  storage_utils_add_browser_favorite: {favoriteEntry: string};
  storage_utils_add_browser_history: {historyEntry: string};
  storage_utils_add_browser_recent_favicon: {url: string; favIcon: string};
  storage_utils_remove_browser_recent: {url: string};
  storage_utils_remove_browser_favorite: {url: string};
  storage_utils_remove_browser_history: {url: string};
  storage_utils_set_show_confirm: {
    type: 'closeConfirm' | 'terminateAIConfirm' | 'closeTabConfirm';
    enable: boolean;
  };
  storage_utils_add_read_notif: {id: string};

  // utils
  utils_update_all_extensions: {data: {id: string; dir: string}};
  utils_get_extensions_details: {dir: string};
  utils_get_extensions_update_status: {dir: string};
  utils_disable_extension: {disable: boolean; dir: string};
  utils_cancel_extensions_data: Record<string, never>;
  utils_download_file: {url: string};
  utils_cancel_download: Record<string, never>;
  utils_decompress_file: {filePath: string};
  utils_is_response_valid: {url: string};
  utils_get_image_as_data_url: {url: string};

  // appUpdate
  app_update_download: Record<string, never>;
  app_update_cancel: Record<string, never>;
  app_update_install: Record<string, never>;

  // appData
  app_data_get_current_path: Record<string, never>;
  app_data_select_another: Record<string, never>;
  app_data_is_app_dir: {dir: string};

  // storage
  storage_get_custom: {key: string};
  storage_set_custom: {key: string; data: any};
  storage_get: {key: keyof StorageTypes};
  storage_get_all: Record<string, never>;
  storage_update: {key: keyof StorageTypes; updateData: any};
  storage_clear: Record<string, never>;

  // contextMenu
  context_menu_resize_window: {dimensions: {width: number; height: number}};
  context_menu_show_window: Record<string, never>;
  context_menu_hide_window: Record<string, never>;
  context_menu_open_terminate_ai: {id: string};
  context_menu_open_terminate_tab: {id: string; customPosition?: {x: number; y: number}};
  context_menu_open_close_app: Record<string, never>;
  context_menu_relaunch_ai: {id: string};
  context_menu_stop_ai: {id: string};
  context_menu_remove_tab: {tabID: string};

  // contextItems
  context_items_copy: {id: number};
  context_items_paste: {id: number};
  context_items_replace_misspelling: {id: number; text: string};
  context_items_select_all: {id: number};
  context_items_undo: {id: number};
  context_items_redo: {id: number};
  context_items_new_tab: {url: string};
  context_items_open_external: {url: string};
  context_items_download_image: {id: number; url: string};
  context_items_navigate: {id: number; action: 'back' | 'forward' | 'refresh'};

  // browser
  browser_create: {id: string};
  browser_remove: {id: string};
  browser_load_url: {id: string; url: string};
  browser_set_visible: {id: string; visible: boolean};
  browser_open_find_in_page: {id: string; customPosition?: {x: number; y: number}};
  browser_open_zoom: {id: string};
  browser_find_in_page: {id: string; value: string; options: FindInPageOptions};
  browser_stop_find_in_page: {id: string; action: 'clearSelection' | 'keepSelection' | 'activateSelection'};
  browser_focus_web_view: {id: string};
  browser_clear_cache: Record<string, never>;
  browser_clear_cookies: Record<string, never>;
  browser_set_zoom_factor: {id: string; factor: number};
  browser_reload: {id: string};
  browser_go_back: {id: string};
  browser_go_forward: {id: string};
  browser_get_user_agent: {type?: AgentTypes};
  browser_update_user_agent: Record<string, never>;
  browser_add_offset: {id: string; offset: WHType};

  // statics
  statics_pull: Record<string, never>;
  statics_get_releases: Record<string, never>;
  statics_get_insider: Record<string, never>;
  statics_get_notification: Record<string, never>;
  statics_get_modules: Record<string, never>;
  statics_get_extensions: Record<string, never>;
  statics_get_extensions_ea: Record<string, never>;
  statics_get_patrons: Record<string, never>;
};
