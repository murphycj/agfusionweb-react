
import { CODING_COMBINATIONS, PDBS, molecularWeight, translate  } from '../utils/utils';

const MIN_DOMAIN_LENGTH = 5;

export class FusionTranscript {
  constructor(transcript1, transcript2, gene1Junction, gene2Junction) {
    this.transcript1 = transcript1;
    this.transcript2 = transcript2;
    this.gene1Junction = gene1Junction;
    this.gene2Junction = gene2Junction;
    this.canonical = this.transcript1.canonical && this.transcript2.canonical;

    this.displayData = {
      gene1: {
        geneName: this.transcript1.geneName,
        id: this.transcript1.id,
        name: this.transcript1.name,
        biotype: this.transcript1.biotype,
        complete: this.transcript1.complete,
        cdnaLength: this.transcript1.cdnaLength,
        cdsLength: this.transcript1.cdsLength,
        proteinLength: this.transcript1.proteinLength
      },
      gene2: {
        geneName: this.transcript2.geneName,
        id: this.transcript2.id,
        name: this.transcript2.name,
        biotype: this.transcript2.biotype,
        complete: this.transcript2.complete,
        cdnaLength: this.transcript2.cdnaLength,
        cdsLength: this.transcript2.cdsLength,
        proteinLength: this.transcript2.proteinLength
      }
    };

    this.name = this.transcript1.name && this.transcript2.name ?
      this.transcript1.name + ' : ' + this.transcript2.name :
      this.transcript1.id + ' : ' + this.transcript2.id;

    this.id =  this.transcript1.id + ' : ' + this.transcript2.id;

    this.effect = '';
    this.gene1JunctionLoc = null;
    this.gene2JunctionLoc = null;
    this.hasProteinCodingPotential = false;

    // cDNA stuff

    this.cdnaSeq = '';
    this.cdnaGene1Seq = '';
    this.cdnaGene2Seq = '';
    this.cdnaGene1Len = 0;
    this.cdnaGene2Len = 0;
    this.cdnaJunctionGene1 = 0;
    this.cdnaJunctionGene2 = 0;
    this.cdnaIntervalsGene1 = [];
    this.cdnaIntervalsGene2 = [];

    // CDS stuff

    this.cdsSeq = '';
    this.cdsGene1Seq = '';
    this.cdsGene2Seq = '';
    this.cdsGene1Len = 0;
    this.cdsGene2Len = 0;
    this.cdsJunctionGene1 = 0;
    this.cdsJunctionGene2 = 0;
    this.cdsIntervalsGene1 = [];
    this.cdsIntervalsGene2 = [];

    // protein stuff

    this.proteinSeq = '';
    this.proteinSeqLen = null;
    this.molecularWeight = null;
    this.proteinJunctionGene1 = 0;
    this.proteinJunctionGene2 = 0;
    this.proteinDomains = {};

    this.hasError = false;

    // predict the fusion

    if (this.effect !== 'out-of-gene-boundary') {
      this.effect = 'Unknown';
      this.predict();
    }
  }

  predict() {

    this.gene1JunctionLoc = this.transcript1.getFeatureOfPosition(this.gene1Junction);
    this.gene2JunctionLoc = this.transcript2.getFeatureOfPosition(this.gene2Junction);
    this.fetchCdna();

    // get if has coding potential

    this.hasProteinCodingPotential = CODING_COMBINATIONS[this.gene1JunctionLoc][this.gene2JunctionLoc]['protein_coding_potential'] || false;


    // check if they don't have stop and/or start codons

    var reasons = [];

    if (!this.transcript1.hasStartCodon) {
      this.hasProteinCodingPotential=false;
      reasons.push("no known 5' transcript start codon");
    }
    if (!this.transcript1.hasStopCodon) {
      this.hasProteinCodingPotential=false;
      reasons.push("no known 5' transcript stop codon");
    }

    if (!this.transcript2.hasStartCodon) {
      this.hasProteinCodingPotential=false;
      reasons.push("no known 3' transcript start codon");
    }
    if (!this.transcript2.hasStopCodon) {
      this.hasProteinCodingPotential=false;
      reasons.push("no known 3' transcript stop codon");
    }

    // if the fusion transcript has coding potential then
    // fetch its CDS and protein sequences and annotate it

    if (this.hasProteinCodingPotential) {
      this.fetchCds();
      this.fetchProtein();
      this.annotate();
    }
  }

