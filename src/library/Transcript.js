
export class Transcript {
  constructor(id, data) {
    this.id = id;
    this.biotype = data.biotype.S;
    this.complete = data.complete.BOOL;
    this.has_start_codon = data.has_start_codon.BOOL;
    this.has_stop_codon = data.has_stop_codon.BOOL;
    this.start = parseInt(data.start.N);
    this.end = parseInt(data.end.N);
    this.is_protein_coding = data.is_protein_coding.BOOL;
    this.name = data.name.S;

    this.exons = data.exons.L.map((val) => {
      return val.L.map((val2) => {
        return parseInt(val2.N);
      });
    })

    if ('coding' in data) {
      this.coding = data.coding.L.map((val) => {
        return val.L.map((val2) => {
          return parseInt(val2.N);
        });
      })
    }
  }

  contains(position) {
    if (position >= this.start && position <= this.end) {
      return true;
    }
    return false;
  }

}