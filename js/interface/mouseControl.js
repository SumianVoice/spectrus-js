

let _audio = null;

let mClick = {
  x : 0,
  y : 0,
  active : false
}

let mUp = function(event) {
  mClick.x = m.x;
  mClick.y = m.y;
  mClick.active = true;
  buttonList.clickTest(mClick.x, mClick.y);
}
let mDown = function(event) {
}

let m = new _mouseListener(mDown, mUp);

class _buttonControl {
  constructor() {
    this.spectrogram = null;
    this.fft = null;
  }
  fftBind(fft) {
    this.fft = fft;
  }
  spectrogramBind(spectrogram) {
    this.spectrogram = spectrogram;
  }
  spectrogramToggle(child=false) {
    if (child) {return child.spectrogramToggle()}
    this.spectrogram.setEnable(this.spectrogram.enable ? false : true);
    if (this.spectrogram.enable) {spectrogram.fillScreen();}
  }
  spectrogramPauseToggle(child=false) {
  if (child) {return child.spectrogramPauseToggle()}
  this.spectrogram.setPause(this.spectrogram.paused ? false : true);
  this.fft.setPause(this.fft.paused ? false : true);
  if (_audio) {
    this.spectrogram.paused ? _audio.pause() : _audio.play();
  }
  if (this.spectrogram.paused) {buttonList.buttons[5].setText(`‖`);}
  else {buttonList.buttons[5].setText(`▶`);}


  }
  fftToggle(child=false) {
    if (child) {return child.fftToggle()}
    this.fft.setEnable(this.fft.enable ? false : true);
  }
  trackingToggle(child=false) {
    if (child) {return child.trackingToggle()}
    formantTrackingVisibility = formantTrackingVisibility ? false : true;
  }
  // resolutionIncrease(child=false) {
  //   if (child) {return child.resolutionIncrease()}
  //   fft.analyser.fftSize = 2048;
  //   fft.analyser.smoothingTimeConstant = 0.001;
  // }
  specMaxIncrease(child=false) {
    if (child) {return child.specMaxIncrease()}
    let specMax = this.fft.specMax;
    specMax += 1000;
    this.fft.specMaxSet(specMax);
    this.spectrogram.specMaxSet(specMax);
  }
  specMaxDecrease(child=false) {
    if (child) {return child.specMaxDecrease()}
    let specMax = this.fft.specMax;
    specMax -= 1000;
    specMax = Math.max(specMax, 1000);
    this.fft.specMaxSet(specMax);
    this.spectrogram.specMaxSet(specMax);
  }
  toggleScale(child=false) {
    if (child) {return child.toggleScale()}
    let scaleMode = this.fft.scaleMode;
    scaleMode = (scaleMode == 'linear') ? 'log' : 'linear';
    this.fft.scaleModeSet(scaleMode);
    this.spectrogram.scaleModeSet(scaleMode);
  }
  saveRolloff (child=false) {
    if (child) {return child.saveRolloff()}
    rolloffSave = [];
    for (var i = 0; i < smoothPeaks.length; i++) {
      rolloffSave.push({ ...smoothPeaks[i] });
    }
  }
  changeUserDevice(child=false) {
    if (child) {return child.changeUserDevice()}
    navigator.mediaDevices.getUserMedia({ audio: true }).then(a => {
      console.log('changing to ' + a.toString());
      fft.changeStream(a);
    }).catch(console.error);
  }
  playSoundFile(child=false) {
    if (child) {return child.playSoundFile()}
    let fs = document.querySelector("#filePicker").files;
    if (fs.length < 1) {
      alert("Please pick a file first!");
      return;
    }
    let f = fs[0];
    let u = URL.createObjectURL(f);
    let a = new Audio(u);
    let o;

    _audio = a;

    a.addEventListener('ended', ev => {
      _audio = null;
      URL.revokeObjectURL(u);
      this.changeUserDevice();
    });

    let c = new AudioContext();
    let source = c.createMediaElementSource(a);
    source.connect(c.destination);

    o = fft.swapContext(c);

    source.connect(fft.analyser);

    a.play();
  }
}

