type ItemsList = {
  id: string;
  title: string;
  version: string;
  developer: string;
  description: string;
  url: string;
  avatarUrl: string;
};
export const testExtensionsList: ItemsList[] = [
  {
    id: 'dark_theme_pro',
    title: 'Dark Theme Pro',
    version: '2.1.0',
    developer: 'ThemeWorks Inc.',
    description:
      'Professional dark theme with customizable color schemes and syntax highlighting for better code readability.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=truck',
  },
  {
    id: 'code_snippets_manager',
    title: 'Code Snippets Manager',
    version: '1.4.3',
    developer: 'DevTools Solutions',
    description: 'Save, organize, and reuse your favorite code snippets with searchable tags and categories.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=printer',
  },
  {
    id: 'auto_format_plus',
    title: 'Auto Format Plus',
    version: '3.0.1',
    developer: 'CleanCode Labs',
    description: 'Advanced code formatting tool supporting multiple languages and custom formatting rules.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=mouse',
  },
  {
    id: 'git_flow_helper',
    title: 'Git Flow Helper',
    version: '1.2.0',
    developer: 'GitMaster Team',
    description: 'Simplifies Git workflow with visual branch management and common Git operations automation.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=alarm',
  },
  {
    id: 'debug_toolkit',
    title: 'Debug Toolkit',
    version: '2.5.4',
    developer: 'BugBusters',
    description:
      'Comprehensive debugging tools including variable inspection, breakpoint management, and performance profiling.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=moon',
  },
  {
    id: 'project_explorer_pro',
    title: 'Project Explorer Pro',
    version: '4.1.2',
    developer: 'FileSystem Solutions',
    description: 'Enhanced file explorer with advanced search, filtering, and custom workspace organization features.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=mailbox',
  },
  {
    id: 'live_collaboration',
    title: 'Live Collaboration',
    version: '1.0.5',
    developer: 'TeamSync Ltd.',
    description:
      'Real-time code collaboration tool with integrated chat, cursor sharing, and simultaneous editing capabilities.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=trophy',
  },
  {
    id: 'type_checker_enhanced',
    title: 'Type Checker Enhanced',
    version: '2.2.1',
    developer: 'TypeMaster',
    description: 'Advanced TypeScript type checking with detailed error reporting and quick fixes suggestions.',
    url: 'https://github.com/KindaBrazy/LynxHub',
    avatarUrl: 'https://api.dicebear.com/9.x/icons/svg?icon=wallet2',
  },
];

type ListItem = {
  name: string;
  subitems?: ListItem[];
};

type ChangelogItems = {
  title: string;
  items: ListItem[];
};

export const testChangelog: ChangelogItems[] = [
  {
    title: 'V1.3.5',
    items: [
      {name: 'Feature A', subitems: [{name: 'Subfeature A1'}, {name: 'Subfeature A2'}]},
      {
        name: 'Feature B',
        subitems: [
          {name: 'Subfeature B1'},
          {
            name: 'Subfeature B2',
            subitems: [{name: 'Subfeature B2a'}, {name: 'Subfeature B2b'}],
          },
        ],
      },
      {name: 'Feature C'},
    ],
  },
  {
    title: 'V2.0.5',
    items: [
      {
        name: 'Something new added',
        subitems: [{name: 'This feature add some cool animation to the cards'}, {name: 'Subfeature A2'}],
      },
      {
        name: 'Feature B',
        subitems: [
          {name: 'Subfeature B1'},
          {
            name: 'Subfeature B2',
            subitems: [{name: 'Subfeature B2a'}, {name: 'Subfeature B2b'}],
          },
        ],
      },
      {name: 'Feature C'},
    ],
  },
];
