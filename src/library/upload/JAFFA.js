import { BaseUpload } from './BaseUpload';

export class JAFFA extends BaseUpload {
  constructor(file) {
    super(file);
  }

  async parse() {

    const lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {

      const line = val.split(',').map(val => val.trim().replace(/"/g, ''));

      if (!this.areThereEnoughColumns(i, 7, line)) {
        return;
      }

      if (val.startsWith('\"sample') || val.startsWith('sample')) {

        this.checkColumnHeader(line, i, 3, 'base1');
        this.checkColumnHeader(line, i, 6, 'base2');
        this.checkColumnHeader(line, i, 1, 'fusion genes');

        return null;
      }

      const gene1 = [line[1].split(':')[0]];
      const gene1Pos = line[3];
      const gene2 = [line[1].split(':')[1]];
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
