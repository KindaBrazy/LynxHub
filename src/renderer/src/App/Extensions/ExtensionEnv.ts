/** UnComment this section if you're working on extension development */
// import ExtensionsProvider, {useExtensions_Dev as useExtensions} from './ExtensionsContext_Dev';

/** Comment this section if you're working on extension development */
import ExtensionsProvider, {useExtensions_Prod as useExtensions} from './ExtensionsContext_Prod';

export default ExtensionsProvider;

export {useExtensions};
