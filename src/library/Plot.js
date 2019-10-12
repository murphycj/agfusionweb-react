
const HORIZONTAL_LEVELS = [1,2,3,4];


export class Plot {
  constructor(filename='', height=0, width=0, dpi=0, fontSize=12, scale=0) {

    this.filename = filename;
    this.scale = scale;
    this.width = width;
    this.height = height;
    this.dpi = dpi;
    this.fontSize = fontSize;
    this.texts = [];
    this.lines = [];
    this.linesBody = [];
    this.rects = [];
  }

  scaleSequence(seqLength) {
    // scale the sequence (protein or DNA)

    if (!this.scale || this.scale < seqLength) {
      this.normalize = seqLength
    } else {
      this.normalize = this.scale
    }

    this.offset = 0.05 + (1.0 - seqLength / this.normalize) * 0.45;

    // assert this.normalize >= seq_length, "length normalization should be >= protein length"
  }
}