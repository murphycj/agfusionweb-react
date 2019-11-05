
export class Download {
  constructor(zip, fusions, params={fasta: true, fusionCsv: true, proteinCsv: true, exonCsv: true}) {
    this.zip = zip;
    this.fusions = fusions;

    Object.keys(this.fusions).map(val => {

      if (this.fusions[val].errorMsg) {
        return null;
      }

      var fusionFolder = this.fusions[val].name;

      if (params.fasta) {
        this.prepFasta(fusionFolder, this.fusions[val].transcripts);
      }

      if (params.fusionCsv) {
        this.prepFusionCsv(fusionFolder, this.fusions[val].transcripts);
      }

      if (params.proteinCsv) {
        this.prepProteinCsv(fusionFolder, this.fusions[val].transcripts);
      }

      if (params.exonCsv) {
        this.prepExonCsv(fusionFolder, this.fusions[val].transcripts);
      }
    })
  }

  prepFasta(fusionFolder, fusionIsoforms) {

    var cdnaSeqs = [];
    var cdsSeqs = [];
    var proteinSeqs = [];

    Object.keys(fusionIsoforms).map(val => {

      var iso = fusionIsoforms[val];

      cdnaSeqs.push(`>${val} ${iso.name}\n${iso.cdnaSeq}`);

      if (iso.hasProteinCodingPotential) {
        cdsSeqs.push(`>${val} ${iso.name}\n${iso.cdsSeq}`);
        proteinSeqs.push(`>${val} ${iso.name}\n${iso.proteinSeq}`);
      }
    });

    if (cdnaSeqs.length > 0) {
      this.zip.folder('fusions').folder(fusionFolder).file('cDNA-fusion.fa', cdnaSeqs.join('\n'));
    }

    if (cdsSeqs.length > 0) {
      this.zip.folder('fusions').folder(fusionFolder).file('CDS-fusion.fa', cdsSeqs.join('\n'));
    }

    if (proteinSeqs.length > 0) {
      this.zip.folder('fusions').folder(fusionFolder).file('protein-fusion.fa', proteinSeqs.join('\n'));
    }
  }

  prepFusionCsv(fusionFolder, fusionIsoforms) {

    var lines = [];

    Object.keys(fusionIsoforms).map(val => {
      var fusion = fusionIsoforms[val];

      var values = [
        fusion.transcript1.geneName,
        fusion.transcript1.geneId,
        fusion.transcript1.name,
        fusion.transcript1.id,
        fusion.gene1Junction,
        fusion.gene1JunctionLoc,
        fusion.transcript2.geneName,
        fusion.transcript2.geneId,
        fusion.transcript2.name,
        fusion.transcript2.id,
        fusion.gene2Junction,
        fusion.gene2JunctionLoc,
        fusion.cdnaSeq.length,
        fusion.cdsSeq.length || '',
        fusion.proteinSeq.length || '',
        fusion.effect,
        fusion.hasProteinCodingPotential ? 'Yes' : 'Unknown',
        fusion.molecularWeight || ''
      ];

      lines.push(values.join(','));
    }

    );

    if (lines.length > 0) {
      var header = ['Gene1_name', 'Gene1_ID', 'Gene1_transcript_name', 'Gene1_transcript_id', 'Gene1_junction', 'Gene1_feature_location'];
      header.push(['Gene2_name', 'Gene2_ID', 'Gene2_transcript_name', 'Gene2_transcript_id', 'Gene2_Junction', 'Gene2_feature_location']);
      header.push(['cDNA_length', 'CDS_length', 'Protein_length', 'Protein_effect', 'Has_protein_coding_potential', 'Molecular_weight (kD)']);

      lines.unshift(header.join(','));

      this.zip.folder('fusions').folder(fusionFolder).file('fusion-isoforms.csv', lines.join('\n'));
    }
  }

  prepProteinCsv(fusionFolder, fusionIsoforms) {
    var lines = [];

    Object.keys(fusionIsoforms).map(val => {
      var fusion = fusionIsoforms[val];

      if (fusion.hasProteinCodingPotential) {
        Object.keys(fusion.proteinDomains).map(pdb => {

          fusion.proteinDomains[pdb].map(domain => {
            var values = [
              fusion.name,
              fusion.id,
              pdb,
              domain.id,
              domain.name,
              domain.desc,
              domain.start,
              domain.end
            ];
            lines.push(values.join(','));
          });
        });
      }
    })

    if (lines.length > 0) {
      var header = ['Fusion_name', 'Fusion_id'];
      header.push(['Domain_database', 'Domain_id', 'Domain_name', 'Domain_description', 'Domain_start', 'Domain_end']);

      lines.unshift(header.join(','));

      this.zip.folder('fusions').folder(fusionFolder).file('fusion-protein-domains.csv', lines.join('\n'));
    }
  }

  prepExonCsv(fusionFolder, fusionIsoforms) {
    var lines = [];

    Object.keys(fusionIsoforms).map(val => {
      var fusion = fusionIsoforms[val];

      if (fusion.hasProteinCodingPotential) {
        Object.keys(fusion.proteinDomains).map(pdb => {

          fusion.proteinDomains[pdb].map(domain => {
            var values = [
              fusion.name,
              fusion.id,
              pdb,
              domain.id,
              domain.name,
              domain.desc,
              domain.start,
              domain.end
            ];
            lines.push(values.join(','));
          });
        });
      }
    })

    if (lines.length > 0) {
      var header = ['Fusion_name', 'Fusion_id'];
      header.push(['Domain_database', 'Domain_id', 'Domain_name', 'Domain_description', 'Domain_start', 'Domain_end']);

      lines.unshift(header.join(','));

      this.zip.folder('fusions').folder(fusionFolder).file('fusion-protein-domains.csv', lines.join('\n'));
    }
  }
}