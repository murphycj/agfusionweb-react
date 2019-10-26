import { PlotExons } from './PlotExons';

export class PlotWTExons extends PlotExons {
  constructor(transcript, ...args) {
    super(...args);
    this.transcript = transcript;
    this.draw();
  }

  drawMainBody(nam, uid) {
    // main protein frame

    var length = (this.transcript.end - this.transcript.start) / this.normalize * 0.9;

    this.body.push({
      type: 'line',
      x0: this.offset,
      x1: this.offset + length,
      y0: 0.5,
      y1: 0.5,
      color: 'black'
    });

    // this.texts.push({
    //   x: 0.5,
    //   y: 0.9,
    //   text: name
    // });
    //
    // this.texts.push({
    //   x: 0.5,
    //   y: 0.83,
    //   text: uid
    // });
  }

  drawExons() {

    var index = 0;

    for (var i = 0; i < this.transcript.exons.length; i++) {

      var exon = this.transcript.exons[i];
      var start = null;
      var end = null;

      if (this.transcript.strand == '+') {
        start = exon[0] - this.transcript.start;
        end = exon[1] - this.transcript.start;
      } else {

        // this is so the transcription direction is not plotted
        // in reverse for genes on minus strand

        start = -(exon[1] - this.transcript.end);
        end = -(exon[0] - this.transcript.end);
      }

      var exonStart = (start / this.normalize) * 0.9 + this.offset
      var exonEnd = (end / this.normalize) * 0.9 + this.offset
      // var exonCenter = (exonEnd - exonStart) / 2 + exonStart

      this.rects.push({
        x: exonStart,
        y: 0.45,
        width: exonEnd - exonStart,
        height: 0.1,
        color: 'black',
        show: true,
        index: index
      });

      index++;
    }
  }

  draw() {
    this.scaleSequence(this.transcript.end - this.transcript.start);
    this.drawExons();
    this.drawLengthMarkers(this.transcript.end - this.transcript.start);
    this.drawMainBody(
        this.transcript.name,
        this.transcript.id
    )
  }
}