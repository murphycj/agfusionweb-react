
export class Download {
  constructor(zip, fusions, params={fasta: true, fusionCsv: true, proteinCsv: true, exonCsv: true}) {
    this.zip = zip;
    this.fusions = fusions;

    Object.keys(this.fusions).map(val => {

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
      console.log(iso)

      cdnaSeqs.push(`>${val} ${iso.name}\n${iso.cdnaSeq}`);

      if (iso.hasProteinCodingPotential) {
        cdsSeqs.push(`>${val} ${iso.name}\n${iso.cdsSeq}`);
        proteinSeqs.push(`>${val} ${iso.name}\n${iso.proteinSeq}`);
      }
    });
    console.log(cdnaSeqs)
    console.log(cdsSeqs)
    console.log(proteinSeqs)

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

  }

  prepProteinCsv(fusionFolder, fusionIsoforms) {

  }

  prepExonCsv(fusionFolder, fusionIsoforms) {

  }
}