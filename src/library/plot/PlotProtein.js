import { Plot } from './Plot';

import { PDBS } from '../utils';
// const HORIZONTAL_LEVELS = [1, 2, 3, 4];

export class PlotProtein extends Plot {

  constructor(transcript, colors, rename=[], exclude = [], ...args) {
    super(...args);

    this.transcript = transcript;
    this.colors = colors;
    this.rename = rename;
    this.exclude = exclude;
    this.verticalOffset = 0.05;
  }

  drawDomains() {
    // plot domains

    var domainIndex = 0;

    for (var k = 0; k < PDBS.length; k++) {
      var domains = this.transcript.proteinDomains[PDBS[k]];

      // sort domains from lowest to highest start

      domains.sort((v1, v2) => {
        return ((v1.start < v2.start ? -1 : ((v1.start > v2.start) ? 1 : 0)))
      });

      for (var i = 0; i < domains.length; i++) {

        var domain = domains[i];

        var domainStart = (domain.start / this.normalize) * 0.9 + this.offset;
        var domainEnd = (domain.end / this.normalize) * 0.9 + this.offset;
        var domainCenter = (domainEnd - domainStart) / 2 + domainStart;

        this.rects.push({
          x: domainStart,
          y: 0.45,
          width: domainEnd - domainStart,
          height: 0.1,
          color: '#3385ff',
          pdb: PDBS[k],
          longName: domain.name || domain.desc || domain.id,
          shortName: domain.desc || domain.id,
          start: domain.start,
          end: domain.end,
          type: 'protein',
          show: false,
          index: domainIndex
        });

        domainIndex++;
      }
    }
  }

  drawProteinLengthMarkers(length) {
    // plot protein length markers

    this.lineEnd = length / this.normalize * 0.9 + this.offset;

    this.texts.push({
      x: 0.5,
      y: this.verticalOffset ,
      text: "Amino acid position"
    });

    this.lines.push({
      x0: this.offset,
      x1: this.offset + this.proteinFrameLength,
      y0: 0.2 + this.verticalOffset,
      y1: 0.2 + this.verticalOffset,
      color: 'black'
    });

    // left marker

    this.lines.push({
      x0: this.offset,
      x1: this.offset,
      y0: 0.15 + this.verticalOffset,
      y1: 0.2 + this.verticalOffset,
      color: 'black'
    });

    this.texts.push({
      x: this.offset,
      y: 0.05 + this.verticalOffset,
      text: "0"
    });

    // draw markers for increments of 100 amino acids

    for (var i = 0; i < (length + 1); i++) {
      if ((i % 100) === 0) {
        this.lines.push({
          x0: this.offset + (i / this.normalize * 0.9),
          x1: this.offset + (i / this.normalize * 0.9),
          y0: 0.175 + this.verticalOffset,
          y1: 0.2 + this.verticalOffset,
          color: 'black'
        });
      }
    }

    // right marker

    this.lines.push({
      x0: this.offset + this.proteinFrameLength,
      x1: this.offset + this.proteinFrameLength,
      y0: 0.15 + this.verticalOffset,
      y1: 0.2 + this.verticalOffset,
      color: 'black'
    });

    this.texts.push({
      x: this.offset+this.proteinFrameLength,
      y: 0.05 + this.verticalOffset,
      text: length
    });
  }

  drawMainBody() {
    // main protein frame

    this.body.push({
      type: 'rect',
      x: this.offset,
      y: 0.45,
      width: this.proteinFrameLength,
      height: 0.1,
      stroke: 'black'
    });

    // this.ax.text(
    //     0.5,
    //     0.95,
    //     name_symbols,
    //     horizontalalignment='center',
    //     fontsize=this.fontsize
    // )
    //
    // this.ax.text(
    //     0.5,
    //     0.88,
    //     name_isoform,
    //     horizontalalignment='center',
    //     fontsize=this.fontsize-3
    // )
  }
}