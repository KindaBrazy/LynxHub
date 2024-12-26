import {Extension_Changelogs, Extension_ListData} from '../../../../../../../cross/CrossTypes';

export const testChangelogs: {[key: string]: Extension_Changelogs[]} = {
  dark_theme_pro: [
    {
      title: "What's New in 2.1.0",
      items: [
        {
          label: 'New Color Themes',
          subitems: [
            {label: "Added 'Midnight Ocean' theme palette"},
            {label: "Added 'Forest Dark' theme palette"},
            {label: 'Improved contrast ratios across all themes'},
          ],
        },
        {
          label: 'Syntax Highlighting Improvements',
          subitems: [
            {label: 'Enhanced TypeScript highlighting'},
            {label: 'Added special highlighting for DEBUG comments'},
            {label: 'Fixed JSON property highlighting issues'},
          ],
        },
        {label: 'Reduced memory usage by 15%'},
      ],
    },
    {
      title: 'Version 2.0.0 Updates',
      items: [
        {
          label: 'Theme Customization Engine',
          subitems: [
            {label: 'Custom color picker integration'},
            {label: 'Theme export/import functionality'},
            {label: 'Live preview of changes'},
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
          label: 'Bug Fixes',
          subitems: [{label: 'Fixed snippet duplication issue'}, {label: 'Resolved search indexing problems'}],
        },
        {label: 'Improved tag autocomplete performance'},
      ],
    },
    {
      title: 'Version 1.4.0 Features',
      items: [
        {
          label: 'New Organization Features',
          subitems: [
            {label: 'Folder-based snippet organization'},
            {label: 'Bulk tag management'},
            {label: 'Advanced sorting options'},
          ],
        },
      ],
    },
  ],

  auto_format_plus: [
    {
      title: 'Version 3.0.1 Patch Notes',
      items: [
        {label: 'Fixed formatting issues with Python docstrings'},
        {label: 'Improved performance for large files'},
        {
          label: 'Language Updates',
          subitems: [{label: 'Added support for Rust'}, {label: 'Updated Python formatter to match PEP 8'}],
        },
      ],
    },
  ],

  git_flow_helper: [
    {
      title: 'Version 1.2.0 Release Notes',
      items: [
        {
          label: 'New Features',
          subitems: [
            {label: 'Interactive rebase helper'},
            {label: 'Branch visualization improvements'},
            {label: 'Commit message templates'},
          ],
        },
        {
          label: 'Performance Improvements',
          subitems: [{label: 'Faster branch switching'}, {label: 'Optimized large repository handling'}],
        },
      ],
    },
  ],

  debug_toolkit: [
    {
      title: 'Version 2.5.4 Updates',
      items: [
        {
          label: 'New Debug Features',
          subitems: [{label: 'Added conditional breakpoints'}, {label: 'Improved variable inspection UI'}],
        },
        {
          label: 'Performance Tools',
          subitems: [{label: 'New memory leak detector'}, {label: 'CPU usage analyzer'}],
        },
      ],
    },
  ],

  project_explorer_pro: [
    {
      title: 'Version 4.1.2 Changes',
      items: [
        {
          label: 'Search Improvements',
          subitems: [{label: 'Added regex search support'}, {label: 'Improved search result highlighting'}],
        },
        {
          label: 'Workspace Features',
          subitems: [{label: 'Custom workspace layouts'}, {label: 'Improved file filtering'}],
        },
      ],
    },
  ],

  live_collaboration: [
    {
      title: 'Version 1.0.5 Updates',
      items: [
        {
          label: 'Collaboration Features',
          subitems: [{label: 'Added presence indicators'}, {label: 'Improved cursor sync'}],
        },
        {
          label: 'Chat Improvements',
          subitems: [{label: 'Code snippet sharing in chat'}, {label: 'Emoji reactions'}],
        },
      ],
    },
  ],

  type_checker_enhanced: [
    {
      title: 'Version 2.2.1 Release Notes',
      items: [
        {
          label: 'Type Checking Improvements',
          subitems: [{label: 'Enhanced generic type inference'}, {label: 'Better union type handling'}],
        },
        {
          label: 'Quick Fixes',
          subitems: [{label: 'Added more automatic type fixes'}, {label: 'Improved suggestion accuracy'}],
        },
      ],
    },
  ],
};

export const testExtensionsList: Extension_ListData[] = [
  {
    id: 'dark_theme_pro',
    changeLog: testChangelogs['dark_theme_pro'],
    title: 'Dark Theme Pro',
    version: '2.1.0',
    updateDate: '2024-11-23',
    developer: 'ThemeWorks Inc.',
    description:
      'Professional dark theme with customizable color schemes and syntax highlighting for better code readability.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=truck',
    tag: 'games',
  },
  {
    id: 'lynxhub_hardware_monitor',
    changeLog: testChangelogs['code_snippets_manager'],
    title: 'Code Snippets Manager',
    version: '1.4.3',
    developer: 'DevTools Solutions',
    updateDate: '2024-11-23',
    description: 'Save, organize, and reuse your favorite code snippets with searchable tags and categories.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/personas/svg',
    tag: 'tools',
  },
  {
    id: 'auto_format_plus',
    changeLog: testChangelogs['auto_format_plus'],
    title: 'Auto Format Plus',
    version: '3.0.1',
    developer: 'CleanCode Labs',
    updateDate: '2024-11-23',
    description: 'Advanced code formatting tool supporting multiple languages and custom formatting rules.',
    url: 'https://github.com/comfyanonymous/ComfyUI',
    avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=mouse',
    tag: 'games',
  },
  {
    id: 'git_flow_helper',
    changeLog: testChangelogs['git_flow_helper'],
    title: 'Git Flow Helper',
    version: '1.2.0',
    updateDate: '2024-11-23',
    developer: 'GitMaster Team',
    description: 'Simplifies Git workflow with visual branch management and common Git operations automation.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=alarm',
    tag: 'feature',
  },
  {
    id: 'debug_toolkit',
    changeLog: testChangelogs['debug_toolkit'],
    title: 'Debug Toolkit',
    version: '2.5.4',
    developer: 'BugBusters',
    updateDate: '2024-11-23',
    description:
      'Comprehensive debugging tools including variable inspection, breakpoint management, and performance profiling.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=moon',
    tag: 'tools',
  },
  {
    id: 'project_explorer_pro',
    changeLog: testChangelogs['project_explorer_pro'],
    title: 'Project Explorer Pro',
    version: '4.1.2',
    updateDate: '2024-11-23',
    developer: 'FileSystem Solutions',
    description: 'Enhanced file explorer with advanced search, filtering, and custom workspace organization features.',
    url: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
    avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=mailbox',
    tag: 'games',
  },
  {
    id: 'live_collaboration',
    changeLog: testChangelogs['live_collaboration'],
    title: 'Live Collaboration',
    version: '1.0.5',
    developer: 'TeamSync Ltd.',
    updateDate: '2024-11-23',
    description:
      'Real-time code collaboration tool with integrated chat, cursor sharing, and simultaneous editing capabilities.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=trophy',
    tag: 'tools',
  },
  {
    id: 'type_checker_enhanced',
    changeLog: testChangelogs['type_checker_enhanced'],
    updateDate: '2024-11-23',
    title: 'Type Checker Enhanced',
    version: '2.2.1',
    developer: 'TypeMaster',
    description: 'Advanced TypeScript type checking with detailed error reporting and quick fixes suggestions.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=wallet2',
    tag: 'feature',
  },
];
