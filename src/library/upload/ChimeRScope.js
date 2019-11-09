import { BaseUpload } from './BaseUpload';

export class ChimeRScope extends BaseUpload {
  constructor(file) {
    super(file);
  }

  async parse() {

    const lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {

      const line = val.split('\t').map(val => val.trim());

      if (val.startsWith('ConfidentScore')) {

        this.checkColumnHeader(line, i, 2, 'Gene1');
        this.checkColumnHeader(line, i, 4, 'Gene2');
        this.checkColumnHeader(line, i, 7, 'Gene1_fusionPoint');
        this.checkColumnHeader(line, i, 9, 'Gene2_fusionPoint');

        return null;
      }

      const gene1 = line[2];
      const gene1Pos = line[7];
      const gene2 = line[4];
      const gene2Pos = line[9];

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