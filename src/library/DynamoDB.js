var AWS = require('aws-sdk');
// Set the region
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'AKIAUPO5FHV4W3M3JINV',
  secretAccessKey: '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'
});


export class DynamoDB {
  constructor() {
    this.ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
  }

  getGene(gene_id) {

    var params = {
      TableName: 'agfusion_genes',
      Key: {
        'id': {S: gene_id},
        'species_release': {S: 'homo_sapiens_94'}
      }
    };
    var self = this;

    return new Promise(function(resolve, reject) {
      self.ddb.getItem(params, function(err, data) {
        if (err) {
          console.log("Error", err);
          resolve();
        } else {
          resolve(data.Item)
        }
      });
    })
  }

  getGeneSynonym(gene_id) {

    var params = {
      TableName: 'agfusion_gene_synonyms',
      Key: {
        'gene_id': {S: gene_id},
        'species_release': {S: 'homo_sapiens_94'}
      }
    };
    var self = this;

    return new Promise(function(resolve, reject) {
      self.ddb.getItem(params, function(err, data) {
        if (err) {
          console.log("Error", err);
          resolve();
        } else {
          resolve(data.Item)
        }
      });
    })
  }
}