

class _ctxWindow {
  constructor(ctx, x, y, w, h) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.enable = true;
  }
  setPos(x,y) {
    this.x = x;
    this.y = y;
  }
  setSize(w,h) {
    this.width = w;
    this.height = h;
  }
}


class _fftSpectrogramDisplay {
  constructor(data, ctxWindow, sampleRate, frequencyBinCount) {
    this.data = data;
    this.ctxWindow = ctxWindow;
    this.ctx = ctxWindow.ctx;
    this.sampleRate = sampleRate;
    this.frequencyBinCount = frequencyBinCount;
    this.scaleMode = 'log';
    this.logScale = 1.01;
    this.specMax = 15000; // hz
    this.specMin = 0; // not implemented
    this.scaleX = 1;
    this.scaleY = 1;
    this.enable = false;
    this.paused = false;
    this.type = "fft";
    this.colormap = this.getColor;
  }
  getColor(d) {
    // return (`rgb(${viridis[d][0]*255},${viridis[d][1]*255},${viridis[d][2]*255})`);
    return (`rgb(
      ${colormap[curColormap][d][0]*255},
      ${colormap[curColormap][d][1]*255},
      ${colormap[curColormap][d][2]*255})`);
  }
  setPause(bool) {
    this.paused = bool;
  }
  setEnable(bool) {
    this.enable = bool;
    if (!bool) {this.ctx.clearRect(
      this.ctxWindow.x, this.ctxWindow.y,
      this.ctxWindow.width, this.ctxWindow.height)
    }
    else if (this.type === "2d"){
      let d = 0;
      this.ctx.fillStyle = `rgb(${Math.min(d**3, 70) + d/2}, ${d*5-400}, ${d*3})` // main (ice)
      this.ctx.fillRect(this.ctxWindow.x, this.ctxWindow.y,
        this.ctxWindow.width, this.ctxWindow.height)
    }
  }
  //
  updateScale() {
    if (this.scaleMode == 'linear') {
      this.scaleX = this.ctxWindow.width / this.ahz(this.specMax-this.specMin);
      this.scaleY = this.ctxWindow.height / this.ahz(this.specMax-this.specMin);
    }
    else if (this.scaleMode == 'log') {
      const cutoff = this.getBaseLog(Math.ceil(this.ahz(this.specMin)) + 1);
      this.scaleX = this.ctxWindow.width / this.getBaseLog(this.logScale, this.ahz(this.specMax-this.specMin));
      this.scaleY = this.ctxWindow.height / this.getBaseLog(this.logScale, this.ahz(this.specMax-this.specMin));
    }
    // this.scaleX = x;
  }
  // applies scaling (e.g. logarithm)
  scaleFunc(input) {

    if (this.scaleMode == 'linear') {
      return (input * this.scaleX);
    }
    else if (this.scaleMode == 'log') {
      return this.getBaseLog(this.logScale, input) * this.scaleX;
    }
  }
  // undoes scaling
  unscale(input) {

    if (this.scaleMode == 'linear') {
      let tmp = input / this.scaleX;
      return (tmp);
    }
    else if (this.scaleMode == 'log') {
      return this.unBaseLog(input / this.scaleX, this.logScale);
    }
  }
  // applies scaling (e.g. logarithm)
  scaleFuncY(input) {

    if (this.scaleMode == 'linear') {
      return (input * this.scaleY);
    }
    else if (this.scaleMode == 'log') {
      return this.getBaseLog(this.logScale, input) * this.scaleY;
    }
  }
  // undoes scaling
  unscaleY(input) {

    if (this.scaleMode == 'linear') {
      let tmp = input / this.scaleY;
      return (tmp);
    }
    else if (this.scaleMode == 'log') {
      return this.unBaseLog(input / this.scaleY, this.logScale);
    }
  }
  //
  getBaseLog(base, number) {
    return Math.round(Math.log(number) / Math.log(base)*1000000000)/1000000000;
  }
  //
  unBaseLog(answer, base) {
     return (base ** answer);
  }
  // converts array position to hz
  hz(index) {
    let tmphz = (index / this.frequencyBinCount) * (this.sampleRate/2);
    return tmphz;
  }
  // converts hz to array position (float)
  ahz(hz) {
    let tmpIndex = (hz / (this.sampleRate/2)) * this.frequencyBinCount;
    return tmpIndex;
  }
  // set scalemode
  scaleModeSet(scaleMode) {
    this.scaleMode = scaleMode;
    this.updateScale();
  }
  //
  specMaxSet(specMax) {
    this.specMax = specMax;
    this.updateScale();
  }
  // draw a line for each array[x][amplitude] position
  linePlot(array, color, lineWidth=2) {
    if (!this.enable) {return}
    this.ctx.beginPath();
    let x = 0;
    for (let i = 0; i < array.length; i++) {
      if (array[i][0] != 0) {
        const tmpY = this.ctxWindow.height - ((array[i][1] / 128) * this.ctxWindow.height) / 2;
        x ? this.ctx.lineTo(Math.min(this.ctxWindow.x + this.scaleFunc(array[i][0]), this.ctxWindow.width), this.ctxWindow.y + tmpY, lineWidth, this.ctxWindow.height - tmpY)
        :   this.ctx.moveTo(Math.min(this.ctxWindow.x + this.scaleFunc(array[i][0]), this.ctxWindow.width), this.ctxWindow.y + tmpY, lineWidth, this.ctxWindow.height - tmpY);
        x++;
      }
    }
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }
  // draw dots
  dotPlot(array, color, lineWidth=4) {
    if (!this.enable) {return}

    const radius = lineWidth;

    let x = 0;
    for (let i = 0; i < array.length; i++) {
      if (array[i][0] != 0) {
        const tmpY = this.ctxWindow.height - ((array[i][1] / 128) * this.ctxWindow.height) / 2;


        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        ctx.arc(
          Math.min(this.ctxWindow.x + this.scaleFunc(array[i][0]), this.ctxWindow.width),
          this.ctxWindow.y + tmpY,
          radius, 0, 1.99 * Math.PI);
        // ctx.fill();
        ctx.stroke();

        this.ctx.font = "20px Arial";
        this.ctx.fillText(`${Math.floor(this.hz(array[i][0]))}`, this.scaleFunc(array[i][0]+0.5) + 5, this.ctxWindow.y + tmpY + 40);

        // this.ctx.beginPath();
        x++;
      }
    }
    // this.ctx.lineWidth = lineWidth;
    // this.ctx.strokeStyle = color;
    // this.ctx.stroke();
  }
  // draw a line for each array[x]
  lineFFTPlot(array, color, lineWidth=1) {
    if (!this.enable) {return}
    this.ctx.beginPath();
    let x = 0;
    for (let i = 0; i < array.length; i++) {
      // this.ctx.fillRect(x++, y, lineWidth, canvas.height - y);
      const tmpY = this.ctxWindow.height - ((array[i] / 128) * this.ctxWindow.height) / 2;
      x ? this.ctx.lineTo(Math.min(this.ctxWindow.x + this.scaleFunc(x++), this.ctxWindow.width), this.ctxWindow.y + tmpY, lineWidth, this.ctxWindow.height - tmpY)
      :   this.ctx.moveTo(Math.min(this.ctxWindow.x + this.scaleFunc(x++), this.ctxWindow.width), this.ctxWindow.y + tmpY, lineWidth, this.ctxWindow.height - tmpY);
    }
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }
  // draw a rect, for performance testing
  drawRect(x,y,w,h) {
    this.ctx.fillRect(x,y,w,h);
  }
  // ctxStyle(d) {
  //   this.ctx.fillStyle = this.colormap(d);
  // }
  // draw the entire fft spectrogram
  clear() {
    this.ctx.clearRect(0,0,this.ctxWindow.width,this.ctxWindow.height);
  }
  render() {
    if (this.paused) {return false}
    // this.ctx.clearRect(0,0,this.ctxWindow.width,this.ctxWindow.height);
    if (!this.enable) {return false}
    let data = this.data;
    const dataCount = Math.min(data.length, this.ahz(this.specMax));
    for (let i = 0; i < dataCount; i++) {
      let d = data[i];

      const y = this.ctxWindow.height - ((d / 128) * this.ctxWindow.height) / 2;
      const c = Math.floor((i * 255) / this.ctxWindow.width); // x iterates and sets color
      // this.ctx.fillStyle = `rgb(${d}, ${d}, ${(d)})` // main (b&w)
      // this.ctx.fillStyle = `rgb(${d*3}, ${d*4-400}, ${Math.min(d**3, 70) + d/2})` // main (orange)
      // this.ctx.fillStyle = `rgb(${Math.min(d**3, 70) + d/2}, ${d*5-400}, ${d*3})` // main (ice)
      this.ctx.fillStyle = this.colormap(d);
      // this.ctx.fillStyle = `rgb(${d*3+ 30}, ${d*5 - 500}, ${(200 - d) + Math.max(d*6 - 900, 0)})` // main (trippy)
      this.drawRect(
        this.scaleFunc(i),
        y,
        this.scaleFunc(i+1) - this.scaleFunc(i) + 1,
        this.ctxWindow.height - y);
    }
  }
  // show the scale at the bottom of the screen
  scaleRender() {
    this.ctx.fillStyle = `rgb(50,50,50)`; // set color
    this.ctx.fillRect(this.ctxWindow.x, this.ctxWindow.height, this.ctxWindow.width, 80);
    if (!this.enable) {return false}

    if (this.scaleMode === 'linear') {
      for (var i = 0; i < (this.specMax/100); i++) {
        this.ctx.fillStyle = `rgb(250,250,250)`; // set color
        if (i%10 === 0) {
          this.ctx.fillRect(this.scaleFunc(this.ahz(i * 100)), this.ctxWindow.height, 1, 30);
          this.ctx.fillText(`${100*i}`, this.scaleFunc(this.ahz(i * 100)), this.ctxWindow.height + 40);
        }
        else if (i%5 === 0) {
          this.ctx.fillRect(this.scaleFunc(this.ahz(i * 100)), this.ctxWindow.height, 1, 20);
        }
        else {
          this.ctx.fillRect(this.scaleFunc(this.ahz(i * 100)), this.ctxWindow.height, 1, 10);
        }
      }
    }
    else if (this.scaleMode === 'log') {
      let tmpScale = 1.03;
      for (var i = 0; i < (this.specMax/10); i++) {
        this.ctx.fillStyle = `rgb(100,100,100)`; // set color
        if (i%100 === 0) {
          this.ctx.fillRect(this.scaleFunc(this.ahz(i * 10)), this.ctxWindow.height, 1, 30);
          this.ctx.fillText(`${10*i}`, this.scaleFunc(this.ahz(i * 10)), this.ctxWindow.height + 60);
        }
        else if (i%50 === 0) {
          this.ctx.fillRect(this.scaleFunc(this.ahz(i * 10)), this.ctxWindow.height, 1, 20);
        }
        else if (i%10 === 0) {
          this.ctx.fillRect(this.scaleFunc(this.ahz(i * 10)), this.ctxWindow.height, 1, 15);
        }
        else if (i < 50){
          this.ctx.fillRect(this.scaleFunc(this.ahz(i * 10)), this.ctxWindow.height, 1, 10);
        }
      }

      this.ctx.fillStyle = `rgb(250,250,250)`; // set color
      for (var i = 0; i < getBaseLog(tmpScale, this.specMax); i++) {
        if (i%10 == 0) {
          this.ctx.fillRect(this.scaleFunc(this.ahz(tmpScale**i)), this.ctxWindow.height, 1, 30);
          this.ctx.fillText(`${Math.round(tmpScale**i)}`, this.scaleFunc(this.ahz(tmpScale**i)), this.ctxWindow.height + 40);
        }
      }
    }
  }
  // draw a vertical line at an index
  drawCursorAt(fundamentalIndex, fundamentalAmplitude, color, width = 2, tmpctx = this.ctx) {
    if (!this.enable) {return}
    tmpctx.fillStyle = color; // set color
    tmpctx.font = "20px Arial";
    const tmpY = this.ctxWindow.height - ((fundamentalAmplitude / 128) * this.ctxWindow.height) / 2;
    tmpctx.fillRect(this.scaleFunc(fundamentalIndex+0.5), tmpY, width, this.ctxWindow.height - tmpY + 20);
    tmpctx.fillText(`${Math.floor(this.hz(fundamentalIndex))}`, this.scaleFunc(fundamentalIndex+0.5) + 5, this.ctxWindow.height + 20);
  }
  // draw the mouse cursor
  cursorRender(x, y, tmpctx = this.ctx) {
    if (!this.enable) {return}
    if (m.keys.includes(0)) {
      let tmpX = x - this.ctxWindow.x;
      let tmpHeight = y - this.ctxWindow.y;
      let tmpHZ = Math.floor(this.hz(this.unscale(tmpX)));
      ctx.fillStyle = '#000';
      tmpctx.fillRect(tmpX - 1, tmpHeight, 3, this.ctxWindow.height-tmpHeight + 5);
      tmpctx.fillStyle = '#3ff';
      tmpctx.fillRect(tmpX, tmpHeight, 1, this.ctxWindow.height-tmpHeight + 5);
      tmpctx.font = "20px Arial";
      tmpctx.fillText(`${tmpHZ}`, (tmpX) + 5, tmpHeight - 2);
    }
  }
  // draw little indicators for peaks
  peaksDraw(patternPeaks) {
    if (!this.enable) {return}
    for (var i = 0; i < patternPeaks.length; i++) {
      this.ctx.fillStyle = `rgba(255,255,255,1)`; // set color
      let tmpY = this.ctxWindow.height - ((patternPeaks[i][1] / 128) * this.ctxWindow.height) / 2;
      this.ctx.fillRect(this.scaleFunc(patternPeaks[i][0]), tmpY, 1, 20);
      tmpY = this.ctxWindow.height + 10;
      this.ctx.fillStyle = `rgba(0,255,40,1)`; // set color
      this.ctx.fillRect(this.scaleFunc(patternPeaks[i][0]), tmpY, 1, 10);
    }
  }
}
