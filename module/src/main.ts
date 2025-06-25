import {COMFYUI_ID, OPEN_WEBUI_ID} from './Constants';
import {MainModules, MainModuleUtils} from './types';
import Comfy_MM from './WebUI/ComfyUI (comfyanonymous)/MainMethods';
import OpenWebUI_MM from './WebUI/OpenWebUI/MainMethods';

export default async function initialModule(utils: MainModuleUtils): Promise<MainModules[]> {
  return [
    {id: COMFYUI_ID, methods: () => Comfy_MM(utils)},
    {id: OPEN_WEBUI_ID, methods: () => OpenWebUI_MM(utils)},
  ];
}
