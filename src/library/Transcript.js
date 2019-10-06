import { PDBS } from './utils';

export class Transcript {
  constructor(id, data, strand) {
    this.id = id;
    this.biotype = data.biotype.S || '';
    this.complete = data.complete.BOOL || false;
    this.canonical = data.canonical.BOOL || false;
    this.hasStartCodon = data.has_start_codon.BOOL || false;
    this.hasStopCodon = data.has_stop_codon.BOOL || false;
    this.fivePrimeUtrLen = parseInt(data.five_prime_utr_len.N) || 0;
    this.threePrimeUtrLen = parseInt(data.three_prime_utr_len.N) || 0;

    this.start = parseInt(data.start.N);
    this.end = parseInt(data.end.N);
    this.strand = strand;
    this.length = this.end - this.start;
    this.cdsLength = null;
    this.cdnaLength = null;
    this.proteinLength = null;
    this.cds = null;
    this.exons = null;

    this.isProteinCoding = data.is_protein_coding.BOOL || false;
    this.name = data.name.S || this.id;
    this.proteinId = data.protein_id.S;
    this.proteinDomains = {};
    for (var i = 0; i < PDBS.length; i++) {
      this.proteinDomains[PDBS[i]] = [];
    }

    this.hasError = false;

    this.parseExons(data);
    this.getLengths();
    this.parseDomains(data);
  }

  parseDomains(data) {
    var domain = null;

    if (!('M' in data.domains)) {
      return;
    }

    for (var i = 0; i < PDBS.length; i++) {
      var pdb = PDBS[i];
      this.proteinDomains[PDBS[i]] = [];

      if (data.domains.M[pdb].L.length > 0) {
        this.proteinDomains[pdb] = data.domains.M[pdb].L.map((val) => [
          val.L[0].S,
          parseInt(val.L[1].N) || 0,
          parseInt(val.L[2].N) || 0,
          val.L[3].S || '',
          val.L[4].S || ''
        ]);
      }
    }
  }

  parseExons(data) {
    this.exons = data.exons.L.map((val) => {
      return val.L.map((val2) => {
        return parseInt(val2.N);
      });
    })

    if ('coding' in data) {
      this.cds = data.coding.L.map((val) => {
        return val.L.map((val2) => {
          return parseInt(val2.N);
        });
      })
    } else {
      this.complete = false;
    }
  }

  getLengths() {
    this.cdnaLength = this.exons.map((exon) => exon[1] - exon[0] + 1).reduce((a,b) => a+b);

    if (this.cds) {
      this.cdsLength = this.cds.map((cds_i) => cds_i[1] - cds_i[0] + 1).reduce((a,b) => a+b);
      if ((this.cdsLength % 3) != 0) {
        console.log(this.id);
      }
      this.proteinLength = parseFloat((this.cdsLength / 3).toFixed(2));
    }
  }

  contains(position) {
    if (position >= this.start && position <= this.end) {
      return true;
    }
    return false;
  }

}