class NoiseGateProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'threshold',
        defaultValue: -45,
        minValue: -80,
        maxValue: -10
      }
    ];
  }

  constructor() {
    super();
    this.enabled = true;
    this.rnnoise = null;
    this.inputPtr = null;
    this.floatView = null;

    this.port.onmessage = async (event) => {
      const { type, payload } = event.data;
      if (type === 'toggle') {
        this.enabled = payload;
      }
      if (type === 'configureRnnoise' && payload?.url) {
        await this.loadRnnoise(payload.url);
      }
    };
  }

  async loadRnnoise(url) {
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const module = await WebAssembly.instantiate(buffer, {});
      const exports = module.instance.exports;
      this.rnnoise = {
        process: exports.rnnoise_process_frame,
        init: exports.rnnoise_create,
        free: exports.rnnoise_destroy,
        memory: exports.memory
      };
      this.rnnoiseState = this.rnnoise.init();
      this.inputPtr = exports.malloc(480 * 4);
      this.floatView = new Float32Array(this.rnnoise.memory.buffer, this.inputPtr, 480);
      this.port.postMessage({ type: 'rnnoise-ready' });
    } catch (error) {
      this.port.postMessage({
        type: 'rnnoise-error',
        message: error?.message ?? 'Unable to load RNNoise wasm'
      });
    }
  }

  applyNoiseGate(input, output, thresholdDb) {
    const threshold = 10 ** (thresholdDb / 20);
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
      sum += input[i] * input[i];
    }
    const rms = Math.sqrt(sum / input.length);
    const gain = rms < threshold ? 0 : 1;
    for (let i = 0; i < input.length; i++) {
      output[i] = input[i] * gain;
    }
  }

  applyRnnoise(input, output) {
    if (!this.rnnoise || !this.floatView) {
      output.set(input);
      return;
    }

    this.floatView.set(input.slice(0, this.floatView.length));
    this.rnnoise.process(this.rnnoiseState, this.inputPtr);
    output.set(this.floatView);
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input?.length || !output?.length) {
      return true;
    }

    const channelIn = input[0];
    const channelOut = output[0];
    if (!channelIn || !channelOut) {
      return true;
    }

    if (!this.enabled) {
      channelOut.set(channelIn);
      return true;
    }

    if (this.rnnoise) {
      this.applyRnnoise(channelIn, channelOut);
      return true;
    }

    const threshold = parameters.threshold.length ? parameters.threshold[0] : -45;
    this.applyNoiseGate(channelIn, channelOut, threshold);
    return true;
  }
}

registerProcessor('noise-gate-processor', NoiseGateProcessor);

