import { BaseUpload } from './BaseUpload';

export class STARFusion extends BaseUpload {
  constructor(file) {
    super(file);
  }

  async parse() {

    const lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {

      const line = val.split('\t').map(val => val.trim());
      console.log(line)

      if (val.startsWith('#')) {

        if (line[0] !== '#FusionName' && line[0] !== '#fusion_name') {
          this.addErrorMsg(
            i+1,
            `Expected first line to start with #FusionName or #fusion_name.`);
        }

        if (line[4] !== 'LeftGene') {
          this.addErrorMsg(i+1, 'Expected column 5 to be LeftGene');
        } else if (line[5] !== 'LeftBreakpoint') {
          this.addErrorMsg(i+1, 'Expected column 6 to be LeftGene');
        } else if (line[6] !== 'RightGene') {
          this.addErrorMsg(i+1, 'Expected column 7 to be RightGene');
        } else if (line[7] !== 'RightBreakpoint') {
          this.addErrorMsg(i+1, 'Expected column 8 to be RightBreakpoint');
        }

        return null;
      }

      const gene1 = line[4].split('^')[1].split('.')[0];
      const gene1Pos = line[5].split(':')[1];
      const gene2 = line[6].split('^')[1].split('.')[0];
      const gene2Pos = line[7].split(':')[1];

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