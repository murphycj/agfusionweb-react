import { BaseUpload } from "./BaseUpload";

export class GenericUpload extends BaseUpload {
  constructor(file, delim) {
    super(file);
    this.delim = delim;
  }

  async parse() {
    var lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {
      const line = val.split(this.delim).map((val) => val.trim());

      if (!this.areThereEnoughColumns(i, 4, line)) {
        return null;
      }

      const gene1 = line[0];
      const gene1Pos = line[1];
      const gene2 = line[2];
      const gene2Pos = line[3];

      if (this.validateData(i, gene1, gene1Pos, gene2, gene2Pos)) {
        return {
          gene1: [gene1],
          gene1Pos: gene1Pos,
          gene2: [gene2],
          gene2Pos: gene2Pos,
        };
      } else {
        return null;
      }
    });

    this.fusions = this.fusions.filter((val) => val);
  }
}
