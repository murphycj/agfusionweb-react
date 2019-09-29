
export class FusionTranscript {
  constructor(transcript1, transcript2, gene1_junction, gene2_junction) {
    this.transcript1 = transcript1;
    this.transcript2 = transcript2;
    this.gene1_junction = gene1_junction;
    this.gene2_junction = gene2_junction;

    this.name = this.transcript1.id + '_' + this.transcript2.id;
    this.effect = '';
  }
}