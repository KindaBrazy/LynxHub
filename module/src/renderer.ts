import {CardModules} from '../../src/common/types/plugins/modules';
import {COMFYUI_ID, OPEN_WEBUI_ID} from './Constants';
import comfyArguments from './WebUI/ComfyUI (comfyanonymous)/Arguments';
import COMFYUI_RM from './WebUI/ComfyUI (comfyanonymous)/RendererMethods';
import openArguments from './WebUI/OpenWebUI/Arguments';
import OPEN_WEBUI_RM from './WebUI/OpenWebUI/RendererMethods';

const rendererModules: CardModules = [
  {
    routePath: 'imageGen_page',
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
        arguments: comfyArguments,
        methods: COMFYUI_RM,
        installationType: 'git',
      },
    ],
  },
  {
    routePath: 'textGen_page',
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
        methods: OPEN_WEBUI_RM,
        installationType: 'others',
        uninstallType: 'others',
        arguments: openArguments,
      },
    ],
  },
];

export default rendererModules;
