var DynamoDB = require('aws-sdk/clients/dynamodb');

// Set the region and aws keys (that have read-only access to dynamodb)

export class QueryDynamoDb {
  constructor() {
    this.ddb = new DynamoDB({
      apiVersion: '2012-08-10',
      region: 'us-east-1',
      accessKeyId: ['A', 'K', 'I', 'A', 'U', 'P', 'O', '5', 'F', 'H', 'V', '4', '6', 'E', 'O', 'W', 'I', '6', 'X', 'Q'].join(''),
      secretAccessKey: ['M', 'z', 'A', '7', '2', 'H', 'H', 'Y', 'Z', 'c', 'N', 'D', '8', 'w', '7', 'I', 'P', 'x', 'Q', 'D', 'L', '7', 'n', 'm', 'j', 'h', 'w', 'x', 'H', 'O', 'u', 'F', '2', '3', '+', 'O', '5', '/', 'u', '/'].join(''),
      dynamoDbCrc32: false,
    });
  }

  getGene(gene_id, speciesRelease='homo_sapiens_94') {

    var params = {
      TableName: 'agfusion_genes',
      Key: {
        'id': {S: gene_id},
        'species_release': {S: speciesRelease}
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

  getSequences(ids, speciesRelease='homo_sapiens_94') {

    ids = ids.filter(val => val);

    var params = {
      RequestItems: {
        'agfusion_sequences': {
          Keys: ids.map((val) => {
            return {
              'id': {S: val},
              'species_release': {S: speciesRelease}
            };
          })
        }
      }
    };

    var self = this;

    return new Promise(function(resolve, reject) {
      self.ddb.batchGetItem(params, function(err, data) {
        if (err) {
          console.log("Error", err);
          resolve([]);
        } else {
          var sequences = data.Responses.agfusion_sequences || null;
          resolve(sequences);
        }
      });
    })
  }

  getGeneSynonym(gene_id, speciesRelease='homo_sapiens_94') {

    var params = {
      TableName: 'agfusion_gene_synonyms',
      Key: {
        'gene_id': {S: gene_id},
        'species_release': {S: speciesRelease}
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