  fetchCdna() {


    // get the 5prime transcript sequence and determine if junction is
    // within intron

    var exons = this.transcript1.exons;
    var nMax = exons.length;

    if (this.transcript1.strand == '+') {
      for (var i = 0; i < exons.length; i++) {

        // get the exon intervals

        if (this.gene1Junction >= exons[i][1]) {
          this.cdnaJunctionGene1 += (exons[i][1] - exons[i][0] + 1);
          this.cdnaIntervalsGene1.push([
            exons[i][0],
            exons[i][1],
            i+1
          ]);
        } else if (this.gene1Junction <= exons[i][0]) {
          break;
        } else {
          this.cdnaJunctionGene1 += (this.gene1Junction - exons[i][0] + 1);
          this.cdnaIntervalsGene1.push([
            exons[i][0],
            this.gene1Junction,
            i+1
          ]);
          break
        }
      }
    } else {

      for (var i = 0; i < exons.length; i++) {

        // get sequence

        if (this.gene1Junction <= exons[i][0]) {
          this.cdnaJunctionGene1 += (exons[i][1] - exons[i][0] + 1);
          this.cdnaIntervalsGene1.push([
            exons[i][0],
            exons[i][1],
            i+1
          ]);
        } else if (this.gene1Junction >= exons[i][1]) {
          break;
        } else {
          this.cdnaJunctionGene1 += (exons[i][1] - this.gene1Junction + 1);
          this.cdnaIntervalsGene1.push([
            this.gene1Junction,
            exons[i][1],
            i+1
          ]);
        }
      }
    }

    // get the 3prime transcript sequence and determine if junction is
    // within intron

    exons = this.transcript2.exons;
    nMax = exons.length;

    if (this.transcript2.strand == '+') {
      for (var i = 0; i < exons.length; i++) {

        // get the exons in the fusion

        if (this.gene2Junction >= exons[i][1]) {
          continue;
        } else if (this.gene2Junction <= exons[i][0]) {
          this.cdnaIntervalsGene2.push([
            exons[i][0],
            exons[i][1],
            i+1
          ]);
        } else {
          this.cdnaIntervalsGene2.push([
            this.gene2Junction,
            exons[i][1],
            i+1
          ]);
        }
      }

      for (var i = 0; i < exons.length; i++) {

        // get sequence

        if (this.gene2Junction >= exons[i][1]) {
          this.cdnaJunctionGene2 += (exons[i][1] - exons[i][0] + 1);
        } else if (this.gene2Junction <= exons[i][0]) {
          break;
        } else {
          this.cdnaJunctionGene2 += (this.gene2Junction - exons[i][0]);
        }
      }
    } else {

        // get the exons in the fusion

      for (var i = 0; i < exons.length; i++) {

        if (this.gene2Junction <= exons[i][0]) {
          continue
        } else if (this.gene2Junction >= exons[i][1]) {
          this.cdnaIntervalsGene2.push([
              exons[i][0],
              exons[i][1],
              i+1
          ]);
        } else {
          this.cdnaIntervalsGene2.push([
              exons[i][0],
              this.gene2Junction,
              i+1
          ]);
        }
      }

      for (var i = 0; i < exons.length; i++) {
        // get sequence

        if (this.gene2Junction <= exons[i][0]) {
          this.cdnaJunctionGene2 += (exons[i][1] - exons[i][0] + 1);
        } else if (this.gene2Junction >= exons[i][1]) {
          break;
        } else {
          this.cdnaJunctionGene2 += (exons[i][1] - this.gene2Junction);
        }
      }
    }

    // get the cdna and their lengths

    this.cdnaGene1Seq = this.transcript1.cdnaSeq.slice(0, this.cdnaJunctionGene1);
    this.cdnaGene2Seq = this.transcript2.cdnaSeq.slice(this.cdnaJunctionGene2);
    this.cdnaSeq = this.cdnaGene1Seq + this.cdnaGene2Seq;

    this.cdnaGene1Len = this.cdnaJunctionGene1;
    this.cdnaGene2Len = this.transcript2.cdnaLength - this.cdnaJunctionGene2;
  }

