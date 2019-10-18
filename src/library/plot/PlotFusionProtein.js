import { PlotProtein } from './PlotProtein';

export class PlotFusionProtein extends PlotProtein {
  constructor(...args) {
    super(...args);

    this.draw();
  }

  drawJunction() {
    // add the junction

    this.lines.push({
      x0: (this.transcript.proteinJunctionGene1 / this.normalize) * 0.9 + this.offset,
      x1: (this.transcript.proteinJunctionGene1 / this.normalize) * 0.9 + this.offset,
      y0: 0.45 - this.verticalOffset,
      y1: 0.65 - this.verticalOffset,
      color: 'black'
    });

    // middle marker, loop until it does not overlap with right marker

    this.lines.push({
      x0: (this.transcript.proteinJunctionGene1 / this.normalize) * 0.9 + this.offset,
      x1: (this.transcript.proteinJunctionGene1 / this.normalize) * 0.9 + this.offset,
      y0: 0.15 + this.verticalOffset,
      y1: 0.2 + this.verticalOffset,
      color: 'black'
    });

    this.texts.push({
      x: (this.transcript.proteinJunctionGene1 / this.normalize) * 0.9 + this.offset,
      y: 0.15 + this.verticalOffset,
      text: this.transcript.proteinJunctionGene1,
    });

  }

  draw() {
    this.scaleSequence(this.transcript.proteinSeqLen);
    this.proteinFrameLength = (this.transcript.proteinSeqLen / this.normalize)*0.9;

    this.drawDomains();
    this.drawProteinLengthMarkers(this.transcript.proteinSeqLen);
    this.drawJunction();
    this.drawMainBody();
  }
}
