import {CardModules} from '../../src/cross/plugin/ModuleTypes';
import {COMFYUI_ID, OPEN_WEBUI_ID} from './Constants';
import comfyArguments from './WebUI/ComfyUI (comfyanonymous)/Arguments';
import COMFYUI_RM from './WebUI/ComfyUI (comfyanonymous)/RendererMethods';
import openArguments from './WebUI/OpenWebUI/Arguments';
import OPEN_WEBUI_RM from './WebUI/OpenWebUI/RendererMethods';

const rendererModules: CardModules = [
  {
    routePath: '/imageGenerationPage',
    cards: [
      {
        id: COMFYUI_ID,
        title: 'ComfyUI',
        description:
          'This ui will let you design and execute advanced stable diffusion pipelines' +
          ' using a graph/nodes/flowchart based interface.',
        repoUrl: 'https://github.com/comfyanonymous/ComfyUI',
        extensionsDir: '/custom_nodes',
        type: 'image',
        bgUrl:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e7be14a2-5e23-41df-b653-4ba5b45ad065' +
          '/width=300/00008-2000176836.jpeg',
        arguments: comfyArguments,
        methods: COMFYUI_RM,
        installationType: 'git',
      },
    ],
  },
  {
    routePath: '/textGenerationPage',
    cards: [
      {
        id: OPEN_WEBUI_ID,
        title: 'Open WebUI',
        description:
          'Open WebUI is an extensible, feature-rich, and user-friendly self-hosted ' +
          'WebUI designed to operate entirely offline. It supports various LLM runners,' +
          ' including Ollama and OpenAI-compatible APIs. ',
        repoUrl: 'https://github.com/open-webui/open-webui',
        type: 'text',
        bgUrl:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/223520d9-9071-4b73-9171-9628a804f89f/' +
          'width=300/00025-4013828223.jpeg',
        methods: OPEN_WEBUI_RM,
        installationType: 'others',
        uninstallType: 'others',
        arguments: openArguments,
      },
    ],
  },
];

export default rendererModules;
