/* eslint-disable max-len */

import {SettingComponentType, TGArgSetting} from './InterfaceAndTypes';

interface CommandLineFlags {
  [key: string]: {[key: string]: TGArgSetting};

  BasicSettings: {
    [key: string]: TGArgSetting;

    Help: TGArgSetting;
    MultiUser: TGArgSetting;
    Character: TGArgSetting;
    Model: TGArgSetting;
    Lora: TGArgSetting;
    ModelDir: TGArgSetting;
    LoraDir: TGArgSetting;
    ModelMenu: TGArgSetting;
    Settings: TGArgSetting;
    Extensions: TGArgSetting;
    Verbose: TGArgSetting;
    ChatButtons: TGArgSetting;
  };

  ModelLoader: {
    [key: string]: TGArgSetting;

    Loader: TGArgSetting;
  };

  AccelerateTransformers: {
    [key: string]: TGArgSetting;

    Cpu: TGArgSetting;
    AutoDevices: TGArgSetting;
    GpuMemory: TGArgSetting;
    CpuMemory: TGArgSetting;
    Disk: TGArgSetting;
    DiskCacheDir: TGArgSetting;
    LoadIn8bit: TGArgSetting;
    Bf16: TGArgSetting;
    NoCache: TGArgSetting;
    Xformers: TGArgSetting;
    SdpAttention: TGArgSetting;
    TrustRemoteCode: TGArgSetting;
    UseFast: TGArgSetting;
  };

  Accelerate4bit: {
    [key: string]: TGArgSetting;

    LoadIn4bit: TGArgSetting;
    ComputeDtype: TGArgSetting;
    QuantType: TGArgSetting;
    UseDoubleQuant: TGArgSetting;
  };

  GGUF: {
    [key: string]: TGArgSetting;

    Threads: TGArgSetting;
    ThreadsBatch: TGArgSetting;
    NBatch: TGArgSetting;
    NGpuLayers: TGArgSetting;
    NCtx: TGArgSetting;
  };

  LlamaCpp: {
    [key: string]: TGArgSetting;

    MulMatQ: TGArgSetting;
    TensorSplit: TGArgSetting;
    LlamaCppSeed: TGArgSetting;
    CacheCapacity: TGArgSetting;
    CfgCache: TGArgSetting;
    NoMmap: TGArgSetting;
    Mlock: TGArgSetting;
    Numa: TGArgSetting;
    Cpu: TGArgSetting;
  };

  CTransformers: {
    [key: string]: TGArgSetting;

    ModelType: TGArgSetting;
  };

  AutoGPTQ: {
    [key: string]: TGArgSetting;

    Triton: TGArgSetting;
    NoInjectFusedAttention: TGArgSetting;
    NoInjectFusedMlp: TGArgSetting;
    NoUseCudaFp16: TGArgSetting;
    DescAct: TGArgSetting;
    DisableExllama: TGArgSetting;
  };

  ExLlama: {
    [key: string]: TGArgSetting;

    GpuSplit: TGArgSetting;
    MaxSeqLen: TGArgSetting;
    CfgCache: TGArgSetting;
  };

  GPTQForLLaMa: {
    [key: string]: TGArgSetting;

    Wbits: TGArgSetting;
    ModelType: TGArgSetting;
    Groupsize: TGArgSetting;
    PreLayer: TGArgSetting;
    Checkpoint: TGArgSetting;
    MonkeyPatch: TGArgSetting;
  };

  DeepSpeed: {
    [key: string]: TGArgSetting;

    Deepspeed: TGArgSetting;
    NvmeOffloadDir: TGArgSetting;
    LocalRank: TGArgSetting;
  };

  RWKV: {
    [key: string]: TGArgSetting;

    RwkvStrategy: TGArgSetting;
    RwkvCudaOn: TGArgSetting;
  };

