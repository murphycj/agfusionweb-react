import { BaseUpload } from "./BaseUpload";

export class EricScript extends BaseUpload {
  constructor(file) {
    super(file);
  }

  async parse() {
    const lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {
      const line = val.split("\t").map((val) => val.trim());

      if (!this.areThereEnoughColumns(i, 10, line)) {
        return;
      }

      if (val.startsWith("GeneName1")) {
        this.checkColumnHeader(line, i, 3, "Breakpoint1");
        this.checkColumnHeader(line, i, 6, "Breakpoint2");
        this.checkColumnHeader(line, i, 8, "EnsemblGene1");
        this.checkColumnHeader(line, i, 9, "EnsemblGene2");

        return null;
      }

      const gene1 = [line[8]];
      const gene1Pos = line[3];
      const gene2 = [line[9]];
      const gene2Pos = line[6];

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
