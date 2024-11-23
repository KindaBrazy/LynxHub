type ListItem = {
  name: string;
  subitems?: ListItem[];
};

type ChangelogItems = {
  title: string;
  items: ListItem[];
};

type ItemsList = {
  id: string;
  title: string;
  version: string;
  developer: string;
  description: string;
  changelog: ChangelogItems[];
  updateDate: string;
  url: string;
  avatarUrl: string;
};

export const testChangelogs: {[key: string]: ChangelogItems[]} = {
  dark_theme_pro: [
    {
      title: "What's New in 2.1.0",
      items: [
        {
          name: 'New Color Themes',
          subitems: [
            {name: "Added 'Midnight Ocean' theme palette"},
            {name: "Added 'Forest Dark' theme palette"},
            {name: 'Improved contrast ratios across all themes'},
          ],
        },
        {
          name: 'Syntax Highlighting Improvements',
          subitems: [
            {name: 'Enhanced TypeScript highlighting'},
            {name: 'Added special highlighting for DEBUG comments'},
            {name: 'Fixed JSON property highlighting issues'},
          ],
        },
        {name: 'Reduced memory usage by 15%'},
      ],
    },
    {
      title: 'Version 2.0.0 Updates',
      items: [
        {
          name: 'Theme Customization Engine',
          subitems: [
            {name: 'Custom color picker integration'},
            {name: 'Theme export/import functionality'},
            {name: 'Live preview of changes'},
          ],
        },
      ],
    },
  ],

  code_snippets_manager: [
    {
      title: 'Version 1.4.3 Changes',
      items: [
        {
          name: 'Bug Fixes',
          subitems: [{name: 'Fixed snippet duplication issue'}, {name: 'Resolved search indexing problems'}],
        },
        {name: 'Improved tag autocomplete performance'},
      ],
    },
    {
      title: 'Version 1.4.0 Features',
      items: [
        {
          name: 'New Organization Features',
          subitems: [
            {name: 'Folder-based snippet organization'},
            {name: 'Bulk tag management'},
            {name: 'Advanced sorting options'},
          ],
        },
      ],
    },
  ],

  auto_format_plus: [
    {
      title: 'Version 3.0.1 Patch Notes',
      items: [
        {name: 'Fixed formatting issues with Python docstrings'},
        {name: 'Improved performance for large files'},
        {
          name: 'Language Updates',
          subitems: [{name: 'Added support for Rust'}, {name: 'Updated Python formatter to match PEP 8'}],
        },
      ],
    },
  ],

  git_flow_helper: [
    {
      title: 'Version 1.2.0 Release Notes',
      items: [
        {
          name: 'New Features',
          subitems: [
            {name: 'Interactive rebase helper'},
            {name: 'Branch visualization improvements'},
            {name: 'Commit message templates'},
          ],
        },
        {
          name: 'Performance Improvements',
          subitems: [{name: 'Faster branch switching'}, {name: 'Optimized large repository handling'}],
        },
      ],
    },
  ],

  debug_toolkit: [
    {
      title: 'Version 2.5.4 Updates',
      items: [
        {
          name: 'New Debug Features',
          subitems: [{name: 'Added conditional breakpoints'}, {name: 'Improved variable inspection UI'}],
        },
        {
          name: 'Performance Tools',
          subitems: [{name: 'New memory leak detector'}, {name: 'CPU usage analyzer'}],
        },
      ],
    },
  ],

  project_explorer_pro: [
    {
      title: 'Version 4.1.2 Changes',
      items: [
        {
          name: 'Search Improvements',
          subitems: [{name: 'Added regex search support'}, {name: 'Improved search result highlighting'}],
        },
        {
          name: 'Workspace Features',
          subitems: [{name: 'Custom workspace layouts'}, {name: 'Improved file filtering'}],
        },
      ],
    },
  ],

  live_collaboration: [
    {
      title: 'Version 1.0.5 Updates',
      items: [
        {
          name: 'Collaboration Features',
          subitems: [{name: 'Added presence indicators'}, {name: 'Improved cursor sync'}],
        },
        {
          name: 'Chat Improvements',
          subitems: [{name: 'Code snippet sharing in chat'}, {name: 'Emoji reactions'}],
        },
      ],
    },
  ],

  type_checker_enhanced: [
    {
      title: 'Version 2.2.1 Release Notes',
      items: [
        {
          name: 'Type Checking Improvements',
          subitems: [{name: 'Enhanced generic type inference'}, {name: 'Better union type handling'}],
        },
        {
          name: 'Quick Fixes',
          subitems: [{name: 'Added more automatic type fixes'}, {name: 'Improved suggestion accuracy'}],
        },
      ],
    },
  ],
};

export const testExtensionsList: ItemsList[] = [
  {
    id: 'dark_theme_pro',
    changelog: testChangelogs['dark_theme_pro'],
    title: 'Dark Theme Pro',
    version: '2.1.0',
    updateDate: '2024-11-23',
    developer: 'ThemeWorks Inc.',
    description:
      'Professional dark theme with customizable color schemes and syntax highlighting for better code readability.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=truck',
  },
  {
    id: 'code_snippets_manager',
    changelog: testChangelogs['code_snippets_manager'],
    title: 'Code Snippets Manager',
    version: '1.4.3',
    developer: 'DevTools Solutions',
    updateDate: '2024-11-23',
    description: 'Save, organize, and reuse your favorite code snippets with searchable tags and categories.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=printer',
  },
  {
    id: 'auto_format_plus',
    changelog: testChangelogs['auto_format_plus'],
    title: 'Auto Format Plus',
    version: '3.0.1',
    developer: 'CleanCode Labs',
    updateDate: '2024-11-23',
    description: 'Advanced code formatting tool supporting multiple languages and custom formatting rules.',
    url: 'https://github.com/comfyanonymous/ComfyUI',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=mouse',
  },
  {
    id: 'git_flow_helper',
    changelog: testChangelogs['git_flow_helper'],
    title: 'Git Flow Helper',
    version: '1.2.0',
    updateDate: '2024-11-23',
    developer: 'GitMaster Team',
    description: 'Simplifies Git workflow with visual branch management and common Git operations automation.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=alarm',
  },
  {
    id: 'debug_toolkit',
    changelog: testChangelogs['debug_toolkit'],
    title: 'Debug Toolkit',
    version: '2.5.4',
    developer: 'BugBusters',
    updateDate: '2024-11-23',
    description:
      'Comprehensive debugging tools including variable inspection, breakpoint management, and performance profiling.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=moon',
  },
  {
    id: 'project_explorer_pro',
    changelog: testChangelogs['project_explorer_pro'],
    title: 'Project Explorer Pro',
    version: '4.1.2',
    updateDate: '2024-11-23',
    developer: 'FileSystem Solutions',
    description: 'Enhanced file explorer with advanced search, filtering, and custom workspace organization features.',
    url: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=mailbox',
  },
  {
    id: 'live_collaboration',
    changelog: testChangelogs['live_collaboration'],
    title: 'Live Collaboration',
    version: '1.0.5',
    developer: 'TeamSync Ltd.',
    updateDate: '2024-11-23',
    description:
      'Real-time code collaboration tool with integrated chat, cursor sharing, and simultaneous editing capabilities.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=trophy',
  },
  {
    id: 'type_checker_enhanced',
    changelog: testChangelogs['type_checker_enhanced'],
    updateDate: '2024-11-23',
    title: 'Type Checker Enhanced',
    version: '2.2.1',
    developer: 'TypeMaster',
    description: 'Advanced TypeScript type checking with detailed error reporting and quick fixes suggestions.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=wallet2',
  },
];