let buttonControl = new _buttonControl();

let buttonList = new _buttonContainer();

const space_bar = 32;

window.onkeydown = function(gfg){
  if(gfg.keyCode === space_bar) {
    buttonControl.spectrogramPauseToggle();
  }
};

function buttonsInit() {
  buttonControl.fftBind(fftDraw);
  buttonControl.spectrogramBind(spectrogram);
  // specmax increase .setSize(100, 20).setPos(20,20)
  let tmpButton = new _button();
  tmpButton.childBind(buttonControl);
  tmpButton.setFunction(buttonControl.specMaxIncrease)
  tmpButton.setSize(30, 20);
  tmpButton.setPos(20,20);
  tmpButton.setText("+");
  buttonList.add(tmpButton);
  // decrease
  tmpButton = new _button();
  tmpButton.childBind(buttonControl);
  tmpButton.setFunction(buttonControl.specMaxDecrease)
  tmpButton.setSize(30, 20);
  tmpButton.setPos(55,20);
  tmpButton.setText("-");
  buttonList.add(tmpButton);
  // toggle scale
  tmpButton = new _button();
  tmpButton.childBind(buttonControl);
  tmpButton.setFunction(buttonControl.toggleScale)
  tmpButton.setSize(70, 20);
  tmpButton.setPos(90,20);
  tmpButton.setText(`scale`);
  buttonList.add(tmpButton);
  // toggle spec
  tmpButton = new _button();
  tmpButton.childBind(buttonControl);
  tmpButton.setFunction(buttonControl.spectrogramToggle)
  tmpButton.setSize(140, 20);
  tmpButton.setPos(20,50);
  tmpButton.setText(`spectrogram`);
  buttonList.add(tmpButton);
  // fft toggle
  tmpButton = new _button();
  tmpButton.childBind(buttonControl);
  tmpButton.setFunction(buttonControl.fftToggle)
  tmpButton.setSize(140, 20);
  tmpButton.setPos(20,80);
  tmpButton.setText(`fft`);
  buttonList.add(tmpButton);
  // pause toggle
  tmpButton = new _button();
  tmpButton.childBind(buttonControl);
  tmpButton.setFunction(buttonControl.spectrogramPauseToggle)
  tmpButton.setSize(30, 30);
  tmpButton.setPos(180,50);
  tmpButton.setText(`▶`);
  buttonList.add(tmpButton);
  // toggle tracking
  tmpButton = new _button();
  tmpButton.childBind(buttonControl);
  tmpButton.setFunction(buttonControl.trackingToggle)
  tmpButton.setSize(140, 20);
  tmpButton.setPos(20,110);
  tmpButton.setText(`tracking`);
  buttonList.add(tmpButton);
  // saveRolloff
  tmpButton = new _button();
  tmpButton.childBind(buttonControl);
  tmpButton.setFunction(buttonControl.saveRolloff)
  tmpButton.setSize(140, 20);
  tmpButton.setPos(20,140);
  tmpButton.setText(`save rolloff`);
  buttonList.add(tmpButton);
  // changeUserDevice
  tmpButton = new _button();
  tmpButton.childBind(buttonControl);
  tmpButton.setFunction(buttonControl.changeUserDevice)
  tmpButton.setSize(140, 20);
  tmpButton.setPos(20,170);
  tmpButton.setText(`select user device`);
  buttonList.add(tmpButton);
  // playSoundFile
  tmpButton = new _button();
  tmpButton.childBind(buttonControl);
  tmpButton.setFunction(buttonControl.playSoundFile)
  tmpButton.setSize(140, 20);
  tmpButton.setPos(20,200);
  tmpButton.setText(`play sound`);
  buttonList.add(tmpButton);
  //
  // tmpButton = new _button();
  // tmpButton.childBind(buttonControl);
  // tmpButton.setFunction(buttonControl.resolutionIncrease)
  // tmpButton.setSize(140, 20);
  // tmpButton.setPos(20,110);
  // tmpButton.setText(`^`);
  // buttonList.add(tmpButton);
}



//
