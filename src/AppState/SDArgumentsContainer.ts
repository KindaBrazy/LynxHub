/* eslint-disable max-len */

import {SDArgSetting, SDSettingType} from './InterfaceAndTypes';

/* Settings and configurations for launching stable diffusion. */

interface EnvironmentVariables {
  [key: string]: SDArgSetting;

  PYTHON: SDArgSetting;
  GIT: SDArgSetting;
  VENV_DIR: SDArgSetting;
  COMMANDLINE_ARGS: SDArgSetting;
  IGNORE_CMD_ARGS_ERRORS: SDArgSetting;
  REQS_FILE: SDArgSetting;
  TORCH_COMMAND: SDArgSetting;
  INDEX_URL: SDArgSetting;
  TRANSFORMERS_CACHE: SDArgSetting;
  CUDA_VISIBLE_DEVICES: SDArgSetting;
  SD_WEBUI_LOG_LEVEL: SDArgSetting;
  SD_WEBUI_CACHE_FILE: SDArgSetting;
}

interface Sda1CommandLines {
  [key: string]: {[key: string]: SDArgSetting};

  Configuration: {
    [key: string]: SDArgSetting;

    Help: SDArgSetting;
    Exit: SDArgSetting;
    Config: SDArgSetting;
    Ckpt: SDArgSetting;
    CkptDir: SDArgSetting;
    NoDownloadSDModel: SDArgSetting;
    VAEDir: SDArgSetting;
    GFPganDir: SDArgSetting;
    CodeformerModelsPath: SDArgSetting;
    GFPGANModelsPath: SDArgSetting;
    ESRGANModelsPath: SDArgSetting;
    BSRGANModelsPath: SDArgSetting;
    RealESRGANModelsPath: SDArgSetting;
    ScuNETModelsPath: SDArgSetting;
    SwinIRModelsPath: SDArgSetting;
    LDSRModelsPath: SDArgSetting;
    LoraDir: SDArgSetting;
    CLIPModelsPath: SDArgSetting;
    EmbeddingsDir: SDArgSetting;
    TextualInversionTemplatesDir: SDArgSetting;
    HypernetworkDir: SDArgSetting;
    LocalizationsDir: SDArgSetting;
    StylesFile: SDArgSetting;
    UIConfigFile: SDArgSetting;
    NoProgressBarHiding: SDArgSetting;
    MaxBatchCount: SDArgSetting;
    UISettingsFile: SDArgSetting;
    AllowCode: SDArgSetting;
    Share: SDArgSetting;
    Listen: SDArgSetting;
    Port: SDArgSetting;
    HideUIDirConfig: SDArgSetting;
    FreezeSettings: SDArgSetting;
    EnableInsecureExtensionAccess: SDArgSetting;
    GradioDebug: SDArgSetting;
    GradioAuth: SDArgSetting;
    GradioAuthPath: SDArgSetting;
    DisableConsoleProgressbars: SDArgSetting;
    EnableConsolePrompts: SDArgSetting;
    API: SDArgSetting;
    APIAuth: SDArgSetting;
    APILog: SDArgSetting;
    NoWebUI: SDArgSetting;
    UIDebugMode: SDArgSetting;
    DeviceID: SDArgSetting;
    Administrator: SDArgSetting;
    CORSAllowOrigins: SDArgSetting;
    CORSAllowOriginsRegex: SDArgSetting;
    DisableTLSVerify: SDArgSetting;
    ServerName: SDArgSetting;
    NoGradioQueue: SDArgSetting;
    GradioAllowedPath: SDArgSetting;
    NoHashing: SDArgSetting;
    SkipVersionCheck: SDArgSetting;
    SkipPythonVersionCheck: SDArgSetting;
    SkipTorchCudaTest: SDArgSetting;
    SkipInstall: SDArgSetting;
  };

