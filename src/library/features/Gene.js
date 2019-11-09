import { Transcript } from './Transcript';

export class Gene {
  constructor(id, data) {
    this.id = id;
    this.biotype = data.biotype.S;
    this.contig = data.contig.S;
    this.start = parseInt(data.start.N) || 0;
    this.end = parseInt(data.end.N) || 0;
    this.isProteinCoding = data.is_protein_coding.BOOL || false;
    this.name = data.name.S || this.id;
    this.strand = data.strand.S;
    this.transcripts = [];

    for (var transcript in data.transcripts.M) {
      this.transcripts.push(new Transcript(transcript, data.transcripts.M[transcript].M, this.strand, this.name, this.id));
    }
  }

  contains(position) {
    if (position >= this.start && position <= this.end) {
      return true;
    }
    return false;
  }

  getSeqIds() {
    var seqIds = [];

    // get the transcript and protein sequnce ids

    for (var i = 0; i < this.transcripts.length; i++) {
      seqIds.push(this.transcripts[i].id);

      if (this.transcripts[i].proteinId !== undefined) {
        seqIds.push(this.transcripts[i].proteinId);
      }
    }

    return seqIds;
  }

  parseSeqs(seqs) {

    var seqsProcessed = {};

    for (var i = 0; i < seqs.length; i++) {
      var seqId = seqs[i].id.S;
      var seq = seqs[i].sequence.S || '';
      seqsProcessed[seqId] = seq;
    }

    // add the sequences to the transcripts

    for (var i = 0; i < this.transcripts.length; i++) {

      if (this.transcripts[i].id in seqsProcessed) {
        this.transcripts[i].cdnaSeq = seqsProcessed[this.transcripts[i].id];
        this.transcripts[i].parseSeqs();
      }

      if (this.transcripts[i].proteinId in seqsProcessed) {
        this.transcripts[i].proteinSeq = seqsProcessed[this.transcripts[i].proteinId];
      }

    }
  }
}