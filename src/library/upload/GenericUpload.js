import { BaseUpload } from './BaseUpload';

export class GenericUpload extends BaseUpload {
  constructor(file, delim) {
    super(file);
    this.delim = delim;

  }

  async parse() {

    const lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {
      if (val.split(this.delim).length !== 4) {
        this.addErrorMsg(i+1, `does not have four values: ${val}`);
        return null;
      }

      const [ gene1, gene1Pos, gene2, gene2Pos ] = val.split(this.delim).map(val => val.trim());

      if (this.validateData(i, gene1, gene1Pos, gene2, gene2Pos)) {
        return {
          gene1: [gene1],
          gene1Pos: gene1Pos,
          gene2: [gene2],
          gene2Pos: gene2Pos
        };
      } else {
        return null;
      }
    });

    this.fusions = this.fusions.filter(val => val);

  }
}