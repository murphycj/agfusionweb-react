import { BaseUpload } from './BaseUpload';

export class FusionInspector extends BaseUpload {
  constructor(file) {
    super(file);
  }

  async parse() {

    const lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {

      const line = val.split('\t').map(val => val.trim());

      if (!this.areThereEnoughColumns(i, 9, line)) {
        return;
      }

      if (val.startsWith('#FusionName')) {

        this.checkColumnHeader(line, i, 3, 'LeftGene');
        this.checkColumnHeader(line, i, 5, 'LeftBreakpoint');
        this.checkColumnHeader(line, i, 6, 'RightGene');
        this.checkColumnHeader(line, i, 8, 'RightBreakpoint');

        return null;
      }

      const gene1 = [line[3].split('^')[1].split('.')[0]];
      const gene1Pos = line[5].split(':')[1];
      const gene2 = [line[6].split('^')[1].split('.')[0]];
      const gene2Pos = line[8].split(':')[1];

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