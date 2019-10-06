import { FusionTranscript } from './FusionTranscript';

export class Fusion {
  constructor(gene1, gene2, gene1Junction, gene2Junction) {
    this.gene1 = gene1;
    this.gene2 = gene2;
    this.gene1Junction = gene1Junction;
    this.gene2Junction = gene2Junction;

    this.name = this.gene1.name && this.gene2.name ?
      this.gene1.name + '_' + this.gene2.name :
      this.gene1.id + '_' + this.gene2.id;

    this.transcripts = {};

    for (var i = 0; i < this.gene1.transcripts.length; i++) {
      for (var j = 0; j < this.gene2.transcripts.length; j++) {

        var transcript = new FusionTranscript(
          this.gene1.transcripts[i],
          this.gene2.transcripts[j],
          gene1Junction,
          gene2Junction);

        if (!this.gene1.transcripts[i].contains(gene1Junction) || !this.gene2.transcripts[j].contains(gene2Junction)) {
          transcript.effect = 'OGB';
        } else {

          this.transcripts[transcript.name] = transcript;
        }

      }
    }
  }
}