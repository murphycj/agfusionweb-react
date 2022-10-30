import { BaseUpload } from "./BaseUpload";

export class FusionMap extends BaseUpload {
  constructor(file) {
    super(file);
  }

  async parse() {
    const lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {
      const line = val.split("\t").map((val) => val.trim());

      if (!this.areThereEnoughColumns(i, 14, line)) {
        return;
      }

      if (val.startsWith("FusionID")) {
        this.checkColumnHeader(line, i, 6, "Position1");
        this.checkColumnHeader(line, i, 8, "Position2");
        this.checkColumnHeader(line, i, 9, "KnownGene1");
        this.checkColumnHeader(line, i, 13, "KnownGene2");

        return null;
      }

      const gene1 = [line[9]];
      const gene1Pos = line[6];
      const gene2 = [line[13]];
      const gene2Pos = line[8];

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
