import { BaseUpload } from './BaseUpload';

export class Chimerascan extends BaseUpload {
  constructor(file) {
    super(file);
  }

  async parse() {

    const lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {

      const line = val.split('\t').map(val => val.trim());

      if (!this.areThereEnoughColumns(i, 14, line)) {
        return;
      }

      if (!this.areThereEnoughColumns(i, 14, line)) {
        return;
      }

      if (val.startsWith('#chrom5p')) {

        this.checkColumnHeader(line, i, 12, 'genes5p');
        this.checkColumnHeader(line, i, 13, 'genes3p');
        this.checkColumnHeader(line, i, 1, 'start5p');
        this.checkColumnHeader(line, i, 2, 'end5p');
        this.checkColumnHeader(line, i, 4, 'start3p');
        this.checkColumnHeader(line, i, 5, 'end3p');
        this.checkColumnHeader(line, i, 8, 'strand5p');
        this.checkColumnHeader(line, i, 9, 'strand3p');

        return null;
      }

      var gene1Pos = null;
      var gene2Pos = null;

      if (line[8] === '+') {
        gene1Pos = line[2];
      } else {
        gene1Pos = line[1];
      }

      if (line[9] === '+') {
        gene2Pos = line[4];
      } else {
        gene2Pos = line[5];
      }

      const gene1 = line[12].split(',');
      const gene2 = line[13].split(',');

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