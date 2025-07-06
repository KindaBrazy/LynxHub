// ExtensionTypes_Events.ts
import {FindInPageOptions, OpenDialogOptions} from 'electron';

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

  'ipc:terminal-process': {id: string; opt: PtyProcessOpt; cardId: string};
  'ipc:terminal-process_custom': {id: string; opt: PtyProcessOpt; dir?: string; file?: string};
  'ipc:terminal-process_custom-command': {id: string; opt: PtyProcessOpt; commands?: string | string[]; dir?: string};
  'ipc:terminal-process_empty': {id: string; opt: PtyProcessOpt; dir?: string};
  'ipc:terminal-write': {id: string; data: string};
  'ipc:terminal-resize': {id: string; cols: number; rows: number};

  // win
  'ipc:win-change_state': {state: ChangeWindowState};
  'ipc:win-set_dark_mode': {darkMode: DarkModeTypes};
  'ipc:win-get_system_dark_mode': Record<string, never>;
  'ipc:win-set_taskbar_status': {status: TaskbarStatus};
  'ipc:win-set_discord_rp': {discordRp: DiscordRPC};
  'ipc:win-set_discord_rp_ai_running': {status: DiscordRunningAI};
  'ipc:win-get_system_info': Record<string, never>;
  'ipc:win-open_url_default_browser': {url: string};

  // file
  'ipc:file-open_dialog': {option: OpenDialogOptions};
  'ipc:file-open_path': {dir: string};
  'ipc:file-get_app_directories': {name: FolderNames};
  'ipc:file-remove_dir': {dir: string};
  'ipc:file-trash_dir': {dir: string};
  'ipc:file-list_dir': {dirPath: string; relatives: string[]};
  'ipc:file-check_files_exist': {dir: string; fileNames: string[]};
  'ipc:file-calc_folder_size': {dir: string};
  'ipc:file-get_relative_path': {basePath: string; targetPath: string};
  'ipc:file-get_absolute_path': {basePath: string; targetPath: string};
  'ipc:file-is_empty_dir': {dir: string};

  // git
  'ipc:git-clone_shallow': {url: string; directory: string; singleBranch: boolean; depth?: number; branch?: string};
  'ipc:git-clone_shallow_promise': {
    url: string;
    directory: string;
    singleBranch: boolean;
    depth?: number;
    branch?: string;
  };
  'ipc:git-get_repo_info': {dir: string};
  'ipc:git-change_branch': {dir: string; branchName: string};
  'ipc:git-unshallow': {dir: string};
  'ipc:git-reset_hard': {dir: string};
  'ipc:git-validate_git_dir': {dir: string; url: string};
  'ipc:git-pull': {repoDir: string; id: string};
  'ipc:git-stash_drop': {dir: string};

  // module
  'ipc:module-card_update_available': {card: InstalledCard; updateType: 'git' | 'stepper' | undefined};
  'ipc:module-get_modules_data': Record<string, never>;
  'ipc:module-get_installed_modules_info': Record<string, never>;
  'ipc:module-get_skipped': Record<string, never>;
  'ipc:module-check_ea': {isEA: boolean; isInsider: boolean};
  'ipc:module-install_module': {url: string};
  'ipc:module-uninstall_module': {id: string};
  'ipc:module-uninstall_card_by_id': {id: string};
  'ipc:module-is_update_available': {id: string};
  'ipc:module-update_available_list': Record<string, never>;
  'ipc:module-update_module': {id: string};
  'ipc:module-update_all_modules': Record<string, never>;
  'ipc:module-check_cards_update_interval': {updateType: {id: string; type: 'git' | 'stepper'}[]};

  // moduleApi
  'ipc:module_api-get_folder_creation_time': {dir: string};
  'ipc:module_api-get_last_pulled_date': {dir: string};
  'ipc:module_api-get_current_release_tag': {dir: string};

  // extension
  'ipc:extension-get_extensions_data': Record<string, never>;
  'ipc:extension-get_installed_extensions_info': Record<string, never>;
  'ipc:extension-get_skipped': Record<string, never>;
  'ipc:extension-install_extension': {url: string};
  'ipc:extension-uninstall_extension': {id: string};
  'ipc:extension-is_update_available': {id: string};
  'ipc:extension-update_available_list': Record<string, never>;
  'ipc:extension-update_extension': {id: string};
  'ipc:extension-check_ea': {isEA: boolean; isInsider: boolean};
  'ipc:extension-update_all_extensions': Record<string, never>;

  // storageUtils
  'ipc:storage_utils-add_installed_card': {cardData: InstalledCard};
  'ipc:storage_utils-remove_installed_card': {cardId: string};
  'ipc:storage_utils-add_auto_update_card': {cardId: string};
  'ipc:storage_utils-remove_auto_update_card': {cardId: string};
  'ipc:storage_utils-add_auto_update_extensions': {cardId: string};
  'ipc:storage_utils-remove_auto_update_extensions': {cardId: string};
  'ipc:storage_utils-pinned_cards': {opt: StorageOperation; id: string; pinnedCards?: string[]};
  'ipc:storage_utils-pre_commands': {opt: StorageOperation; data: PreCommands};
  'ipc:storage_utils-custom_run': {opt: StorageOperation; data: PreCommands};
  'ipc:storage_utils-update_custom_run_behavior': {data: CustomRunBehaviorData};
  'ipc:storage_utils-pre_open': {opt: StorageOperation; open: PreOpen};
  'ipc:storage_utils-get_card_arguments': {cardId: string};
  'ipc:storage_utils-set_card_arguments': {cardId: string; args: ChosenArgumentsData};
  'ipc:storage_utils-recently_used_cards': {opt: RecentlyOperation; id: string};
  'ipc:storage_utils-home_category': {opt: StorageOperation; data: HomeCategory};
  'ipc:storage_utils-set_system_startup': {startup: boolean};
  'ipc:storage_utils-update_zoom_factor': {zoomFactor: number};
  'ipc:storage_utils-add_browser_recent': {recentEntry: string};
  'ipc:storage_utils-add_browser_favorite': {favoriteEntry: string};
  'ipc:storage_utils-add_browser_history': {historyEntry: string};
  'ipc:storage_utils-add_browser_recent_favicon': {url: string; favIcon: string};
  'ipc:storage_utils-remove_browser_recent': {url: string};
  'ipc:storage_utils-remove_browser_favorite': {url: string};
  'ipc:storage_utils-remove_browser_history': {url: string};
  'ipc:storage_utils-set_show_confirm': {
    type: 'closeConfirm' | 'terminateAIConfirm' | 'closeTabConfirm';
    enable: boolean;
  };
  'ipc:storage_utils-add_read_notif': {id: string};

  // utils
  'ipc:utils-update_all_extensions': {data: {id: string; dir: string}};
  'ipc:utils-get_extensions_details': {dir: string};
  'ipc:utils-get_extensions_update_status': {dir: string};
  'ipc:utils-disable_extension': {disable: boolean; dir: string};
  'ipc:utils-cancel_extensions_data': Record<string, never>;
  'ipc:utils-download_file': {url: string};
  'ipc:utils-cancel_download': Record<string, never>;
  'ipc:utils-decompress_file': {filePath: string};
  'ipc:utils-is_response_valid': {url: string};
  'ipc:utils-get_image_as_data_url': {url: string};

  // appUpdate
  'ipc:app_update-download': Record<string, never>;
  'ipc:app_update-cancel': Record<string, never>;
  'ipc:app_update-install': Record<string, never>;

  // appData
  'ipc:app_data-get_current_path': Record<string, never>;
  'ipc:app_data-select_another': Record<string, never>;
  'ipc:app_data-is_app_dir': {dir: string};

  // storage
  'ipc:storage-get_custom': {key: string};
  'ipc:storage-set_custom': {key: string; data: any};
  'ipc:storage-get': {key: keyof StorageTypes};
  'ipc:storage-get_all': Record<string, never>;
  'ipc:storage-update': {key: keyof StorageTypes; updateData: any};
  'ipc:storage-clear': Record<string, never>;

  // contextMenu
  'ipc:context_menu-resize_window': {dimensions: {width: number; height: number}};
  'ipc:context_menu-show_window': Record<string, never>;
  'ipc:context_menu-hide_window': Record<string, never>;
  'ipc:context_menu-open_terminate_ai': {id: string};
  'ipc:context_menu-open_terminate_tab': {id: string; customPosition?: {x: number; y: number}};
  'ipc:context_menu-open_close_app': Record<string, never>;
  'ipc:context_menu-relaunch_ai': {id: string};
  'ipc:context_menu-stop_ai': {id: string};
  'ipc:context_menu-remove_tab': {tabID: string};

  // contextItems
  'ipc:context_items-copy': {id: number};
  'ipc:context_items-paste': {id: number};
  'ipc:context_items-replace_misspelling': {id: number; text: string};
  'ipc:context_items-select_all': {id: number};
  'ipc:context_items-undo': {id: number};
  'ipc:context_items-redo': {id: number};
  'ipc:context_items-new_tab': {url: string};
  'ipc:context_items-open_external': {url: string};
  'ipc:context_items-download_image': {id: number; url: string};
  'ipc:context_items-navigate': {id: number; action: 'back' | 'forward' | 'refresh'};

  // browser
  'ipc:browser-create': {id: string};
  'ipc:browser-remove': {id: string};
  'ipc:browser-load_url': {id: string; url: string};
  'ipc:browser-set_visible': {id: string; visible: boolean};
  'ipc:browser-open_find_in_page': {id: string; customPosition?: {x: number; y: number}};
  'ipc:browser-open_zoom': {id: string};
  'ipc:browser-find_in_page': {id: string; value: string; options: FindInPageOptions};
  'ipc:browser-stop_find_in_page': {id: string; action: 'clearSelection' | 'keepSelection' | 'activateSelection'};
  'ipc:browser-focus_web_view': {id: string};
  'ipc:browser-clear_cache': Record<string, never>;
  'ipc:browser-clear_cookies': Record<string, never>;
  'ipc:browser-set_zoom_factor': {id: string; factor: number};
  'ipc:browser-reload': {id: string};
  'ipc:browser-go_back': {id: string};
  'ipc:browser-go_forward': {id: string};
  'ipc:browser-get_user_agent': {type?: AgentTypes};
  'ipc:browser-update_user_agent': Record<string, never>;
  'ipc:browser-add_offset': {id: string; offset: WHType};

  // statics
  'ipc:statics-pull': Record<string, never>;
  'ipc:statics-get_releases': Record<string, never>;
  'ipc:statics-get_insider': Record<string, never>;
  'ipc:statics-get_notification': Record<string, never>;
  'ipc:statics-get_modules': Record<string, never>;
  'ipc:statics-get_extensions': Record<string, never>;
  'ipc:statics-get_extensions_ea': Record<string, never>;
  'ipc:statics-get_patrons': Record<string, never>;
};