  Performance: {
    [key: string]: SDArgSetting;

    XFormers: SDArgSetting;
    ForceEnableXFormers: SDArgSetting;
    XFormersFlashAttention: SDArgSetting;
    OptSDPAttention: SDArgSetting;
    OptSDPNoMemAttention: SDArgSetting;
    OptSplitAttention: SDArgSetting;
    OptSplitAttentionInvokeAI: SDArgSetting;
    OptSplitAttentionV1: SDArgSetting;
    OptSubQuadAttention: SDArgSetting;
    SubQuadQChunkSize: SDArgSetting;
    SubQuadKVChunkSize: SDArgSetting;
    SubQuadChunkThreshold: SDArgSetting;
    OptChannelsLast: SDArgSetting;
    DisableOptSplitAttention: SDArgSetting;
    DisableNanCheck: SDArgSetting;
    UseCPU: SDArgSetting;
    NoHalf: SDArgSetting;
    Precision: SDArgSetting;
    NoHalfVAE: SDArgSetting;
    UpcastSampling: SDArgSetting;
    MedVRAM: SDArgSetting;
    LowVRAM: SDArgSetting;
    LowRAM: SDArgSetting;
    AlwaysBatchCondUncond: SDArgSetting;
  };
  Features: {
    [key: string]: SDArgSetting;

    AutoLaunch: SDArgSetting;
    Theme: SDArgSetting;
    UseTextboxSeed: SDArgSetting;
    DisableSafeUnpickle: SDArgSetting;
    Ngrok: SDArgSetting;
    NgrokRegion: SDArgSetting;
    UpdateCheck: SDArgSetting;
    UpdateAllExtensions: SDArgSetting;
    ReinstallXFormers: SDArgSetting;
    ReinstallTorch: SDArgSetting;
    Tests: SDArgSetting;
    NoTests: SDArgSetting;
  };
}

export const environmentVariables: EnvironmentVariables = {
  PYTHON: {
    Name: 'PYTHON',
    Type: SDSettingType.ChooseFile,
    Default: '',
    Description: 'Sets a custom path for Python executable. ',
  },
  GIT: {
    Name: 'GIT',
    Type: SDSettingType.InputBox,
    Default: '',
    Description: 'Not provided.',
  },
  VENV_DIR: {
    Name: 'VENV_DIR',
    Type: SDSettingType.ChooseDirectory,
    Default: 'venv',
    Description:
      'Specifies the path for the virtual environment. Default is `venv`. Special value `-` runs the script without creating virtual environment.',
  },
  COMMANDLINE_ARGS: {
    Name: 'COMMANDLINE_ARGS',
    Type: SDSettingType.InputBox,
    Default: 'True',
    Description: 'Additional commandline arguments for the main program.',
  },
  // TODO: if checked set something to it
  IGNORE_CMD_ARGS_ERRORS: {
    Name: 'IGNORE_CMD_ARGS_ERRORS',
    Type: SDSettingType.CheckBox,
    Default: '',
    Description: 'Set to anything to make the program not exit with an error if an unexpected commandline argument is encountered.',
  },
  REQS_FILE: {
    Name: 'REQS_FILE',
    Type: SDSettingType.InputBox,
    Default: 'requirements_versions.txt',
    Description:
      'Name of `requirements.txt` file with dependencies that will be installed when `launch.py` is run. Defaults to `requirements_versions.txt`.',
  },
  TORCH_COMMAND: {
    Name: 'TORCH_COMMAND',
    Type: SDSettingType.InputBox,
    Default: '',
    Description: 'Command for installing PyTorch.',
  },
  INDEX_URL: {
    Name: 'INDEX_URL',
    Type: SDSettingType.InputBox,
    Default: '',
    Description: '`--index-url` parameter for pip.',
  },
  TRANSFORMERS_CACHE: {
    Name: 'TRANSFORMERS_CACHE',
    Type: SDSettingType.ChooseDirectory,
    Default: '',
    Description: 'Path to where transformers library will download and keep its files related to the CLIP model.',
  },
  CUDA_VISIBLE_DEVICES: {
    Name: 'CUDA_VISIBLE_DEVICES',
    Type: SDSettingType.InputBox,
    Default: '',
    Description: 'Select GPU to use for your instance on a system with multiple GPUs. For example, if you want to use secondary GPU, put "1".',
  },
  SD_WEBUI_LOG_LEVEL: {
    Name: 'SD_WEBUI_LOG_LEVEL',
    Type: SDSettingType.DropDown,
    Values: {
      NOTSET: 'NOTSET',
      DEBUG: 'DEBUG',
      INFO: 'INFO',
      WARN: 'WARN',
      ERROR: 'ERROR',
      CRITICAL: 'CRITICAL',
    },
    Default: 'INFO',
    Description: "Log verbosity. Supports any valid logging level supported by Python's built-in `logging` module. Defaults to `INFO` if not set.",
  },
  SD_WEBUI_CACHE_FILE: {
    Name: 'SD_WEBUI_CACHE_FILE',
    Type: SDSettingType.ChooseFile,
    Default: 'cache.json',
    Description: 'Cache file path. Defaults to `cache.json` in the root directory if not set.',
  },
};

