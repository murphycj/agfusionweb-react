import { PlotProtein } from './PlotProtein';

export class PlotWTProtein extends PlotProtein {
  constructor(transcript, ...args) {
    super(...args);
    this.transcript = transcript;

    this.draw();
  }

  draw() {
    this.scaleSequence(this.transcript.proteinLength)
    this.proteinFrameLength = ((this.transcript.proteinLength) / this.normalize) * 0.9;

    this.drawDomains(this.transcript.proteinDomains);
    this.drawProteinLengthMarkers(this.transcript.proteinLength);
    this.drawMainBody();
  }
}