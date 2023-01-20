

class _spectrogram {
  constructor() {
    this.data = false;
    this.analyser = false;
  }
  init(stream) {
    this.resetAnalyser(stream);

    this.data = new Uint8Array(this.analyser.frequencyBinCount);

    this.analyserFrequencyBinCount = this.analyser.frequencyBinCount;
    this.analyserSampleRate = this.audioCtx.sampleRate;
  }
  resetAnalyser(stream) {
    if (this.audioCtx) this.audioCtx.close();
    this.audioCtx = new AudioContext();
    this.resetContext();
    this.audioCtx.createMediaStreamSource(stream).connect(this.analyser);
    this.tmpStream = this.audioCtx.createMediaStreamSource(stream);
  }
  resetContext() {
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048*4;
    this.analyser.smoothingTimeConstant = 0;
  }
  update() {
  this.analyser.getByteFrequencyData(this.data);
    //
    // if (!this.data) {return this.data}
    // this.analyser.getByteTimeDomainData(this.data);
    // this.empty = new Uint8Array(this.data.length);
    // transform(this.data, this.empty);
    // console.log(this.empty);
  }
  changeStream(stream) {
    this.audioCtx.close();
    this.audioCtx = null;
    this.resetAnalyser(stream);
  }
  swapContext(ctx) {
    let ret = this.audioCtx;
    this.audioCtx = ctx;
    this.resetContext();
    return ret;
  }
}
