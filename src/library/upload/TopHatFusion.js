import { BaseUpload } from './BaseUpload';

export class TopHatFusion extends BaseUpload {
  constructor(file) {
    super(file);
  }

  async parse() {

    const lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {

      const line = val.split('\t').map(val => val.trim());

      const gene1 = line[1];
      const gene1Pos = line[3];
      const gene2 = line[4];
      const gene2Pos = line[6];

      if (this.validateData(i, gene1, gene1Pos, gene2, gene2Pos)) {
        return {
          gene1: gene1,
          gene1Pos: gene1Pos,
          gene2: gene2,
          gene2Pos: gene2Pos
        };
      } else {
        return null;
      }
    });

    this.fusions = this.fusions.filter(val => val);

  }
}