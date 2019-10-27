
// const HORIZONTAL_LEVELS = [1,2,3,4];


export class Plot {
  constructor(fontSize=12, scale=0) {

    this.scale = scale;
    this.fontSize = fontSize;
    this.texts = [];
    this.lines = [];
    this.body = [];
    this.rects = [];
    this.labels = [];
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