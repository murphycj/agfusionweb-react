import { Transcript } from './Transcript';

export class Gene {
  constructor(data) {

    this.biotype = data.biotype.S;
    this.contig = data.contig.S;
    this.start = parseInt(data.start.N);
    this.end = parseInt(data.end.N);
    this.is_protein_coding = data.is_protein_coding.BOOL;
    this.name = data.name.S;
    this.strand = data.strand.S;
    this.transcripts = [];

    for (var transcript in data.transcripts.M) {
      this.transcripts.push(new Transcript(data.transcripts.M[transcript].M));
    }
  }

  isIn(position) {
    if (position >= this.start && position <= this.end) {
      return true;
    }
    return false;
  }
}