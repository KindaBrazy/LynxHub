// noinspection SpellCheckingInspection

import {ArgumentsData} from '../../../../src/cross/plugin/ModuleTypes';

/* eslint max-len: 0 */

const openArguments: ArgumentsData = [
  {
    category: 'App/Backend',
    sections: [
      {
        section: 'General',
        items: [
          {
            name: 'ENV',
            description: 'Environment setting.',
            type: 'DropDown',
            values: ['dev', 'prod'],
            defaultValue: 'dev',
          },
          {
            name: 'CUSTOM_NAME',
            description: 'Sets WEBUI_NAME but polls api.openwebui.com for metadata.',
            type: 'Input',
          },
          {
            name: 'GLOBAL_LOG_LEVEL',
            description:
              'Configures the root logger in Python, affecting all loggers in Open WebUI' +
              ' and potentially some third-party libraries',
            type: 'DropDown',
            values: ['CRITICAL', 'ERROR', 'WARNING', 'INFO', 'DEBUG', 'NOTSET'],
            defaultValue: 'INFO',
          },
          {
            name: 'WEBUI_NAME',
            description: 'Sets the main WebUI name. Appends (Open WebUI) if overridden.',
            type: 'Input',
            defaultValue: 'Open WebUI',
          },
          {
            name: 'WEBUI_URL',
            description:
              'Specifies the URL where the Open WebUI is reachable. Currently used for search engine support.',
            type: 'Input',
            defaultValue: 'http://localhost:3000',
          },
          {
            name: 'PORT',
            description: 'Sets the port to run Open WebUI from.',
            type: 'Input',
            defaultValue: 8080,
          },
          {
            name: 'ENABLE_SIGNUP',
            description: 'Toggles user account creation.',
            type: 'CheckBox',
          },
          {
            name: 'ENABLE_LOGIN_FORM',
            description:
              'Toggles email, password, sign in and "or" (only when ENABLE_OAUTH_SIGNUP is set to True) elements.',
            type: 'CheckBox',
          },
          {
            name: 'ENABLE_REALTIME_CHAT_SAVE',
            description:
              'When enabled, the system saves each chunk of streamed chat data to the database in real time to ' +
              'ensure maximum data persistency. This feature provides robust data recovery and allows accurate ' +
              'session tracking. However, the tradeoff is increased latency, as saving to the database introduces ' +
              'a delay. Disabling this feature can improve performance and reduce delays, but it risks potential' +
              " data loss in the event of a system failure or crash. Use based on your application's requirements" +
              ' and acceptable tradeoffs.',
            type: 'CheckBox',
          },
          {
            name: 'ENABLE_ADMIN_EXPORT',
            description: 'Controls whether admin users can export data.',
            type: 'CheckBox',
          },
          {
            name: 'ENABLE_ADMIN_CHAT_ACCESS',
            description: 'Enables admin users to access all chats.',
            type: 'CheckBox',
          },
          {
            name: 'ENABLE_CHANNELS',
            description: 'Enables or disables channel support.',
            type: 'CheckBox',
          },
          {
            name: 'ADMIN_EMAIL',
            description: 'Sets the admin email shown by SHOW_ADMIN_DETAILS',
            type: 'Input',
          },
          {
            name: 'SHOW_ADMIN_DETAILS',
            description: 'Toggles whether to show admin user details in the interface.',
            type: 'CheckBox',
          },
          {
            name: 'BYPASS_MODEL_ACCESS_CONTROL',
            description: 'Bypasses model access control.',
            type: 'CheckBox',
          },
          {
            name: 'DEFAULT_MODELS',
            description: 'Sets a default Language Model.',
            type: 'Input',
          },
          {
            name: 'DEFAULT_USER_ROLE',
            description: 'Sets the default role assigned to new users.',
            type: 'DropDown',
            values: ['pending', 'user', 'admin'],
            defaultValue: 'pending',
          },
          {
            name: 'DEFAULT_LOCALE',
            description: 'Sets the default locale for the application.',
            type: 'Input',
            defaultValue: 'en',
          },
          {
            name: 'WEBHOOK_URL',
            description: 'Sets a webhook for integration with Discord/Slack/Microsoft Teams.',
            type: 'Input',
          },
          {
            name: 'WEBUI_BUILD_HASH',
            description: 'Used for identifying the Git SHA of the build for releases.',
            type: 'Input',
            defaultValue: 'dev-build',
          },
          {
            name: 'WEBUI_BANNERS',
            description: 'List of banners to show to users.',
            type: 'Input',
          },
          {
            name: 'JWT_EXPIRES_IN',
            description:
              'Sets the JWT expiration time in seconds. Valid time units: s, m, h, d, w or -1 for no expiration.',
            type: 'Input',
            defaultValue: -1,
          },
          {
            name: 'USE_CUDA_DOCKER',
            description:
              'Builds the Docker image with NVIDIA CUDA support. Enables GPU acceleration for local Whisper and embeddings.',
            type: 'CheckBox',
          },
        ],
      },
      {
        section: 'AIOHTTP Client',
        items: [
          {
            name: 'AIOHTTP_CLIENT_TIMEOUT',
            description:
              'Specifies the timeout duration in seconds for the aiohttp client. This impacts' +
              ' things such as connections to Ollama and OpenAI endpoints.',
            type: 'Input',
            defaultValue: 300,
          },
          {
            name: 'AIOHTTP_CLIENT_TIMEOUT_OPENAI_MODEL_LIST',
            description:
              'Sets the timeout in seconds for fetching the OpenAI model list. This can be useful' +
              ' in cases where network latency requires a longer timeout duration to successfully retrieve the model list.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'Directories',
        items: [
          {
            name: 'DATA_DIR',
            description:
              'Specifies the base directory for data storage, including uploads, cache, vector database, etc.',
            type: 'Input',
            defaultValue: './data',
          },
          {
            name: 'FONTS_DIR',
            description: 'Specifies the directory for fonts.',
            type: 'Input',
          },
          {
            name: 'FRONTEND_BUILD_DIR',
            description: 'Specifies the location of the built frontend files.',
            type: 'Input',
            defaultValue: '../build',
          },
          {
            name: 'STATIC_DIR',
            description: 'Specifies the directory for static files, such as the favicon.',
            type: 'Input',
            defaultValue: './static',
          },
        ],
      },
      {
        section: 'Ollama',
        items: [
          {
            name: 'ENABLE_OLLAMA_API',
            description: 'Enables the use of Ollama APIs.',
            type: 'CheckBox',
          },
          {
            name: 'OLLAMA_BASE_URL',
            description: 'Configures the Ollama backend URL.',
            type: 'Input',
            defaultValue: 'http://localhost:11434',
          },
          {
            name: 'OLLAMA_BASE_URLS',
            description:
              'Configures load-balanced Ollama backend hosts, separated by ;. See OLLAMA_BASE_URL.' +
              ' Takes precedence overOLLAMA_BASE_URL.',
            type: 'Input',
          },
          {
            name: 'USE_OLLAMA_DOCKER',
            description: 'Builds the Docker image with a bundled Ollama instance.',
            type: 'CheckBox',
          },
          {
            name: 'K8S_FLAG',
            description:
              'If set, assumes Helm chart deployment and sets OLLAMA_BASE_URL' +
              ' to http://ollama-service.open-webui.svc.cluster.local:11434',
            type: 'CheckBox',
          },
        ],
      },
      {
        section: 'OpenAI',
        items: [
          {
            name: 'ENABLE_OPENAI_API',
            description: 'Enables the use of OpenAI APIs.',
            type: 'CheckBox',
          },
          {
            name: 'OPENAI_API_BASE_URL',
            description: 'Configures the OpenAI base API URL.',
            type: 'Input',
            defaultValue: 'https://api.openai.com/v1',
          },
          {
            name: 'OPENAI_API_BASE_URLS',
            description: 'Supports balanced OpenAI base API URLs, semicolon-separated.',
            type: 'Input',
          },
          {
            name: 'OPENAI_API_KEY',
            description: 'Sets the OpenAI API key.',
            type: 'Input',
          },
          {
            name: 'OPENAI_API_KEYS',
            description: 'Supports multiple OpenAI API keys, semicolon-separated.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'Tasks',
        items: [
          {
            name: 'TASK_MODEL',
            description:
              'The default model to use for tasks such as title and web search query generation when using Ollama models.',
            type: 'Input',
          },
          {
            name: 'TASK_MODEL_EXTERNAL',
            description:
              'The default model to use for tasks such as title and web search query generation when' +
              ' using OpenAI-compatible endpoints.',
            type: 'Input',
          },
          {
            name: 'TITLE_GENERATION_PROMPT_TEMPLATE',
            description: 'Prompt to use when generating chat titles.',
            type: 'Input',
          },
          {
            name: 'TOOLS_FUNCTION_CALLING_PROMPT_TEMPLATE',
            description: 'Prompt to use when calling tools.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'Autocomplete',
        items: [
          {
            name: 'ENABLE_AUTOCOMPLETE_GENERATION',
            description: 'Enables or disables autocomplete generation.',
            type: 'CheckBox',
          },
          {
            name: 'AUTOCOMPLETE_GENERATION_INPUT_MAX_LENGTH',
            description: 'Sets the maximum input length for autocomplete generation.',
            type: 'Input',
            defaultValue: -1,
          },
          {
            name: 'AUTOCOMPLETE_GENERATION_PROMPT_TEMPLATE',
            description: 'Sets the prompt template for autocomplete generation.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'Evaluation Arena Model',
        items: [
          {
            name: 'ENABLE_EVALUATION_ARENA_MODELS',
            description: 'Enables or disables evaluation arena models.',
            type: 'CheckBox',
          },
          {
            name: 'ENABLE_MESSAGE_RATING',
            description: 'Enables message rating feature.',
            type: 'CheckBox',
          },
          {
            name: 'ENABLE_COMMUNITY_SHARING',
            description: 'Controls whether users are shown the share to community button.',
            type: 'CheckBox',
          },
        ],
      },
      {
        section: 'Tags Generation',
        items: [
          {
            name: 'ENABLE_TAGS_GENERATION',
            description: 'Enables or disables tags generation.',
            type: 'CheckBox',
          },
          {
            name: 'TAGS_GENERATION_PROMPT_TEMPLATE',
            description: 'Sets the prompt template for tags generation.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'API Key Endpoint Restrictions',
        items: [
          {
            name: 'ENABLE_API_KEY_ENDPOINT_RESTRICTIONS',
            description: 'Enables API key endpoint restrictions for added security and configurability.',
            type: 'CheckBox',
          },
          {
            name: 'API_KEY_ALLOWED_ENDPOINTS',
            description:
              'Specifies a comma-separated list of allowed API endpoints when API key endpoint restrictions are enabled.',
            type: 'Input',
          },
        ],
      },
    ],
  },
  {
    category: 'Security Variables',
    items: [
      {
        name: 'ENABLE_FORWARD_USER_INFO_HEADERS',
        description:
          'Forwards user information (name, id, email, and role) as X-headers to OpenAI API.' +
          ' If enabled, the following headers are forwarded:\n' +
          'X-OpenWebUI-User-Name\n' +
          'X-OpenWebUI-User-Id\n' +
          'X-OpenWebUI-User-Email\n' +
          'X-OpenWebUI-User-Role',
        type: 'CheckBox',
      },
      {
        name: 'ENABLE_RAG_LOCAL_WEB_FETCH',
        description:
          'Enables local web fetching for RAG. Enabling this allows Server Side Request' +
          ' Forgery attacks against local network resources.',
        type: 'CheckBox',
      },
      {
        name: 'ENABLE_RAG_WEB_LOADER_SSL_VERIFICATION',
        description: 'Bypass SSL Verification for RAG on Websites.',
        type: 'CheckBox',
      },
      {
        name: 'WEBUI_SESSION_COOKIE_SAME_SITE',
        description: 'Sets the SameSite attribute for session cookies.',
        type: 'DropDown',
        values: ['lax', 'strict', 'none'],
        defaultValue: 'lax',
      },
      {
        name: 'WEBUI_SESSION_COOKIE_SECURE',
        description: 'Sets the Secure attribute for session cookies if set to True.',
        type: 'CheckBox',
      },
      {
        name: 'WEBUI_AUTH',
        description: 'This setting enables or disables authentication.',
        type: 'CheckBox',
      },
      {
        name: 'WEBUI_SECRET_KEY',
        description: 'Overrides the randomly generated string used for JSON Web Token.',
        type: 'Input',
        defaultValue: 't0p-s3cr3t',
      },
      {
        name: 'CORS_ALLOW_ORIGIN',
        description: 'Sets the allowed origins for Cross-Origin Resource Sharing (CORS).',
        type: 'Input',
        defaultValue: '*',
      },
      {
        name: 'RAG_EMBEDDING_MODEL_TRUST_REMOTE_CODE',
        description: 'Determines whether or not to allow custom models defined on the Hub in their own modeling files.',
        type: 'CheckBox',
      },
      {
        name: 'RAG_RERANKING_MODEL_TRUST_REMOTE_CODE',
        description:
          'Determines whether or not to allow custom models defined on the Hub in their own modeling files for reranking.',
        type: 'CheckBox',
      },
      {
        name: 'OFFLINE_MODE',
        description: 'Enables or disables offline mode.',
        type: 'CheckBox',
      },
      {
        name: 'RESET_CONFIG_ON_START',
        description: 'Resets the config.json file on startup.',
        type: 'CheckBox',
      },
      {
        name: 'SAFE_MODE',
        description: 'Enables safe mode, which disables potentially unsafe features, deactivating all functions.',
        type: 'CheckBox',
      },
      {
        name: 'RAG_EMBEDDING_MODEL_AUTO_UPDATE',
        description: 'Toggles automatic update of the Sentence-Transformer model.',
        type: 'CheckBox',
      },
      {
        name: 'RAG_RERANKING_MODEL_AUTO_UPDATE',
        description: 'Toggles automatic update of the reranking model.',
        type: 'CheckBox',
      },
      {
        name: 'WHISPER_MODEL_AUTO_UPDATE',
        description: 'Toggles automatic update of the Whisper model.',
        type: 'CheckBox',
      },
    ],
  },
  {
    category: 'Retrieval Augmented Generation (RAG)',
    sections: [
      {
        section: 'RAG',
        items: [
          {
            name: 'VECTOR_DB',
            description:
              'Specifies which vector database system to use. This setting determines which vector' +
              ' storage system will be used for managing embeddings.',
            type: 'DropDown',
            values: ['chroma', 'milvus', 'qdrant', 'opensearch', 'pgvector'],
            defaultValue: 'chroma',
          },
          {
            name: 'RAG_EMBEDDING_ENGINE',
            description: 'Selects an embedding engine to use for RAG.',
            type: 'DropDown',
            values: ['', 'ollama', 'openai'],
          },
          {
            name: 'RAG_EMBEDDING_MODEL',
            description: 'Sets a model for embeddings. Locally, a Sentence-Transformer model is used.',
            type: 'Input',
            defaultValue: 'sentence-transformers/all-MiniLM-L6-v2',
          },
          {
            name: 'ENABLE_RAG_HYBRID_SEARCH',
            description:
              'Enables the use of ensemble search with BM25 + ChromaDB, with reranking using sentence_transformers models.',
            type: 'CheckBox',
          },
          {
            name: 'CONTENT_EXTRACTION_ENGINE',
            description: 'Sets the content extraction engine to use for document ingestion.',
            type: 'DropDown',
            values: ['', 'tika'],
          },
          {
            name: 'RAG_TOP_K',
            description: 'Sets the default number of results to consider when using RAG.',
            type: 'Input',
            defaultValue: 3,
          },
          {
            name: 'RAG_RELEVANCE_THRESHOLD',
            description: 'Sets the relevance threshold to consider for documents when used with reranking.',
            type: 'Input',
            defaultValue: 0.0,
          },
          {
            name: 'RAG_TEMPLATE',
            description: 'Template to use when injecting RAG documents into chat completion',
            type: 'Input',
          },
          {
            name: 'RAG_TEXT_SPLITTER',
            description: 'Sets the text splitter for RAG models.',
            type: 'DropDown',
            values: ['character', 'token'],
            defaultValue: 'character',
          },
          {
            name: 'TIKTOKEN_CACHE_DIR',
            description: 'Sets the directory for TikiToken cache.',
            type: 'Input',
            defaultValue: '{CACHE_DIR}/tiktoken',
          },
          {
            name: 'TIKTOKEN_ENCODING_NAME',
            description: 'Sets the encoding name for TikiToken.',
            type: 'Input',
            defaultValue: 'cl100k_base',
          },
          {
            name: 'CHUNK_SIZE',
            description: 'Sets the document chunk size for embeddings.',
            type: 'Input',
            defaultValue: 1000,
          },
          {
            name: 'CHUNK_OVERLAP',
            description: 'Specifies how much overlap there should be between chunks.',
            type: 'Input',
            defaultValue: 100,
          },
          {
            name: 'PDF_EXTRACT_IMAGES',
            description: 'Extracts images from PDFs using OCR when loading documents.',
            type: 'CheckBox',
          },
          {
            name: 'RAG_FILE_MAX_SIZE',
            description: 'Sets the maximum size of a file that can be uploaded for document ingestion.',
            type: 'Input',
          },
          {
            name: 'RAG_FILE_MAX_COUNT',
            description: 'Sets the maximum number of files that can be uploaded at once for document ingestion.',
            type: 'Input',
          },
          {
            name: 'RAG_RERANKING_MODEL',
            description: 'Sets a model for reranking results. Locally, a Sentence-Transformer model is used.',
            type: 'Input',
          },
          {
            name: 'RAG_OPENAI_API_BASE_URL',
            description: 'Sets the OpenAI base API URL to use for RAG embeddings.',
            type: 'Input',
            defaultValue: '${OPENAI_API_BASE_URL}',
          },
          {
            name: 'RAG_OPENAI_API_KEY',
            description: 'Sets the OpenAI API key to use for RAG embeddings.',
            type: 'Input',
            defaultValue: '${OPENAI_API_KEY}',
          },
          {
            name: 'RAG_EMBEDDING_OPENAI_BATCH_SIZE',
            description: 'Sets the batch size for OpenAI embeddings.',
            type: 'Input',
            defaultValue: 1,
          },
          {
            name: 'RAG_EMBEDDING_BATCH_SIZE',
            description: 'Sets the batch size for embedding in RAG (Retrieval-Augmented Generator) models.',
            type: 'Input',
            defaultValue: 1,
          },
          {
            name: 'RAG_OLLAMA_API_KEY',
            description: 'Sets the API key for Ollama API used in RAG models.',
            type: 'Input',
          },
          {
            name: 'RAG_OLLAMA_BASE_URL',
            description: 'Sets the base URL for Ollama API used in RAG models.',
            type: 'Input',
          },
          {
            name: 'ENABLE_RETRIEVAL_QUERY_GENERATION',
            description: 'Enables or disables retrieval query generation.',
            type: 'CheckBox',
          },
          {
            name: 'QUERY_GENERATION_PROMPT_TEMPLATE',
            description: 'Sets the prompt template for query generation.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'Apache Tika',
        items: [
          {
            name: 'TIKA_SERVER_URL',
            description: 'Sets the URL for the Apache Tika server.',
            type: 'Input',
            defaultValue: 'http://localhost:9998',
          },
        ],
      },
      {
        section: 'ChromaDB',
        items: [
          {
            name: 'CHROMA_TENANT',
            description: 'Sets the tenant for ChromaDB to use for RAG embeddings.',
            type: 'Input',
          },
          {
            name: 'CHROMA_DATABASE',
            description: 'Sets the database in the ChromaDB tenant to use for RAG embeddings.',
            type: 'Input',
          },
          {
            name: 'CHROMA_HTTP_HOST',
            description:
              'Specifies the hostname of a remote ChromaDB Server. Uses a local ChromaDB instance if not set.',
            type: 'Input',
          },
          {
            name: 'CHROMA_HTTP_PORT',
            description: 'Specifies the port of a remote ChromaDB Server.',
            type: 'Input',
            defaultValue: 8000,
          },
          {
            name: 'CHROMA_HTTP_HEADERS',
            description: 'Comma-separated list of HTTP headers to include with every ChromaDB request.',
            type: 'Input',
          },
          {
            name: 'CHROMA_HTTP_SSL',
            description: 'Controls whether or not SSL is used for ChromaDB Server connections.',
            type: 'CheckBox',
          },
          {
            name: 'CHROMA_CLIENT_AUTH_PROVIDER',
            description: 'Specifies auth provider for remote ChromaDB Server.',
            type: 'Input',
          },
          {
            name: 'CHROMA_CLIENT_AUTH_CREDENTIALS',
            description: 'Specifies auth credentials for remote ChromaDB Server.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'Google Drive',
        items: [
          {
            name: 'ENABLE_GOOGLE_DRIVE_INTEGRATION',
            description:
              'Enables or disables Google Drive integration. If set to true, and' +
              ' GOOGLE_DRIVE_CLIENT_ID & GOOGLE_DRIVE_API_KEY are both configured,' +
              ' Google Drive will appear as an upload option in the chat UI.',
            type: 'CheckBox',
          },
          {
            name: 'GOOGLE_DRIVE_CLIENT_ID',
            description:
              'Sets the client ID for Google Drive (client must be configured with Drive API and Picker API enabled).',
            type: 'Input',
          },
          {
            name: 'GOOGLE_DRIVE_API_KEY',
            description: 'Sets the API key for Google Drive integration.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'Milvus',
        items: [
          {
            name: 'MILVUS_URI',
            description:
              'Specifies the URI for connecting to the Milvus vector database.' +
              ' This can point to a local or remote Milvus server based on the deployment configuration.',
            type: 'Input',
            defaultValue: '${DATA_DIR}/vector_db/milvus.db',
          },
        ],
      },
      {
        section: 'OpenSearch',
        items: [
          {
            name: 'OPENSEARCH_CERT_VERIFY',
            description: 'Enables or disables OpenSearch certificate verification.',
            type: 'CheckBox',
          },
          {
            name: 'OPENSEARCH_PASSWORD',
            description: 'Sets the password for OpenSearch.',
            type: 'Input',
          },
          {
            name: 'OPENSEARCH_SSL',
            description: 'Enables or disables SSL for OpenSearch.',
            type: 'CheckBox',
          },
          {
            name: 'OPENSEARCH_URI',
            description: 'Sets the URI for OpenSearch.',
            type: 'Input',
            defaultValue: 'https://localhost:9200',
          },
          {
            name: 'OPENSEARCH_USERNAME',
            description: 'Sets the username for OpenSearch.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'PGVector',
        items: [
          {
            name: 'PGVECTOR_DB_URL',
            description: 'Sets the database URL for model storage.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'Qdrant',
        items: [
          {
            name: 'QDRANT_API_KEY',
            description: 'Sets the API key for Qdrant.',
            type: 'Input',
          },
          {
            name: 'QDRANT_URI',
            description: 'Sets the URI for Qdrant.',
            type: 'Input',
          },
        ],
      },
    ],
  },
  {
    category: 'Web Search',
    sections: [
      {
        section: 'Web Search',
        items: [
          {
            name: 'ENABLE_RAG_WEB_SEARCH',
            description: 'Enable web search toggle',
            type: 'CheckBox',
          },
          {
            name: 'ENABLE_SEARCH_QUERY_GENERATION',
            description: 'Enables or disables search query generation.',
            type: 'CheckBox',
          },
          {
            name: 'RAG_WEB_SEARCH_RESULT_COUNT',
            description: 'Maximum number of search results to crawl.',
            type: 'Input',
            defaultValue: 3,
          },
          {
            name: 'RAG_WEB_SEARCH_CONCURRENT_REQUESTS',
            description: 'Number of concurrent requests to crawl web pages returned from search results.',
            type: 'Input',
            defaultValue: 10,
          },
          {
            name: 'RAG_WEB_SEARCH_ENGINE',
            description: 'Options for search engines',
            type: 'DropDown',
            values: [
              'searxng',
              'google_pse',
              'brave',
              'kagi',
              'mojeek',
              'serpstack',
              'serper',
              'serply',
              'searchapi',
              'duckduckgo',
              'tavily',
              'jina',
              'bing',
            ],
          },
          {
            name: 'SEARXNG_QUERY_URL',
            description:
              'The SearXNG search API URL supporting JSON output. <query> is replaced' +
              ' with the search query. Example: http://searxng.local/search?q=<query>',
            type: 'Input',
          },
          {
            name: 'GOOGLE_PSE_API_KEY',
            description: 'Sets the API key for the Google Programmable Search Engine (PSE) service.',
            type: 'Input',
          },
          {
            name: 'GOOGLE_PSE_ENGINE_ID',
            description: 'The engine ID for the Google Programmable Search Engine (PSE) service.',
            type: 'Input',
          },
          {
            name: 'BRAVE_SEARCH_API_KEY',
            description: 'Sets the API key for the Brave Search API.',
            type: 'Input',
          },
          {
            name: 'KAGI_SEARCH_API_KEY',
            description: 'Sets the API key for Kagi Search API.',
            type: 'Input',
          },
          {
            name: 'MOJEEK_SEARCH_API_KEY',
            description: 'Sets the API key for Mojeek Search API.',
            type: 'Input',
          },
          {
            name: 'SERPSTACK_API_KEY',
            description: 'Sets the API key for Serpstack search API.',
            type: 'Input',
          },
          {
            name: 'SERPSTACK_HTTPS',
            description:
              'Configures the use of HTTPS for Serpstack requests. Free tier requests are restricted to HTTP only.',
            type: 'CheckBox',
          },
          {
            name: 'SERPER_API_KEY',
            description: 'Sets the API key for Serper search API.',
            type: 'Input',
          },
          {
            name: 'SERPLY_API_KEY',
            description: 'Sets the API key for Serply search API.',
            type: 'Input',
          },
          {
            name: 'SEARCHAPI_API_KEY',
            description: 'Sets the API key for SearchAPI.',
            type: 'Input',
          },
          {
            name: 'SEARCHAPI_ENGINE',
            description: 'Sets the SearchAPI engine.',
            type: 'Input',
          },
          {
            name: 'TAVILY_API_KEY',
            description: 'Sets the API key for Tavily search API.',
            type: 'Input',
          },
          {
            name: 'JINA_API_KEY',
            description: 'Sets the API key for Jina.',
            type: 'Input',
          },
          {
            name: 'BING_SEARCH_V7_ENDPOINT',
            description: 'Sets the endpoint for Bing Search API.',
            type: 'Input',
          },
          {
            name: 'BING_SEARCH_V7_SUBSCRIPTION_KEY',
            description: 'Sets the subscription key for Bing Search API.',
            type: 'Input',
            defaultValue: 'https://api.bing.microsoft.com/v7.0/search',
          },
        ],
      },
      {
        section: 'YouTube Loader',
        items: [
          {
            name: 'YOUTUBE_LOADER_PROXY_URL',
            description: 'Sets the proxy URL for YouTube loader.',
            type: 'Input',
          },
          {
            name: 'YOUTUBE_LOADER_LANGUAGE',
            description: 'Sets the language to use for YouTube video loading.',
            type: 'Input',
            defaultValue: 'en',
          },
        ],
      },
    ],
  },
  {
    category: 'Audio',
    sections: [
      {
        section: 'Whisper Speech-to-Text (Local)',
        items: [
          {
            name: 'WHISPER_MODEL',
            description:
              'Sets the Whisper model to use for Speech-to-Text. The backend used is faster_whisper with quantization to int8.',
            type: 'Input',
            defaultValue: 'base',
          },
          {
            name: 'WHISPER_MODEL_DIR',
            description: 'Specifies the directory to store Whisper model files.',
            type: 'Input',
            defaultValue: '${DATA_DIR}/cache/whisper/models',
          },
        ],
      },
      {
        section: 'Speech-to-Text (OpenAI)',
        items: [
          {
            name: 'AUDIO_STT_ENGINE',
            description: 'Specifies the Speech-to-Text engine to use.',
            type: 'DropDown',
            values: ['', 'openai'],
          },
          {
            name: 'AUDIO_STT_MODEL',
            description: 'Specifies the Speech-to-Text model to use for OpenAI-compatible endpoints.',
            type: 'Input',
            defaultValue: 'whisper-1',
          },
          {
            name: 'AUDIO_STT_OPENAI_API_BASE_URL',
            description: 'Sets the OpenAI-compatible base URL to use for Speech-to-Text.',
            type: 'Input',
            defaultValue: '${OPENAI_API_BASE_URL}',
          },
          {
            name: 'AUDIO_STT_OPENAI_API_KEY',
            description: 'Sets the OpenAI API key to use for Speech-to-Text.',
            type: 'Input',
            defaultValue: '${OPENAI_API_KEY}',
          },
        ],
      },
      {
        section: 'Text-to-Speech',
        items: [
          {
            name: 'AUDIO_TTS_API_KEY',
            description: 'Sets the API key for Text-to-Speech.',
            type: 'Input',
          },
          {
            name: 'AUDIO_TTS_ENGINE',
            description: 'Specifies the Text-to-Speech engine to use.',
            type: 'DropDown',
            values: ['', 'azure', 'elevenlabs', 'openai', 'transformers'],
          },
          {
            name: 'AUDIO_TTS_MODEL',
            description: 'Specifies the OpenAI text-to-speech model to use.',
            type: 'Input',
            defaultValue: 'tts-1',
          },
        ],
      },
      {
        section: 'Azure Text-to-Speech',
        items: [
          {
            name: 'AUDIO_TTS_AZURE_SPEECH_OUTPUT_FORMAT',
            description: 'Sets the output format for Azure Text to Speech.',
            type: 'Input',
          },
          {
            name: 'AUDIO_TTS_AZURE_SPEECH_REGION',
            description: 'Sets the region for Azure Text to Speech.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'OpenAI Text-to-Speech',
        items: [
          {
            name: 'AUDIO_TTS_OPENAI_API_BASE_URL',
            description: 'Sets the OpenAI-compatible base URL to use for text-to-speech.',
            type: 'Input',
            defaultValue: '${OPENAI_API_BASE_URL}',
          },
          {
            name: 'AUDIO_TTS_OPENAI_API_KEY',
            description: 'Sets the API key to use for text-to-speech.',
            type: 'Input',
            defaultValue: '${OPENAI_API_KEY}',
          },
          {
            name: 'AUDIO_TTS_SPLIT_ON',
            description: 'Sets the OpenAI text-to-speech split on to use.',
            type: 'Input',
            defaultValue: 'punctuation',
          },
          {
            name: 'AUDIO_TTS_VOICE',
            description: 'Sets the OpenAI text-to-speech voice to use.',
            type: 'Input',
            defaultValue: 'alloy',
          },
        ],
      },
    ],
  },
  {
    category: 'Image Generation',
    sections: [
      {
        section: 'Image Generation',
        items: [
          {
            name: 'ENABLE_IMAGE_GENERATION',
            description: 'Enables or disables image generation features.',
            type: 'CheckBox',
          },
          {
            name: 'IMAGE_GENERATION_ENGINE',
            description: 'Specifies the engine to use for image generation.',
            type: 'DropDown',
            values: ['openai', 'comfyui', 'automatic1111'],
            defaultValue: 'openai',
          },
          {
            name: 'IMAGE_GENERATION_MODEL',
            description: 'Default model to use for image generation',
            type: 'Input',
          },
          {
            name: 'IMAGE_SIZE',
            description: 'Sets the default image size to generate.',
            type: 'Input',
            defaultValue: '512x512',
          },
          {
            name: 'IMAGE_STEPS',
            description: 'Sets the default iteration steps for image generation. Used for ComfyUI and AUTOMATIC1111.',
            type: 'Input',
            defaultValue: 50,
          },
        ],
      },
      {
        section: 'AUTOMATIC1111',
        items: [
          {
            name: 'AUTOMATIC1111_API_AUTH',
            description: 'Sets the Automatic1111 API authentication.',
            type: 'Input',
          },
          {
            name: 'AUTOMATIC1111_BASE_URL',
            description: "Specifies the URL to Automatic1111's Stable Diffusion API.",
            type: 'Input',
          },
          {
            name: 'AUTOMATIC1111_CFG_SCALE',
            description: 'Sets the scale for Automatic1111 inference.',
            type: 'Input',
          },
          {
            name: 'AUTOMATIC1111_SAMPLER',
            description: 'Sets the sampler for Automatic1111 inference.',
            type: 'Input',
          },
          {
            name: 'AUTOMATIC1111_SCHEDULER',
            description: 'Sets the scheduler for Automatic1111 inference.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'ComfyUI',
        items: [
          {
            name: 'COMFYUI_BASE_URL',
            description: 'Specifies the URL to the ComfyUI image generation API.',
            type: 'Input',
          },
          {
            name: 'COMFYUI_API_KEY',
            description: 'Sets the API key for ComfyUI.',
            type: 'Input',
          },
          {
            name: 'COMFYUI_WORKFLOW',
            description: 'Sets the ComfyUI workflow.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'OpenAI DALL-E',
        items: [
          {
            name: 'IMAGES_OPENAI_API_BASE_URL',
            description: 'Sets the OpenAI-compatible base URL to use for DALL-E image generation.',
            type: 'Input',
            defaultValue: '${OPENAI_API_BASE_URL}',
          },
          {
            name: 'IMAGES_OPENAI_API_KEY',
            description: 'Sets the API key to use for DALL-E image generation.',
            type: 'Input',
            defaultValue: '${OPENAI_API_KEY}',
          },
        ],
      },
    ],
  },
  {
    category: 'OAuth',
    sections: [
      {
        section: 'OAuth',
        items: [
          {
            name: 'ENABLE_OAUTH_SIGNUP',
            description: 'Enables account creation when sighting up via OAuth. Distinct from ENABLE_SIGNUP.',
            type: 'CheckBox',
          },
          {
            name: 'ENABLE_API_KEY',
            description: 'Enables API key authentication.',
            type: 'CheckBox',
          },
          {
            name: 'ENABLE_OAUTH_ROLE_MANAGEMENT',
            description: 'Enables role management to oauth delegation.',
            type: 'CheckBox',
          },
          {
            name: 'ENABLE_OAUTH_GROUP_MANAGEMENT',
            description: 'Enables or disables OAUTH group management.',
            type: 'CheckBox',
          },
          {
            name: 'OAUTH_MERGE_ACCOUNTS_BY_EMAIL',
            description:
              'If enabled, merges OAuth accounts with existing accounts using the same email address.' +
              ' This is considered unsafe as not all OAuth providers will verify email addresses and' +
              ' can lead to potential account takeovers.',
            type: 'CheckBox',
          },
          {
            name: 'OAUTH_USERNAME_CLAIM',
            description: 'Set username claim for OpenID.',
            type: 'Input',
            defaultValue: 'name',
          },
          {
            name: 'OAUTH_EMAIL_CLAIM',
            description: 'Set email claim for OpenID.',
            type: 'Input',
            defaultValue: 'email',
          },
          {
            name: 'OAUTH_PICTURE_CLAIM',
            description: 'Set picture (avatar) claim for OpenID.',
            type: 'Input',
            defaultValue: 'picture',
          },
          {
            name: 'OAUTH_GROUP_CLAIM',
            description: 'Specifies the group claim for OAUTH authentication.',
            type: 'Input',
            defaultValue: 'groups',
          },
          {
            name: 'OAUTH_ROLES_CLAIM',
            description: 'Sets the roles claim to look for in the OIDC token.',
            type: 'Input',
            defaultValue: 'roles',
          },
          {
            name: 'OAUTH_SCOPES',
            description: 'Sets the scope for OIDC authentication. openid and email are required.',
            type: 'Input',
            defaultValue: 'openid email profile',
          },
          {
            name: 'OAUTH_ALLOWED_DOMAINS',
            description: 'Specifies the allowed domains for OAUTH authentication. (e.g. "example1.com,example2.com").',
            type: 'Input',
            defaultValue: '*',
          },
          {
            name: 'OAUTH_ALLOWED_ROLES',
            description: 'Sets the roles that are allowed access to the platform.',
            type: 'Input',
            defaultValue: 'user,admin',
          },
          {
            name: 'OAUTH_ADMIN_ROLES',
            description: 'Sets the roles that are considered administrators.',
            type: 'Input',
            defaultValue: 'admin',
          },
          {
            name: 'WEBUI_AUTH_TRUSTED_EMAIL_HEADER',
            description: 'Defines the trusted request header for authentication. See SSO docs.',
            type: 'Input',
          },
          {
            name: 'WEBUI_AUTH_TRUSTED_NAME_HEADER',
            description:
              'Defines the trusted request header for the username of anyone registering with' +
              ' the WEBUI_AUTH_TRUSTED_EMAIL_HEADER header. See SSO docs.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'Google',
        items: [
          {
            name: 'GOOGLE_CLIENT_ID',
            description: 'Sets the client ID for Google OAuth',
            type: 'Input',
          },
          {
            name: 'GOOGLE_CLIENT_SECRET',
            description: 'Sets the client secret for Google OAuth',
            type: 'Input',
          },
          {
            name: 'GOOGLE_OAUTH_SCOPE',
            description: 'Sets the scope for Google OAuth authentication.',
            type: 'Input',
            defaultValue: 'openid email profile',
          },
          {
            name: 'GOOGLE_REDIRECT_URI',
            description: 'Sets the redirect URI for Google OAuth',
            type: 'Input',
            defaultValue: '<backend>/oauth/google/callback',
          },
        ],
      },
      {
        section: 'Microsoft',
        items: [
          {
            name: 'MICROSOFT_CLIENT_ID',
            description: 'Sets the client ID for Microsoft OAuth',
            type: 'Input',
          },
          {
            name: 'MICROSOFT_CLIENT_SECRET',
            description: 'Sets the client secret for Microsoft OAuth',
            type: 'Input',
          },
          {
            name: 'MICROSOFT_CLIENT_TENANT_ID',
            description: 'Sets the tenant ID for Microsoft OAuth',
            type: 'Input',
          },
          {
            name: 'MICROSOFT_OAUTH_SCOPE',
            description: 'Sets the scope for Microsoft OAuth authentication.',
            type: 'Input',
            defaultValue: 'openid email profile',
          },
          {
            name: 'MICROSOFT_REDIRECT_URI',
            description: 'Sets the redirect URI for Microsoft OAuth',
            type: 'Input',
            defaultValue: '<backend>/oauth/microsoft/callback',
          },
        ],
      },
      {
        section: 'OpenID (OIDC)',
        items: [
          {
            name: 'OAUTH_CLIENT_ID',
            description: 'Sets the client ID for OIDC',
            type: 'Input',
          },
          {
            name: 'OAUTH_CLIENT_SECRET',
            description: 'Sets the client secret for OIDC',
            type: 'Input',
          },
          {
            name: 'OPENID_PROVIDER_URL',
            description: 'Path to the .well-known/openid-configuration endpoint',
            type: 'Input',
          },
          {
            name: 'OAUTH_PROVIDER_NAME',
            description: 'Sets the name for the OIDC provider.',
            type: 'Input',
            defaultValue: 'SSO',
          },
          {
            name: 'OPENID_REDIRECT_URI',
            description: 'Sets the redirect URI for OIDC',
            type: 'Input',
            defaultValue: '<backend>/oauth/oidc/callback',
          },
        ],
      },
    ],
  },
  {
    category: 'LDAP',
    items: [
      {
        name: 'ENABLE_LDAP',
        description: 'Enables or disables LDAP authentication.',
        type: 'CheckBox',
      },
      {
        name: 'LDAP_APP_DN',
        description: 'Sets the distinguished name for LDAP application.',
        type: 'Input',
      },
      {
        name: 'LDAP_APP_PASSWORD',
        description: 'Sets the password for LDAP application.',
        type: 'Input',
      },
      {
        name: 'LDAP_ATTRIBUTE_FOR_USERNAME',
        description: 'Sets the attribute to use as username for LDAP authentication.',
        type: 'Input',
      },
      {
        name: 'LDAP_CA_CERT_FILE',
        description: 'Sets the path to LDAP CA certificate file.',
        type: 'Input',
      },
      {
        name: 'LDAP_CIPHERS',
        description: 'Sets the ciphers to use for LDAP connection.',
        type: 'Input',
        defaultValue: 'ALL',
      },
      {
        name: 'LDAP_SEARCH_BASE',
        description: 'Sets the base to search for LDAP authentication.',
        type: 'Input',
      },
      {
        name: 'LDAP_SEARCH_FILTERS',
        description: 'Sets the filter to use for LDAP search.',
        type: 'Input',
      },
      {
        name: 'LDAP_SERVER_HOST',
        description: 'Sets the hostname of LDAP server.',
        type: 'Input',
        defaultValue: 'localhost',
      },
      {
        name: 'LDAP_SERVER_LABEL',
        description: 'Sets the label of LDAP server.',
        type: 'Input',
      },
      {
        name: 'LDAP_SERVER_PORT',
        description: 'Sets the port number of LDAP server.',
        type: 'Input',
        defaultValue: 389,
      },
      {
        name: 'LDAP_USE_TLS',
        description: 'Enables or disables TLS for LDAP connection.',
        type: 'CheckBox',
      },
    ],
  },
  {
    category: 'Workspace Permissions',
    items: [
      {
        name: 'USER_PERMISSIONS_WORKSPACE_MODELS_ACCESS',
        description: 'Enables or disables user permission to access workspace models.',
        type: 'CheckBox',
      },
      {
        name: 'USER_PERMISSIONS_WORKSPACE_KNOWLEDGE_ACCESS',
        description: 'Enables or disables user permission to access workspace knowledge.',
        type: 'CheckBox',
      },
      {
        name: 'USER_PERMISSIONS_WORKSPACE_PROMPTS_ACCESS',
        description: 'Enables or disables user permission to access workspace prompts.',
        type: 'CheckBox',
      },
      {
        name: 'USER_PERMISSIONS_WORKSPACE_TOOLS_ACCESS',
        description: 'Enables or disables user permission to access workspace tools.',
        type: 'CheckBox',
      },
    ],
  },
  {
    category: 'Chat Permissions',
    items: [
      {
        name: 'USER_PERMISSIONS_CHAT_FILE_UPLOAD',
        description: 'Enables or disables user permission to upload files to chats.',
        type: 'CheckBox',
      },
      {
        name: 'USER_PERMISSIONS_CHAT_DELETE',
        description: 'Enables or disables user permission to delete chats.',
        type: 'CheckBox',
      },
      {
        name: 'USER_PERMISSIONS_CHAT_EDIT',
        description: 'Enables or disables user permission to edit chats.',
        type: 'CheckBox',
      },
      {
        name: 'USER_PERMISSIONS_CHAT_TEMPORARY',
        description: 'Enables or disables user permission to create temporary chats.',
        type: 'CheckBox',
      },
    ],
  },
  {
    category: 'Misc Environment Variables',
    sections: [
      {
        section: 'Amazon S3 Storage',
        items: [
          {
            name: 'STORAGE_PROVIDER',
            description: 'Sets the storage provider.',
            type: 'Input',
          },
          {
            name: 'S3_ACCESS_KEY_ID',
            description: 'Sets the access key ID for S3 storage.',
            type: 'Input',
          },
          {
            name: 'S3_BUCKET_NAME',
            description: 'Sets the bucket name for S3 storage.',
            type: 'Input',
          },
          {
            name: 'S3_ENDPOINT_URL',
            description: 'Sets the endpoint URL for S3 storage.',
            type: 'Input',
          },
          {
            name: 'S3_REGION_NAME',
            description: 'Sets the region name for S3 storage.',
            type: 'Input',
          },
          {
            name: 'S3_SECRET_ACCESS_KEY',
            description: 'Sets the secret access key for S3 storage.',
            type: 'Input',
          },
        ],
      },
      {
        section: 'Database Pool',
        items: [
          {
            name: 'DATABASE_URL',
            description: 'Specifies the database URL to connect to.',
            type: 'Input',
            defaultValue: 'sqlite:///${DATA_DIR}/webui.db',
          },
          {
            name: 'DATABASE_POOL_SIZE',
            description: 'Specifies the size of the database pool. A value of 0 disables pooling.',
            type: 'Input',
            defaultValue: 0,
          },
          {
            name: 'DATABASE_POOL_MAX_OVERFLOW',
            description: 'Specifies the database pool max overflow.',
            type: 'Input',
            defaultValue: 0,
          },
          {
            name: 'DATABASE_POOL_TIMEOUT',
            description: 'Specifies the database pool timeout in seconds to get a connection.',
            type: 'Input',
            defaultValue: 30,
          },
          {
            name: 'DATABASE_POOL_RECYCLE',
            description: 'Specifies the database pool recycle time in seconds.',
            type: 'Input',
            defaultValue: 3600,
          },
        ],
      },
      {
        section: 'Redis',
        items: [
          {
            name: 'ENABLE_WEBSOCKET_SUPPORT',
            description: 'Enables websocket support in Open WebUI (used with Redis).',
            type: 'CheckBox',
          },
          {
            name: 'WEBSOCKET_MANAGER',
            description: 'Specifies the websocket manager to use (in this case, Redis).',
            type: 'Input',
            defaultValue: 'redis',
          },
          {
            name: 'WEBSOCKET_REDIS_URL',
            description: 'Specifies the URL of the Redis instance for websocket communication.',
            type: 'Input',
            defaultValue: 'redis://localhost:6379/0',
          },
        ],
      },
      {
        section: 'Proxy Settings',
        items: [
          {
            name: 'http_proxy',
            description: 'Sets the URL for the HTTP proxy.',
            type: 'Input',
          },
          {
            name: 'https_proxy',
            description: 'Sets the URL for the HTTPS proxy.',
            type: 'Input',
          },
          {
            name: 'no_proxy',
            description:
              'Lists domain extensions (or IP addresses) for which the proxy should not be used,' +
              " separated by commas. For example, setting no_proxy to '.mit.edu' ensures that the" +
              ' proxy is bypassed when accessing documents from MIT.',
            type: 'Input',
          },
        ],
      },
    ],
  },
];

export default openArguments;