export const sda1CommandLines: Sda1CommandLines = {
  Configuration: {
    Help: {
      Name: '--help',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Show help message and exit.',
    },

    Exit: {
      Name: '--exit',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Terminate after installation.',
    },

    Config: {
      Name: '--config',
      Type: SDSettingType.ChooseFile,
      Default: 'configs/stable-diffusion/v1-inference.yaml',
      Description: 'Path to config which constructs model.',
    },

    Ckpt: {
      Name: '--ckpt',
      Type: SDSettingType.ChooseFile,
      Default: 'model.ckpt',
      Description: 'Path to checkpoint of Stable Diffusion model, if specified, this checkpoint will be added to the list of checkpoints and loaded.',
    },

    CkptDir: {
      Name: '--ckpt-dir',
      Type: SDSettingType.ChooseDirectory,
      Default: '',
      Description: 'Path to directory with Stable Diffusion checkpoints.',
    },

    NoDownloadSDModel: {
      Name: '--no-download-sd-model',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: "Don't download model even if no model is found.",
    },

    VAEDir: {
      Name: '--vae-dir',
      Type: SDSettingType.ChooseDirectory,
      Default: '',
      Description: 'Path to Variational AutoEncoders model.',
    },

    GFPganDir: {
      Name: '--gfpgan-dir',
      Type: SDSettingType.ChooseDirectory,
      Default: 'GFPGAN/',
      Description: 'GFPGAN directory.',
    },

    CodeformerModelsPath: {
      Name: '--codeformer-models-path',
      Type: SDSettingType.ChooseDirectory,
      Default: 'models/Codeformer/',
      Description: 'Path to directory with codeformer model file(s).',
    },

    GFPGANModelsPath: {
      Name: '--gfpgan-models-path',
      Type: SDSettingType.ChooseDirectory,
      Default: 'models/GFPGAN',
      Description: 'Path to directory with GFPGAN model file(s).',
    },

    ESRGANModelsPath: {
      Name: '--esrgan-models-path',
      Type: SDSettingType.ChooseDirectory,
      Default: 'models/ESRGAN',
      Description: 'Path to directory with ESRGAN model file(s).',
    },

    BSRGANModelsPath: {
      Name: '--bsrgan-models-path',
      Type: SDSettingType.ChooseDirectory,
      Default: 'models/BSRGAN',
      Description: 'Path to directory with BSRGAN model file(s).',
    },

    RealESRGANModelsPath: {
      Name: '--realesrgan-models-path',
      Type: SDSettingType.ChooseDirectory,
      Default: 'models/RealESRGAN',
      Description: 'Path to directory with RealESRGAN model file(s).',
    },

    ScuNETModelsPath: {
      Name: '--scunet-models-path',
      Type: SDSettingType.ChooseDirectory,
      Default: 'models/ScuNET',
      Description: 'Path to directory with ScuNET model file(s).',
    },

    SwinIRModelsPath: {
      Name: '--swinir-models-path',
      Type: SDSettingType.ChooseDirectory,
      Default: 'models/SwinIR',
      Description: 'Path to directory with SwinIR and SwinIR v2 model file(s).',
    },

    LDSRModelsPath: {
      Name: '--ldsr-models-path',
      Type: SDSettingType.ChooseDirectory,
      Default: 'models/LDSR',
      Description: 'Path to directory with LDSR model file(s).',
    },

    LoraDir: {
      Name: '--lora-dir',
      Type: SDSettingType.ChooseDirectory,
      Default: 'models/Lora',
      Description: 'Path to directory with Lora networks.',
    },

    CLIPModelsPath: {
      Name: '--clip-models-path',
      Type: SDSettingType.ChooseDirectory,
      Default: 'None',
      Description: 'Path to directory with CLIP model file(s).',
    },

    EmbeddingsDir: {
      Name: '--embeddings-dir',
      Type: SDSettingType.ChooseDirectory,
      Default: 'embeddings/',
      Description: 'Embeddings directory for textual inversion (default: embeddings).',
    },

    TextualInversionTemplatesDir: {
      Name: '--textual-inversion-templates-dir',
      Type: SDSettingType.ChooseDirectory,
      Default: 'textual_inversion_templates',
      Description: 'Directory with textual inversion templates.',
    },

    HypernetworkDir: {
      Name: '--hypernetwork-dir',
      Type: SDSettingType.ChooseDirectory,
      Default: 'models/hypernetworks/',
      Description: 'Hypernetwork directory.',
    },

    LocalizationsDir: {
      Name: '--localizations-dir',
      Type: SDSettingType.ChooseDirectory,
      Default: 'localizations/',
      Description: 'Localizations directory.',
    },

    StylesFile: {
      Name: '--styles-file',
      Type: SDSettingType.ChooseFile,
      Default: 'styles.csv',
      Description: 'Filename to use for styles.',
    },

    UIConfigFile: {
      Name: '--ui-config-file',
      Type: SDSettingType.ChooseFile,
      Default: 'ui-config.json',
      Description: 'Filename to use for UI configuration.',
    },

    NoProgressBarHiding: {
      Name: '--no-progressbar-hiding',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Do not hide progress bar in gradio UI (we hide it because it slows down ML if you have hardware acceleration in browser).',
    },

    MaxBatchCount: {
      Name: '--max-batch-count',
      Type: SDSettingType.InputBox,
      Default: '16',
      Description: 'Maximum batch count value for the UI.',
    },

    UISettingsFile: {
      Name: '--ui-settings-file',
      Type: SDSettingType.ChooseFile,
      Default: 'config.json',
      Description: 'Filename to use for UI settings.',
    },

    AllowCode: {
      Name: '--allow-code',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Allow custom script execution from web UI.',
    },

    Share: {
      Name: '--share',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Use `share:True` for gradio and make the UI accessible through their site.',
    },

    Listen: {
      Name: '--listen',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Launch gradio with 0.0.0.0 as server name, allowing to respond to network requests.',
    },

    Port: {
      Name: '--port',
      Type: SDSettingType.InputBox,
      Default: '7860',
      Description: 'Launch gradio with given server port, you need root/admin rights for ports < 1024, defaults to 7860 if available.',
    },

    HideUIDirConfig: {
      Name: '--hide-ui-dir-config',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Hide directory configuration from web UI.',
    },

    FreezeSettings: {
      Name: '--freeze-settings',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Disable editing settings.',
    },

    EnableInsecureExtensionAccess: {
      Name: '--enable-insecure-extension-access',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Enable extensions tab regardless of other options.',
    },

    GradioDebug: {
      Name: '--gradio-debug',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Launch gradio with `--debug` option.',
    },

    GradioAuth: {
      Name: '--gradio-auth',
      Type: SDSettingType.InputBox,
      Default: 'None',
      Description: 'Set gradio authentication like `username:password`, or comma-delimit multiple like `u1:p1,u2:p2,u3:p3`.',
    },

    GradioAuthPath: {
      Name: '--gradio-auth-path',
      Type: SDSettingType.ChooseFile,
      Default: 'None',
      Description: 'Set gradio authentication file path ex. `/path/to/auth/file` same auth format as `--gradio-auth`.',
    },

    DisableConsoleProgressbars: {
      Name: '--disable-console-progressbars',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Do not output progress bars to console.',
    },

    EnableConsolePrompts: {
      Name: '--enable-console-prompts',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Print prompts to console when generating with txt2img and img2img.',
    },

    API: {
      Name: '--api',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Launch web UI with API.',
    },

    APIAuth: {
      Name: '--api-auth',
      Type: SDSettingType.InputBox,
      Default: 'None',
      Description: 'Set authentication for API like `username:password`, or comma-delimit multiple like `u1:p1,u2:p2,u3:p3`.',
    },

    APILog: {
      Name: '--api-log',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Enable logging of all API requests.',
    },

    NoWebUI: {
      Name: '--nowebui',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Only launch the API, without the UI.',
    },

    UIDebugMode: {
      Name: '--ui-debug-mode',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: "Don't load model to quickly launch UI.",
    },

    DeviceID: {
      Name: '--device-id',
      Type: SDSettingType.InputBox,
      Default: 'None',
      Description: 'Select the default CUDA device to use (export `CUDA_VISIBLE_DEVICES:0,1` etc might be needed before).',
    },

    Administrator: {
      Name: '--administrator',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Administrator privileges.',
    },

    CORSAllowOrigins: {
      Name: '--cors-allow-origins',
      Type: SDSettingType.InputBox,
      Default: 'None',
      Description: 'Allowed CORS origin(s) in the form of a comma-separated list (no spaces).',
    },

    CORSAllowOriginsRegex: {
      Name: '--cors-allow-origins-regex',
      Type: SDSettingType.InputBox,
      Default: 'None',
      Description: 'Allowed CORS origin(s) in the form of a single regular expression.',
    },

    DisableTLSVerify: {
      Name: '--disable-tls-verify',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'When passed, enables the use of self-signed certificates.',
    },

    ServerName: {
      Name: '--server-name',
      Type: SDSettingType.InputBox,
      Default: 'None',
      Description: 'Sets hostname of server.',
    },

    NoGradioQueue: {
      Name: '--no-gradio-queue',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Disables gradio queue, causes the webpage to use http requests instead of websockets, was the default in earlier versions.',
    },

    GradioAllowedPath: {
      Name: '--gradio-allowed-path',
      Type: SDSettingType.ChooseDirectory,
      Default: 'None',
      Description: "Add path to Gradio's `allowed_paths`, make it possible to serve files from it.",
    },

    NoHashing: {
      Name: '--no-hashing',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Disable SHA-256 hashing of checkpoints to help loading performance.',
    },

    SkipVersionCheck: {
      Name: '--skip-version-check',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Do not check versions of torch and transformers.',
    },

    SkipPythonVersionCheck: {
      Name: '--skip-python-version-check',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Do not check versions of Python.',
    },

    SkipTorchCudaTest: {
      Name: '--skip-torch-cuda-test',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Do not check if CUDA is able to work properly.',
    },

    SkipInstall: {
      Name: '--skip-install',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Skip installation of packages.',
    },
  },
  Performance: {
    XFormers: {
      Name: '--xformers',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Enable xformers for cross attention layers.',
    },

    ForceEnableXFormers: {
      Name: '--force-enable-xformers',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description:
        'Enable xformers for cross attention layers regardless of whether the checking code thinks you can run it, ***do not make bug reports if this fails to work***.',
    },

    XFormersFlashAttention: {
      Name: '--xformers-flash-attention',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Enable xformers with Flash Attention to improve reproducibility (supported for SD2.x or variant only).',
    },

    OptSDPAttention: {
      Name: '--opt-sdp-attention',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Enable scaled dot product cross-attention layer optimization, requires PyTorch 2.*',
    },

    OptSDPNoMemAttention: {
      Name: '--opt-sdp-no-mem-attention',
      Type: SDSettingType.CheckBox,
      Default: 'None',
      Description:
        'Enable scaled dot product cross-attention layer optimization without memory efficient attention, makes image generation deterministic, requires PyTorch 2.*',
    },

    OptSplitAttention: {
      Name: '--opt-split-attention',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: "Force-enables Doggettx's cross-attention layer optimization. By default, it's on for CUDA-enabled systems.",
    },

    OptSplitAttentionInvokeAI: {
      Name: '--opt-split-attention-invokeai',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: "Force-enables InvokeAI's cross-attention layer optimization. By default, it's on when CUDA is unavailable.",
    },

    OptSplitAttentionV1: {
      Name: '--opt-split-attention-v1',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Enable older version of split attention optimization that does not consume all VRAM available.',
    },

    OptSubQuadAttention: {
      Name: '--opt-sub-quad-attention',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Enable memory efficient sub-quadratic cross-attention layer optimization.',
    },

    SubQuadQChunkSize: {
      Name: '--sub-quad-q-chunk-size',
      Type: SDSettingType.InputBox,
      Default: '1024',
      Description: 'Query chunk size for the sub-quadratic cross-attention layer optimization to use.',
    },

    SubQuadKVChunkSize: {
      Name: '--sub-quad-kv-chunk-size',
      Type: SDSettingType.InputBox,
      Default: 'None',
      Description: 'KV chunk size for the sub-quadratic cross-attention layer optimization to use.',
    },

    SubQuadChunkThreshold: {
      Name: '--sub-quad-chunk-threshold',
      Type: SDSettingType.CheckBox,
      Default: 'None',
      Description: 'The percentage of VRAM threshold for the sub-quadratic cross-attention layer optimization to use chunking.',
    },

    OptChannelsLast: {
      Name: '--opt-channelslast',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description:
        'Enable alternative layout for 4d tensors, may result in faster inference **only** on Nvidia cards with Tensor cores (16xx and higher).',
    },

    DisableOptSplitAttention: {
      Name: '--disable-opt-split-attention',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Force-disables cross-attention layer optimization.',
    },

    DisableNanCheck: {
      Name: '--disable-nan-check',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Do not check if produced images/latent spaces have nans, useful for running without a checkpoint in CI.',
    },

    UseCPU: {
      Name: '--use-cpu',
      Type: SDSettingType.CheckBox,
      Default: 'None',
      Description: 'Use CPU as torch device for specified modules.',
    },

    NoHalf: {
      Name: '--no-half',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Do not switch the model to 16-bit floats.',
    },

    Precision: {
      Name: '--precision',
      Type: SDSettingType.DropDown,
      Default: 'autocast',
      Values: {
        Full: 'full',
        Autocast: 'autocast',
      },
      Description: 'Evaluate at this precision.',
    },

    NoHalfVAE: {
      Name: '--no-half-vae',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Do not switch the VAE model to 16-bit floats.',
    },

    UpcastSampling: {
      Name: '--upcast-sampling',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description:
        'Upcast sampling. No effect with `--no-half`. Usually produces similar results to `--no-half` with better performance while using less memory.',
    },

    MedVRAM: {
      Name: '--medvram',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Enable Stable Diffusion model optimizations for sacrificing some performance for low VRAM usage.',
    },

    LowVRAM: {
      Name: '--lowvram',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Enable Stable Diffusion model optimizations for sacrificing a lot of speed for very low VRAM usage.',
    },

    LowRAM: {
      Name: '--lowram',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Load Stable Diffusion checkpoint weights to VRAM instead of RAM.',
    },

    AlwaysBatchCondUncond: {
      Name: '--always-batch-cond-uncond',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Disables cond/uncond batching that is enabled to save memory with `--medvram` or `--lowvram`.',
    },
  },
  Features: {
    AutoLaunch: {
      Name: '--autolaunch',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: "Open the web UI URL in the system's default browser upon launch.",
    },

    Theme: {
      Name: '--theme',
      Type: SDSettingType.DropDown,
      Default: 'Unset',
      Values: {
        Light: 'light',
        Dark: 'dark',
      },
      Description: 'Open the web UI with the specified theme (`light` or `dark`). If not specified, uses the default browser theme.',
    },

    UseTextboxSeed: {
      Name: '--use-textbox-seed',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Use textbox for seeds in UI (no up/down, but possible to input long seeds).',
    },

    DisableSafeUnpickle: {
      Name: '--disable-safe-unpickle',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Disable checking PyTorch models for malicious code.',
    },

    Ngrok: {
      Name: '--ngrok',
      Type: SDSettingType.InputBox,
      Default: 'None',
      Description: 'ngrok authtoken, alternative to gradio `--share`.',
    },

    NgrokRegion: {
      Name: '--ngrok-region',
      Type: SDSettingType.InputBox,
      Default: 'us',
      Description: 'The region in which ngrok should start.',
    },

    UpdateCheck: {
      Name: '--update-check',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'On startup, notifies whether or not your web UI version (commit) is up-to-date with the current master branch.',
    },

    UpdateAllExtensions: {
      Name: '--update-all-extensions',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'On startup, it pulls the latest updates for all extensions you have installed.',
    },

    ReinstallXFormers: {
      Name: '--reinstall-xformers',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: "Force-reinstall xformers. Useful for upgrading - but remove it after upgrading or you'll reinstall xformers perpetually.",
    },

    ReinstallTorch: {
      Name: '--reinstall-torch',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: "Force-reinstall torch. Useful for upgrading - but remove it after upgrading or you'll reinstall torch perpetually.",
    },

    Tests: {
      Name: '--tests',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Run test to validate web UI functionality, see wiki topic for more details.',
    },

    NoTests: {
      Name: '--no-tests',
      Type: SDSettingType.CheckBox,
      Default: 'False',
      Description: 'Do not run tests even if `--tests` option is specified.',
    },
  },
};
