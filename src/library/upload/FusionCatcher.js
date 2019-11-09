import { BaseUpload } from './BaseUpload';

export class FusionCatcher extends BaseUpload {
  constructor(file) {
    super(file);
  }

  async parse() {

    const lines = await this.preprocess();

    this.fusions = lines.map((val, i) => {

      const line = val.split('\t').map(val => val.trim());

      if (val.startsWith('Gene_1_symbol')) {

        this.checkColumnHeader(line, i, 8, 'Fusion_point_for_gene_1(5end_fusion_partner)');
        this.checkColumnHeader(line, i, 9, 'Fusion_point_for_gene_2(3end_fusion_partner)');
        this.checkColumnHeader(line, i, 10, 'Gene_1_id(5end_fusion_partner)');
        this.checkColumnHeader(line, i, 11, 'Gene_2_id(3end_fusion_partner)');

        return null;
      }

      const gene1 = line[10];
      const gene1Pos = line[8].split(':')[1];
      const gene2 = line[11];
      const gene2Pos = line[9].split(':')[1];

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