  fetchCds() {

    var cds = this.transcript1.cds;

    // 5prime transcript

    if (this.transcript1.strand == "+") {
      for (var i = 0; i < cds.length; i++) {
        if (this.gene1Junction >= cds[i][1]) {
          this.cdsJunctionGene1 += (cds[i][1] - cds[i][0] + 1);
        } else if (this.gene1Junction <= cds[i][0]) {
          break;
        } else {
          this.cdsJunctionGene1 += (this.gene1Junction - cds[i][0] + 1);
          break;
        }
      }
    } else {
      for (var i = 0; i < cds.length; i++) {
        if (this.gene1Junction <= cds[i][0]) {
          this.cdsJunctionGene1 += (cds[i][1] - cds[i][0] + 1);
        } else if (this.gene1Junction >= cds[i][1]) {
          break;
        } else {
          this.cdsJunctionGene1 += (cds[i][1] - this.gene1Junction + 1);
        }
      }
    }

    cds = this.transcript2.cds;

    if (this.transcript2.strand == "+") {
      for (var i = 0; i < cds.length; i++) {
        if (this.gene2Junction >= cds[i][1]) {
          this.cdsJunctionGene2 += (cds[i][1] - cds[i][0] + 1);
        } else if (this.gene2Junction <= cds[i][0]) {
          break;
        } else {
          this.cdsJunctionGene2 += (this.gene2Junction - cds[i][0]);
        }
      }
    } else {
      for (var i = 0; i < cds.length; i++) {
        if (this.gene2Junction <= cds[i][0]) {
          this.cdsJunctionGene2 += (cds[i][1] - cds[i][0] + 1);
        } else if (this.gene2Junction >= cds[i][1]) {
          break;
        } else {
          this.cdsJunctionGene2 += (cds[i][1] - this.gene2Junction);
        }
      }
    }

    // get the cds and their lengthslengths of the cDNA segments

    this.cdsGene1Seq = this.transcript1.cdsSeq.slice(0, this.cdsJunctionGene1);
    this.cdsGene2Seq = this.transcript2.cdsSeq.slice(this.cdsJunctionGene2);
    this.cdsSeq = this.cdsGene1Seq + this.cdsGene2Seq;

    this.cdsGene1Len = this.cdsGene1Seq.length;
    this.cdsGene2Len = this.cdsGene2Seq.length;
  }

  fetchProtein() {

    this.proteinJunctionGene1 = parseInt(this.cdsJunctionGene1 / 3);

    if (Number.isInteger(this.cdsGene1Len/3) && (Number.isInteger(this.cdsGene2Len/3))) {
      this.effect='in-frame';
      this.proteinJunctionGene2 = parseInt(this.cdsJunctionGene2/3)
    } else if (Number.parseFloat(((this.cdsGene1Len/3 % 1) + (this.cdsGene2Len/3 % 1)).toPrecision(3)) == 1.0) {
      this.effect = 'in-frame (with mutation)';
      this.proteinJunctionGene2 = parseInt(this.cdsJunctionGene2/3)
    } else {
      this.effect = 'out-of-frame';
    }

    // check if CDS's length is multiple of 3, if not then print warning

    if (this.effect == 'in-frame' && (this.cdsSeq.length % 3) != 0) {
      console.log('fusion is in-frame but cds is not a multiple of 3!');
    }

    // translate CDS into protein and remove everything after the stop codon

    if (this.effect == 'out-of-frame') {

      // trim the CDS sequence if fusion is out-of-frame

      var cdsTrimmed = this.cdsSeq.slice(0, 3 * parseInt(this.cdsSeq.length/3));

      this.proteinSeq = translate(cdsTrimmed);
      this.proteinSeq = this.proteinSeq.slice(0, this.proteinSeq.indexOf('*'));
    } else {
      this.proteinSeq = translate(this.cdsSeq)
      this.proteinSeq = this.proteinSeq.slice(0, this.proteinSeq.indexOf('*'));
    }

    this.proteinSeqLen = this.proteinSeq.length;

    // predict molecular weight

    this.molecularWeight = molecularWeight(this.proteinSeq);


  }

  annotate() {
    // Annotate the gene fusion's protein using the protein annotaiton
    // from its two genes
    //
    // domain format: [id, start, end, description, name]
    //

    var domains = [];
    var domain = null;

    for (var j = 0; j < PDBS.length; j++) {
      var pdb = PDBS[j];

      this.proteinDomains[pdb] = [];

      // gene1 domains

      for (var i = 0; i < this.transcript1.proteinDomains[pdb].length; i++) {

        domain = this.transcript1.proteinDomains[pdb][i];

        if (this.proteinJunctionGene1 < domain.start) {
          continue;
        } else if (this.proteinJunctionGene1 >= domain.end) {

          this.proteinDomains[pdb].push(domain);

        } else if ((this.proteinJunctionGene1 - domain.start) >= MIN_DOMAIN_LENGTH) {

          domain.end = this.proteinJunctionGene1;
          this.proteinDomains[pdb].push(domain);
        }
      }

      // only find the 3' gene partner's domains if the fusion is in-frame

      if (this.effect != 'out-of-frame') {

        for (var i = 0; i < this.transcript2.proteinDomains[pdb].length; i++) {

          domain = this.transcript2.proteinDomains[pdb][i];

          if (this.proteinJunctionGene2 > domain.end) {
              continue
          } else if (this.proteinJunctionGene2 <= domain.start) {

            domain.start = (domain.start - this.proteinJunctionGene2) + this.proteinJunctionGene1;
            domain.end = (domain.end - this.proteinJunctionGene2) + this.proteinJunctionGene1;

            this.proteinDomains[pdb].push(domain);

          } else {

            domain.start = this.proteinJunctionGene1;
            domain.end = (domain.end - this.proteinJunctionGene2) + this.proteinJunctionGene1;
            this.proteinDomains[pdb].push(domain);
          }
        }
      }
    }
  }
}