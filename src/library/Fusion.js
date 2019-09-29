import { FusionTranscript } from './FusionTranscript';

export class Fusion {
  constructor(gene1, gene2, gene1_junction, gene2_junction) {
    this.gene1 = gene1;
    this.gene2 = gene2;
    this.gene1_junction = gene1_junction;
    this.gene2_junction = gene2_junction;

    this.name = this.gene1.name + '_' + this.gene2.name;
    this.transcripts = {};

    for (var i = 0; i < this.gene1.transcripts.length; i++) {
      for (var j = 0; j < this.gene2.transcripts.length; j++) {

        var transcript = new FusionTranscript(
          this.gene1.transcripts[i],
          this.gene2.transcripts[j],
          gene1_junction,
          gene2_junction);

        if (!this.gene1.transcripts[i].contains(gene1_junction) || !this.gene2.transcripts[j].contains(gene2_junction)) {
          transcript.effect = 'OGB';
        }

        this.transcripts[transcript.name] = transcript;
      }
    }
  }
}