  RoPE: {
    [key: string]: TGArgSetting;

    AlphaValue: TGArgSetting;
    RopeFreqBase: TGArgSetting;
    CompressPosEmb: TGArgSetting;
  };

  Gradio: {
    [key: string]: TGArgSetting;

    Listen: TGArgSetting;
    ListenHost: TGArgSetting;
    ListenPort: TGArgSetting;
    Share: TGArgSetting;
    AutoLaunch: TGArgSetting;
    GradioAuth: TGArgSetting;
    GradioAuthPath: TGArgSetting;
    SslKeyfile: TGArgSetting;
    SslCertfile: TGArgSetting;
  };

  API: {
    [key: string]: TGArgSetting;

    Api: TGArgSetting;
    PublicApi: TGArgSetting;
    PublicApiId: TGArgSetting;
    ApiBlockingPort: TGArgSetting;
    ApiStreamingPort: TGArgSetting;
  };

  Multimodal: {
    [key: string]: TGArgSetting;

    MultimodalPipeline: TGArgSetting;
  };
}

export const commandLineFlags: CommandLineFlags = {
  BasicSettings: {
    Help: {
      Name: '--help',
      Type: SettingComponentType.CheckBox,
      Description: 'Show this help message and exit.',
    },
    MultiUser: {
      Name: '--multi-user',
      Type: SettingComponentType.CheckBox,
      Description: 'Multi-user mode. Chat histories are not saved or automatically loaded. WARNING: this is highly experimental.',
    },
    Character: {
      Name: '--character',
      Type: SettingComponentType.InputBox,
      Description: 'The name of the character to load in chat mode by default.',
    },
    Model: {
      Name: '--model',
      Type: SettingComponentType.InputBox,
      Description: 'Name of the model to load by default.',
    },
    Lora: {
      Name: '--lora',
      Type: SettingComponentType.InputBox,
      Description: 'The list of LoRAs to load. If you want to load more than one LoRA, write the names separated by spaces.',
    },
    ModelDir: {
      Name: '--model-dir',
      Type: SettingComponentType.ChooseDirectory,
      Description: 'Path to directory with all the models.',
    },
    LoraDir: {
      Name: '--lora-dir',
      Type: SettingComponentType.ChooseDirectory,
      Description: 'Path to directory with all the loras.',
    },
    ModelMenu: {
      Name: '--model-menu',
      Type: SettingComponentType.CheckBox,
      Description: 'Show a model menu in the terminal when the web UI is first launched.',
    },
    Settings: {
      Name: '--settings',
      Type: SettingComponentType.ChooseFile,
      Description:
        'Load the default interface settings from this yaml file. See `settings-template.yaml` for an example. If you create a file called `settings.yaml`, this file will be loaded by default without the need to use the `--settings` flag.',
    },
    Extensions: {
      Name: '--extensions',
      Type: SettingComponentType.InputBox,
      Description: 'The list of extensions to load. If you want to load more than one extension, write the names separated by spaces.',
    },
    Verbose: {
      Name: '--verbose',
      Type: SettingComponentType.CheckBox,
      Description: 'Print the prompts to the terminal.',
    },
    ChatButtons: {
      Name: '--chat-buttons',
      Type: SettingComponentType.CheckBox,
      Description: 'Show buttons on chat tab instead of hover menu.',
    },
  },
  ModelLoader: {
    Loader: {
      Name: '--loader',
      Type: SettingComponentType.DropDown,
      Description: 'Choose the model loader manually, otherwise, it will get autodetected.',
      Values: {
        Transformers: 'transformers',
        AutoGptq: 'autogptq',
        GptqForLlama: 'gptq-for-llama',
        Exllama: 'exllama',
        ExllamaHf: 'exllama_hf',
        LlamaCpp: 'llamacpp',
        Rwkv: 'rwkv',
        CTransformers: 'ctransformers',
      },
    },
  },
  AccelerateTransformers: {
    Cpu: {
      Name: '--cpu',
      Type: SettingComponentType.CheckBox,
      Description: 'Use the CPU to generate text. Warning: Training on CPU is extremely slow.',
    },
    AutoDevices: {
      Name: '--auto-devices',
      Type: SettingComponentType.CheckBox,
      Description: 'Automatically split the model across the available GPU(s) and CPU.',
    },
    GpuMemory: {
      Name: '--gpu-memory',
      Type: SettingComponentType.InputBox,
      Description:
        'Maximum GPU memory in GiB to be allocated per GPU. Example: `--gpu-memory 10` for a single GPU, `--gpu-memory 10 5` for two GPUs. You can also set values in MiB like `--gpu-memory 3500MiB`.',
    },
    CpuMemory: {
      Name: '--cpu-memory',
      Type: SettingComponentType.InputBox,
      Description: 'Maximum CPU memory in GiB to allocate for offloaded weights. Same as above.',
    },
    Disk: {
      Name: '--disk',
      Type: SettingComponentType.CheckBox,
      Description: 'If the model is too large for your GPU(s) and CPU combined, send the remaining layers to the disk.',
    },
    DiskCacheDir: {
      Name: '--disk-cache-dir',
      Type: SettingComponentType.ChooseDirectory,
      Description: 'Directory to save the disk cache to. Defaults to `cache/`.',
    },
    LoadIn8bit: {
      Name: '--load-in-8bit',
      Type: SettingComponentType.CheckBox,
      Description: 'Load the model with 8-bit precision (using bitsandbytes).',
    },
    Bf16: {
      Name: '--bf16',
      Type: SettingComponentType.CheckBox,
      Description: 'Load the model with bfloat16 precision. Requires NVIDIA Ampere GPU.',
    },
    NoCache: {
      Name: '--no-cache',
      Type: SettingComponentType.CheckBox,
      Description: 'Set `use_cache` to False while generating text. This reduces the VRAM usage a bit with a performance cost.',
    },
    Xformers: {
      Name: '--xformers',
      Type: SettingComponentType.CheckBox,
      Description: "Use xformer's memory efficient attention. This should increase your tokens/s.",
    },
    SdpAttention: {
      Name: '--sdp-attention',
      Type: SettingComponentType.CheckBox,
      Description: "Use torch 2.0's sdp attention.",
    },
    TrustRemoteCode: {
      Name: '--trust-remote-code',
      Type: SettingComponentType.CheckBox,
      Description: 'Set trust_remote_code=True while loading a model. Necessary for ChatGLM and Falcon.',
    },
    UseFast: {
      Name: '--use_fast',
      Type: SettingComponentType.CheckBox,
      Description: 'Set use_fast=True while loading a tokenizer.',
    },
  },
  Accelerate4bit: {
    LoadIn4bit: {
      Name: '--load-in-4bit',
      Type: SettingComponentType.CheckBox,
      Description: 'Load the model with 4-bit precision (using bitsandbytes).',
    },
    ComputeDtype: {
      Name: '--compute-dtype',
      Type: SettingComponentType.DropDown,
      Description: 'Compute dtype for 4-bit. Valid options: bfloat16, float16, float32.',
      Values: {
        BFloat16: 'bfloat16',
        Float16: 'float16',
        Float32: 'float32',
      },
    },
    QuantType: {
      Name: '--quant-type',
      Type: SettingComponentType.DropDown,
      Description: 'Quant_type for 4-bit. Valid options: nf4, fp4.',
      Values: {
        NF4: 'nf4',
        FP4: 'fp4',
      },
    },
    UseDoubleQuant: {
      Name: '--use-double-quant',
      Type: SettingComponentType.CheckBox,
      Description: 'Use double quant for 4-bit.',
    },
  },
  GGUF: {
    Threads: {
      Name: '--threads',
      Type: SettingComponentType.InputBox,
      Description: 'Number of threads to use.',
    },
    ThreadsBatch: {
      Name: '--threads-batch',
      Type: SettingComponentType.InputBox,
      Description: 'Number of threads to use for batches/prompt processing.',
    },
    NBatch: {
      Name: '--n-batch',
      Type: SettingComponentType.InputBox,
      Description: 'Maximum number of prompt tokens to batch together when calling llama_eval.',
    },
    NGpuLayers: {
      Name: '--n-gpu-layers',
      Type: SettingComponentType.InputBox,
      Description:
        'Number of layers to offload to the GPU. Only works if llama-cpp-python was compiled with BLAS. Set this to 1000000000 to offload all layers to the GPU.',
    },
    NCtx: {
      Name: '--n-ctx',
      Type: SettingComponentType.InputBox,
      Description: 'Size of the prompt context.',
    },
  },
  LlamaCpp: {
    MulMatQ: {
      Name: '--mul-mat-q',
      Type: SettingComponentType.CheckBox,
      Description: 'Activate new mulmat kernels.',
    },
    TensorSplit: {
      Name: '--tensor-split',
      Type: SettingComponentType.InputBox,
      Description: 'Split the model across multiple GPUs, comma-separated list of proportions, e.g. 18,17',
    },
    LlamaCppSeed: {
      Name: '--llama-cpp-seed',
      Type: SettingComponentType.InputBox,
      Description: 'Seed for llama-cpp models. Default 0 (random).',
    },
    CacheCapacity: {
      Name: '--cache-capacity',
      Type: SettingComponentType.InputBox,
      Description: 'Maximum cache capacity. Examples: 2000MiB, 2GiB. When provided without units, bytes will be assumed.',
    },
    CfgCache: {
      Name: '--cfg-cache',
      Type: SettingComponentType.CheckBox,
      Description: 'llamacpp_HF: Create an additional cache for CFG negative prompts.',
    },
    NoMmap: {
      Name: '--no-mmap',
      Type: SettingComponentType.CheckBox,
      Description: 'Prevent mmap from being used.',
    },
    Mlock: {
      Name: '--mlock',
      Type: SettingComponentType.CheckBox,
      Description: 'Force the system to keep the model in RAM.',
    },
    Numa: {
      Name: '--numa',
      Type: SettingComponentType.CheckBox,
      Description: 'Activate NUMA task allocation for llama.cpp',
    },
    Cpu: {
      Name: '--cpu',
      Type: SettingComponentType.CheckBox,
      Description: 'Use the CPU version of llama-cpp-python instead of the GPU-accelerated version.',
    },
  },
  CTransformers: {
    ModelType: {
      Name: '--model-type',
      Type: SettingComponentType.DropDown,
      Description:
        'Model type of pre-quantized model. Currently gpt2, gptj, gptneox, falcon, llama, mpt, starcoder (gptbigcode), dollyv2, and replit are supported.',
      Values: {
        GPT2: 'gpt2',
        GPTJ: 'gptj',
        GPTNeoX: 'gptneox',
        Falcon: 'falcon',
        Llama: 'llama',
        MPT: 'mpt',
        StarCoder: 'starcoder',
        DollyV2: 'dollyv2',
        Replit: 'replit',
      },
    },
  },
  AutoGPTQ: {
    Triton: {
      Name: '--triton',
      Type: SettingComponentType.CheckBox,
      Description: 'Use triton.',
    },
    NoInjectFusedAttention: {
      Name: '--no-inject-fused-attention',
      Type: SettingComponentType.CheckBox,
      Description: 'Disable the use of fused attention, which will use less VRAM at the cost of slower inference.',
    },
    NoInjectFusedMlp: {
      Name: '--no-inject-fused-mlp',
      Type: SettingComponentType.CheckBox,
      Description: 'Triton mode only: disable the use of fused MLP, which will use less VRAM at the cost of slower inference.',
    },
    NoUseCudaFp16: {
      Name: '--no-use-cuda-fp16',
      Type: SettingComponentType.CheckBox,
      Description: 'This can make models faster on some systems.',
    },
    DescAct: {
      Name: '--desc-act',
      Type: SettingComponentType.CheckBox,
      Description:
        "For models that don't have a quantize_config.json, this parameter is used to define whether to set desc_act or not in BaseQuantizeConfig.",
    },
    DisableExllama: {
      Name: '--disable-exllama',
      Type: SettingComponentType.CheckBox,
      Description: 'Disable ExLlama kernel, which can improve inference speed on some systems.',
    },
  },
  ExLlama: {
    GpuSplit: {
      Name: '--gpu-split',
      Type: SettingComponentType.InputBox,
      Description: 'Comma-separated list of VRAM (in GB) to use per GPU device for model layers, e.g. `20,7,7`',
    },
    MaxSeqLen: {
      Name: '--max-seq-len',
      Type: SettingComponentType.InputBox,
      Description: 'Maximum sequence length.',
    },
    CfgCache: {
      Name: '--cfg-cache',
      Type: SettingComponentType.CheckBox,
      Description:
        'ExLlama_HF: Create an additional cache for CFG negative prompts. Necessary to use CFG with that loader, but not necessary for CFG with base ExLlama.',
    },
  },
  GPTQForLLaMa: {
    Wbits: {
      Name: '--wbits',
      Type: SettingComponentType.DropDown,
      Description: 'Load a pre-quantized model with specified precision in bits. 2, 3, 4 and 8 are supported.',
      Values: {
        Two: '2',
        Three: '3',
        Four: '4',
        Eight: '8',
      },
    },
    ModelType: {
      Name: '--model-type',
      Type: SettingComponentType.DropDown,
      Description: 'Model type of pre-quantized model. Currently LLaMA, OPT, and GPT-J are supported.',
      Values: {
        LLaMA: 'LLaMA',
        OPT: 'OPT',
        GPTJ: 'GPT-J',
      },
    },
    Groupsize: {
      Name: '--groupsize',
      Type: SettingComponentType.InputBox,
      Description: 'Group size.',
    },
    PreLayer: {
      Name: '--pre-layer',
      Type: SettingComponentType.InputBox,
      Description:
        'The number of layers to allocate to the GPU. Setting this parameter enables CPU offloading for 4-bit models. For multi-gpu, write the numbers separated by spaces, eg `--pre-layer 30 60`.',
    },
    Checkpoint: {
      Name: '--checkpoint',
      Type: SettingComponentType.InputBox,
      Description: 'The path to the quantized checkpoint file. If not specified, it will be automatically detected.',
    },
    MonkeyPatch: {
      Name: '--monkey-patch',
      Type: SettingComponentType.CheckBox,
      Description: 'Apply the monkey patch for using LoRAs with quantized models.',
    },
  },
  DeepSpeed: {
    Deepspeed: {
      Name: '--deepspeed',
      Type: SettingComponentType.CheckBox,
      Description: 'Enable the use of DeepSpeed ZeRO-3 for inference via the Transformers integration.',
    },
    NvmeOffloadDir: {
      Name: '--nvme-offload-dir',
      Type: SettingComponentType.ChooseDirectory,
      Description: 'DeepSpeed: Directory to use for ZeRO-3 NVME offloading.',
    },
    LocalRank: {
      Name: '--local-rank',
      Type: SettingComponentType.InputBox,
      Description: 'DeepSpeed: Optional argument for distributed setups.',
    },
  },
  RWKV: {
    RwkvStrategy: {
      Name: '--rwkv-strategy',
      Type: SettingComponentType.DropDown,
      Description: 'RWKV: The strategy to use while loading the model. Examples: "cpu fp32", "cuda fp16", "cuda fp16i8".',
      Values: {
        CPUFP32: 'cpu fp32',
        CUDAFP16: 'cuda fp16',
        CUDAFP16I8: 'cuda fp16i8',
      },
    },
    RwkvCudaOn: {
      Name: '--rwkv-cuda-on',
      Type: SettingComponentType.CheckBox,
      Description: 'RWKV: Compile the CUDA kernel for better performance.',
    },
  },
  RoPE: {
    AlphaValue: {
      Name: '--alpha-value',
      Type: SettingComponentType.InputBox,
      Description: 'Positional embeddings alpha factor for NTK RoPE scaling. Use either this or compress_pos_emb, not both.',
    },
    RopeFreqBase: {
      Name: '--rope-freq-base',
      Type: SettingComponentType.InputBox,
      Description:
        'If greater than 0, will be used instead of alpha_value. Those two are related by rope_freq_base = 10000 * alpha_value ^ (64 / 63).',
    },
    CompressPosEmb: {
      Name: '--compress-pos-emb',
      Type: SettingComponentType.InputBox,
      Description:
        "Positional embeddings compression factor. Should be set to (context length) / (model's original context length). Equal to 1/rope_freq_scale.",
    },
  },
  Gradio: {
    Listen: {
      Name: '--listen',
      Type: SettingComponentType.CheckBox,
      Description: 'Make the web UI reachable from your local network.',
    },
    ListenHost: {
      Name: '--listen-host',
      Type: SettingComponentType.InputBox,
      Description: 'The hostname that the server will use.',
    },
    ListenPort: {
      Name: '--listen-port',
      Type: SettingComponentType.InputBox,
      Description: 'The listening port that the server will use.',
    },
    Share: {
      Name: '--share',
      Type: SettingComponentType.CheckBox,
      Description: 'Create a public URL. This is useful for running the web UI on Google Colab or similar.',
    },
    AutoLaunch: {
      Name: '--auto-launch',
      Type: SettingComponentType.CheckBox,
      Description: 'Open the web UI in the default browser upon launch.',
    },
    GradioAuth: {
      Name: '--gradio-auth',
      Type: SettingComponentType.InputBox,
      Description: 'Set gradio authentication like "username:password"; or comma-delimit multiple like "u1:p1,u2:p2,u3:p3".',
    },
    GradioAuthPath: {
      Name: '--gradio-auth-path',
      Type: SettingComponentType.ChooseFile,
      Description:
        'Set the gradio authentication file path. The file should contain one or more user:password pairs in this format: "u1:p1,u2:p2,u3:p3".',
    },
    SslKeyfile: {
      Name: '--ssl-keyfile',
      Type: SettingComponentType.ChooseFile,
      Description: 'The path to the SSL certificate key file.',
    },
    SslCertfile: {
      Name: '--ssl-certfile',
      Type: SettingComponentType.ChooseFile,
      Description: 'The path to the SSL certificate cert file.',
    },
  },
  API: {
    Api: {
      Name: '--api',
      Type: SettingComponentType.CheckBox,
      Description: 'Enable the API extension.',
    },
    PublicApi: {
      Name: '--public-api',
      Type: SettingComponentType.CheckBox,
      Description: 'Create a public URL for the API using Cloudfare.',
    },
    PublicApiId: {
      Name: '--public-api-id',
      Type: SettingComponentType.InputBox,
      Description: 'Tunnel ID for named Cloudflare Tunnel. Use together with public-api option.',
    },
    ApiBlockingPort: {
      Name: '--api-blocking-port',
      Type: SettingComponentType.InputBox,
      Description: 'The listening port for the blocking API.',
    },
    ApiStreamingPort: {
      Name: '--api-streaming-port',
      Type: SettingComponentType.InputBox,
      Description: 'The listening port for the streaming API.',
    },
  },
  Multimodal: {
    MultimodalPipeline: {
      Name: '--multimodal-pipeline',
      Type: SettingComponentType.InputBox,
      Description: 'The multimodal pipeline to use. Examples: `llava-7b`, `llava-13b`.',
    },
  },
};
