import { Plot } from './Plot';

export class PlotExons extends Plot {

  constructor(verticalOffset, ...args) {
    super(...args);
    this.verticalOffset = 0.05
  }

  drawLengthMarkers(basepairLength) {
    // plot protein length markers

    this.basepairLength = basepairLength/this.normalize*0.9

    this.lineEnd = basepairLength/this.normalize*0.9 + this.offset

    this.texts.push({
      x: 0.5,
      y: 0.1,
      text: "Base pair position (kbp)"
    });

    this.lines.push({
      x0: this.offset,
      x1: this.offset+this.basepairLength,
      y0: 0.2+this.verticalOffset,
      y1: 0.2+this.verticalOffset,
      color: 'black'
    });

    // left marker

    this.lines.push({
      x0: this.offset,
      x1: this.offset,
      y0: 0.15+this.verticalOffset,
      y1: 0.2+this.verticalOffset,
      color: 'black'
    });

    this.texts.push({
      x: this.offset,
      y: 0.05+this.verticalOffset,
      text: "0"
    });

    // draw markers for increments of 1000 base pairs

    for (var i = 1; i <= basepairLength; i++) {
      if ((i % 10000) === 0) {
        this.lines.push({
          x0: this.offset + (i / this.normalize * 0.9),
          x1: this.offset + (i / this.normalize * 0.9),
          y0: 0.175+this.verticalOffset,
          y1: 0.2+this.verticalOffset,
          color: 'black'
        });
      }
    }

    // right marker

    this.lines.push({
      x0: this.offset+this.basepairLength,
      x1: this.offset+this.basepairLength,
      y0: 0.15+this.verticalOffset,
      y1: 0.2+this.verticalOffset,
      color: 'black'
    });

    this.texts.push({
      x: this.offset+this.basepairLength,
      y: 0.05+this.verticalOffset,
      text: parseInt(basepairLength/1000)
    });
  }
}