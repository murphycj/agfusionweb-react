import { BaseUpload } from './BaseUpload';

export class Defuse extends BaseUpload {
  constructor(file) {
    super(file);
  }

  async parse() {

    const lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {

      const line = val.split('\t').map(val => val.trim());

      if (val.startsWith('cluster_id')) {

        this.checkColumnHeader(line, i, 22, 'gene1');
        this.checkColumnHeader(line, i, 23, 'gene2');
        this.checkColumnHeader(line, i, 39, 'genomic_break_pos1');
        this.checkColumnHeader(line, i, 40, 'genomic_break_pos2');

        return null;
      }

      const gene1 = line[22];
      const gene1Pos = line[39];
      const gene2 = line[23];
      const gene2Pos = line[40];

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