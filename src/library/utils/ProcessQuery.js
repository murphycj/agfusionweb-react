import { DynamoDB } from './DynamoDB';
import { Gene } from '../features/Gene';
import { Fusion } from '../features/Fusion';

export class ProcessQuery {
  constructor() {
    this.ddb = new DynamoDB();
  }

  createFusions(fusionData) {
    var fusions = {};

    for (var k = 0; k < fusionData.length; k++) {

      var fusionData_i = fusionData[k];

      if (fusionData_i.errorMsg && fusionData_i.errorMsg.length > 0) {

        fusions[k] = {
          ...fusionData_i,
          errorMsg: fusionData_i.errorMsg};
          
        continue;
      }

      for (var i = 0; i < fusionData_i.gene1Data.length; i++) {
        for (var j = 0; j < fusionData_i.gene2Data.length; j++) {
          var fusion = new Fusion(
            fusionData_i.gene1Data[i],
            fusionData_i.gene2Data[j],
            fusionData_i.gene1Junction,
            fusionData_i.gene2Junction
          );

          fusions[fusion.id] = fusion;
        }
      }
    }

    return fusions;
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
      return null;
    } else {
      return gene;
    }
  }
}