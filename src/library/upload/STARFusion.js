import { BaseUpload } from "./BaseUpload";

export class STARFusion extends BaseUpload {
  constructor(file) {
    super(file);
  }

  async parse() {
    const lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {
      const line = val.split("\t").map((val) => val.trim());

      if (!this.areThereEnoughColumns(i, 8, line)) {
        return;
      }

      if (val.startsWith("#")) {
        if (line[0] !== "#FusionName" && line[0] !== "#fusion_name") {
          this.addErrorMsg(
            i + 1,
            `Expected first line to start with #FusionName or #fusion_name.`
          );
        }

        this.checkColumnHeader(line, i, 4, "LeftGene");
        this.checkColumnHeader(line, i, 5, "LeftBreakpoint");
        this.checkColumnHeader(line, i, 6, "RightGene");
        this.checkColumnHeader(line, i, 7, "RightBreakpoint");

        return null;
      }

      var gene1 = line[4].split("^")[1];

      if (gene1 === undefined) {
        this.addErrorMsg(
          i + 1,
          `For gene1, expected symbol followed by ensemble ID, separated by ^ (e.g. ACACA^ENSG00000132142.15)`
        );
        return null;
      }

      var gene2 = line[6].split("^")[1];

      if (gene2 === undefined) {
        this.addErrorMsg(
          i + 1,
          `For gene2, expected symbol followed by ensemble ID, separated by ^ (e.g. ACACA^ENSG00000132142.15)`
        );
        return null;
      }

      gene1 = [gene1.split(".")[0]];
      const gene1Pos = line[5].split(":")[1];
      gene2 = [gene2.split(".")[0]];
      const gene2Pos = line[7].split(":")[1];

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
