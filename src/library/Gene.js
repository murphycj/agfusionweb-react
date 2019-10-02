import { Transcript } from './Transcript';

export class Gene {
  constructor(id, data) {
    this.id = id;
    this.biotype = data.biotype.S;
    this.contig = data.contig.S;
    this.start = parseInt(data.start.N);
    this.end = parseInt(data.end.N);
    this.isProteinCoding = data.is_protein_coding.BOOL || false;
    this.name = data.name.S || this.id;
    this.strand = data.strand.S;
    this.transcripts = [];

    for (var transcript in data.transcripts.M) {
      this.transcripts.push(new Transcript(transcript, data.transcripts.M[transcript].M, this.strand));
    }
  }

  contains(position) {
    if (position >= this.start && position <= this.end) {
      return true;
    }
    return false;
  }
}