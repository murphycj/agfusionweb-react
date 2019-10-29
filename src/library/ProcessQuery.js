import { DynamoDB } from './DynamoDB';
import { Gene } from './Gene';

export class ProcessQuery {
  constructor() {
    this.ddb = new DynamoDB();
  }

  async _getSequenceData(gene, speciesRelease) {
    // fetch the sequences

    var seqs = await this.ddb.getSequences(gene.getSeqIds(), speciesRelease);

    gene.parseSeqs(seqs);

    return gene;
  }

  async _getGeneData(gene, speciesRelease) {

    var ensemblIds = gene.ensembl_gene_id.S.split(';');
    var geneData = [];

    for (var i = 0; i < ensemblIds.length; i++) {
      var geneData_i = await this.ddb.getGene(ensemblIds[i], speciesRelease);
      if (geneData_i !== undefined) {
        geneData.push(new Gene(ensemblIds[i], geneData_i));
      }
    }

    return geneData;
  }

  async _validateGene(gene_id, speciesRelease) {

    var gene = null;

    if (gene_id.match(/^ENS.*G/)) {
      gene = await this.ddb.getGene(gene_id, speciesRelease);
      gene = {ensembl_gene_id: {S: gene_id}};
    } else {
      gene = await this.ddb.getGeneSynonym(gene_id, speciesRelease);
    }


    if (gene === undefined) {
      // if it did not find anything, then look on
      return
    } else {
      return gene;
    }
  }
}