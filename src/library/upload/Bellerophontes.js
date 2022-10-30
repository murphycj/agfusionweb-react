import { BaseUpload } from "./BaseUpload";

export class Bellerophontes extends BaseUpload {
  constructor(file) {
    super(file);
  }

  async parse() {
    const lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {
      const line = val.split("\t").map((val) => val.trim());

      if (!this.areThereEnoughColumns(i, 12, line)) {
        return;
      }

      const gene1 = [line[0]];
      const gene1Pos = line[9];
      const gene2 = [line[4]];
      const gene2Pos = line[11];

      if (this.validateData(i, gene1, gene1Pos, gene2, gene2Pos)) {
        return {
          gene1: gene1,
          gene1Pos: gene1Pos,
          gene2: gene2,
          gene2Pos: gene2Pos,
        };
      } else {
        return null;
      }
    });

    this.fusions = this.fusions.filter((val) => val);
  }
}
