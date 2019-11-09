import { BaseUpload } from './BaseUpload';

export class MapSplice extends BaseUpload {
  constructor(file) {
    super(file);
  }

  async parse() {

    const lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {

      const line = val.split('\t').map(val => val.trim());

      if (val.startsWith('chrom')) {

        this.checkColumnHeader(line, i, 1, 'doner_end');
        this.checkColumnHeader(line, i, 2, 'acceptor_start');
        this.checkColumnHeader(line, i, 60, 'annotated_gene_donor');
        this.checkColumnHeader(line, i, 61, 'annotated_gene_acceptor');

        return null;
      }

      const gene1 = [line[60]];
      const gene1Pos = line[1];
      const gene2 = [line[61]];
      const gene2Pos = line[2];

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