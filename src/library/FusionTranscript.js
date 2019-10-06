
import { CODING_COMBINATIONS, PDBS, PROTEINWEIGHT } from './utils';

const MIN_DOMAIN_LENGTH = 5;

export class FusionTranscript {
  constructor(transcript1, transcript2, gene1Junction, gene2Junction) {
    this.transcript1 = transcript1;
    this.transcript2 = transcript2;
    this.gene1Junction = gene1Junction;
    this.gene2Junction = gene2Junction;
    this.canonical = this.transcript1.canonical && this.transcript2.canonical;

    this.displayData = [
      {
        id: this.transcript1.id,
        name: this.transcript1.name,
        biotype: this.transcript1.biotype,
        complete: this.transcript1.complete,
        cdnaLength: this.transcript1.cdnaLength,
        cdsLength: this.transcript1.cdsLength,
        proteinLength: this.transcript1.proteinLength
      },
      {
        id: this.transcript2.id,
        name: this.transcript2.name,
        biotype: this.transcript2.biotype,
        complete: this.transcript2.complete,
        cdnaLength: this.transcript2.cdnaLength,
        cdsLength: this.transcript2.cdsLength,
        proteinLength: this.transcript2.proteinLength
      }
    ];

    this.name = this.transcript1.name && this.transcript2.name ?
      this.transcript1.name + ' : ' + this.transcript2.name :
      this.transcript1.id + ' : ' + this.transcript2.id;

    this.effect = '';
    this.gene1JunctionLoc = 'exon';
    this.gene2JunctionLoc = 'exon';
    this.hasProteinCodingPotential = false;

    // cDNA stuff

    this.cdna = '';
    this.cdnaGene1Seq = '';
    this.cdnaGene2Seq = '';
    this.cdnaGene1Len = 0;
    this.cdnaGene2Len = 0;
    this.cdnaJunctionGene1 = 0;
    this.cdnaJunctionGene2 = 0;
    this.cdnaIntervalsGene1 = [];
    this.cdnaIntervalsGene2 = [];

    // CDS stuff

    this.cds = '';
    this.cdsGene1Seq = '';
    this.cdsGene2Seq = '';
    this.cdsGene1Len = 0;
    this.cdsGene2Len = 0;
    this.cdsJunctionGene1 = 0;
    this.cdsJunctionGene2 = 0;
    this.cdsIntervalsGene1 = [];
    this.cdsIntervalsGene2 = [];

    // protein stuff

    this.protein = '';
    this.molecularWeight = 0;
    this.proteinJunctionGene1 = 0;
    this.proteinJunctionGene2 = 0;
    this.proteinDomains = {};

    this.hasError = false;

    // predict the fusion

    if (this.effect!='OGB') {
      this.predict();
    }
  }

  predict() {

    this.fetchCdna();

    var cds = null;
    var nMax = 0;

    if (this.transcript1.complete && (this.gene1JunctionLoc.search('UTR') == -1)) {

      cds = this.transcript1.cds;
      nMax = cds.length - 1;

      if (this.gene1JunctionLoc.search('intron') != -1) {

        // if in intron, is it between CDS regions?

        for (var i = 0; i < cds.length; i++) {

          if (this.transcript1.strand == "+") {
            if (i == 0 && this.gene1Junction < cds[i][0]) {
              this.gene1JunctionLoc = 'intron (before cds)';
              break;
            } else if (i == nMax && this.gene1Junction > cds[i][1]) {
              this.gene1JunctionLoc = 'intron (after cds)';
              break;
            }
          } else {
            if (i == 0 && this.gene1Junction > cds[i][1]) {
              this.gene1JunctionLoc = 'intron (before cds)';
              break;
            } else if (i == nMax && this.gene1Junction < cds[i][0]) {
              this.gene1JunctionLoc = 'intron (after cds)';
              break;
            }
          }

          if ((i!=0) && (i!=nMax) && (this.gene1Junction < cds[i][0] || this.gene1Junction > cds[i+1][1])) {
            this.gene1JunctionLoc='intron (cds)';
            break;
          }
        }
      } else {
        for (var i = 0; i < cds.length; i++) {
          if (this.gene1Junction >= cds[i][0] && this.gene1Junction <= cds[i][1]) {
            this.gene1JunctionLoc = 'CDS';
            break;
          }
        }

        if (this.transcript1.strand == "+") {
          if (this.gene1Junction==cds[0][0]) {
            this.gene1JunctionLoc = 'CDS (start)';
          } else if (this.gene1Junction==cds[cds.length-1][1]) {
            this.gene1JunctionLoc = 'CDS (end)';
          }
        } else {
          if (this.gene1Junction==cds[0][1]) {
            this.gene1JunctionLoc = 'CDS (start)';
          } else if (this.gene1Junction==cds[cds.length-1][0]) {
            this.gene1JunctionLoc = 'CDS (end)';
          }
        }
      }
    }

    if (this.transcript2.complete && (this.gene2JunctionLoc.search('UTR') == -1)) {

      cds = this.transcript2.cds;
      nMax = cds.length - 1;

      if (this.gene2JunctionLoc.search('intron') != -1) {

        // if in intron, is it between CDS regions?

        for (var i = 0; i < cds.length; i++) {

          if (this.transcript2.strand=="+") {
            if (i==0 && this.gene2Junction < cds[i][0]) {
              this.gene2JunctionLoc='intron (before cds)';
              break;
            } else if (i == nMax && this.gene2Junction > cds[i][1]) {
              this.gene2JunctionLoc='intron (after cds)';
              break;
            }
          } else {
            if (i == 0 && this.gene2Junction > cds[i][1]) {
              this.gene2JunctionLoc = 'intron (before cds)';
              break;
            } else if (i == nMax && this.gene2Junction < cds[i][0]) {
              this.gene2JunctionLoc = 'intron (after cds)';
              break;
            }
          }

          if ((i != 0) && (i != nMax) && (this.gene2Junction < cds[i][0] || this.gene2Junction > cds[i+1][1])) {
            this.gene2JunctionLoc = 'intron (cds)';
            break;
          }
        }

      } else {
        for (var i = 0; i < cds.length; i++) {
          if (this.gene2Junction >= cds[i][0] && this.gene2Junction <= cds[i][1]) {
            this.gene2JunctionLoc='CDS';
            break;
          }
        }

        if (this.transcript2.strand == "+") {
          if (this.gene2Junction == cds[0][0]) {
            this.gene2JunctionLoc = 'CDS (start)';
          } else if (this.gene2Junction == cds[cds.length-1][1]) {
            this.gene2JunctionLoc = 'CDS (end)';
          }
        } else {
          if (this.gene2Junction == cds[0][1]) {
            this.gene2JunctionLoc = 'CDS (start)';
          } else if (this.gene2Junction == cds[cds.length-1][0]) {
            this.gene2JunctionLoc = 'CDS (end)';
          }
        }
      }
    }

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

        // is in an intron?

        if (i == 0 && this.gene1Junction < exons[i][0]) {
          this.gene1JunctionLoc = 'intron (before cds)';
        } else if (i == (nMax-1) && this.gene1Junction > exons[i][1]) {
          this.gene1JunctionLoc = 'intron (after cds)';
        } else if (i != (nMax-1) && this.gene1Junction > exons[i][1] && this.gene1Junction < exons[n+1][0]) {
          this.gene1JunctionLoc = 'intron';
        }

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

        // is in an intron?

        if (i == 0 && this.gene1Junction > exons[i][1]) {
          this.gene1JunctionLoc = 'intron (before cds)';
        } else if (i == (nMax - 1) && this.gene1Junction < exons[i][0]) {
          this.gene1JunctionLoc = 'intron (after cds)';
        } else if (i != (nMax - 1) && this.gene1Junction < exons[i][0] && this.gene1Junction > exons[i+1][1]) {
          this.gene1JunctionLoc = 'intron';
        }

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
        // is in intron?

        if (i == 0 && this.gene2Junction < exons[i][0]) {
          this.gene2JunctionLoc = 'intron (before cds)';
        } else if (i == (nMax - 1) && this.gene2Junction > exons[i][1]) {
          this.gene2JunctionLoc = 'intron (after cds)';
        } else if (i != (nMax - 1) && this.gene2Junction > exons[i][1] && this.gene2Junction < exons[i+1][0]) {
          this.gene2JunctionLoc = 'intron';
        }

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

        // is in intron?

        if (i == 0 && this.gene2Junction > exons[i][1]) {
          this.gene2JunctionLoc = 'intron (before cds)';
        } else if (i == (nMax - 1) && this.gene2Junction < exons[i][0]) {
          this.gene2JunctionLoc = 'intron (after cds)';
        } else if (i != (nMax - 1) && this.gene2Junction < exons[i][0] && this.gene2Junction > exons[n+1][1]) {
          this.gene2JunctionLoc = 'intron';
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

    // find out if the junction on either gene is with in the 5' or 3' UTR,
    // or if it exactly at the beginning or end of the UTR

    // the 5' gene

    if (this.gene1JunctionLoc.search('intron') == -1) {

      if (this.transcript1.complete && this.cdnaJunctionGene1 < this.transcript1.fivePrimeUtrLen) {
        this.gene1JunctionLoc = '5UTR';
      } else if (this.transcript1.complete && this.cdnaJunctionGene1 == this.transcript1.fivePrimeUtrLen) {
        this.gene1JunctionLoc = '5UTR (end)';
      }

      if (this.transcript1.complete && (this.transcript1.length - this.cdnaJunctionGene1) < this.transcript1.threePrimeUtrLen) {
        this.gene1JunctionLoc = '3UTR';
      } else if (this.transcript1.complete && (this.transcript1.length - this.cdnaJunctionGene1) == this.transcript1.threePrimeUtrLen) {
        this.gene1JunctionLoc = '3UTR (start)';
      }
    }

    // the 3' gene

    if (this.gene2JunctionLoc.search('intron') == -1) {

      if (this.transcript2.complete && this.cdnaJunctionGene2 < this.transcript2.fivePrimeUtrLen) {
        this.gene2JunctionLoc = '5UTR';
      } else if (this.transcript2.complete && this.cdnaJunctionGene2 == this.transcript2.fivePrimeUtrLen) {
        this.gene2JunctionLoc = '5UTR (end)';
      }

      if (this.transcript2.complete && (this.transcript2.length - this.cdnaJunctionGene2) < this.transcript2.threePrimeUtrLen) {
          this.gene2JunctionLoc = '3UTR';
      } else if (this.transcript2.complete && (this.transcript2.length - this.cdnaJunctionGene2) == this.transcript2.threePrimeUtrLen) {
        this.gene2JunctionLoc = '3UTR (start)';
      }
    }

    // get the lengths of the cDNA segments

    this.cdnaGene1Len = this.cdnaJunctionGene1;
    this.cdnaGene2Len = this.transcript2.cdnaLength - this.cdnaJunctionGene2;

    // this.effect = this.gene1JunctionLoc + '-' + this.gene2JunctionLoc;
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

    // self.cds_5prime = self.transcript1.coding_sequence[0:self.transcript_cds_junction_5prime]

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

    // get the lengths of the cDNA segments

    this.cdsGene1Len = this.cdsJunctionGene1;
    this.cdsGene2Len = this.transcript2.cdsLength - this.cdsJunctionGene2;

    // self.cds_3prime = self.transcript2.coding_sequence[self.transcript_cds_junction_3prime::]
  }

  fetchProtein() {

    this.proteinJunctionGene1 = parseInt(this.cdsJunctionGene1 / 3);

    if (Number.isInteger(this.cdsJunctionGene1/3) && (Number.isInteger(this.cdsGene2Len/3))) {
      this.effect='in-frame';
      this.proteinJunctionGene2 = parseInt(this.cdsJunctionGene2/3)
    } else if (Math.round((this.cdsJunctionGene1/3 % 1) + (this.cdsGene2Len/3 % 1)) == 1.0) {
      this.effect = 'in-frame (with mutation)';
      this.proteinJunctionGene2 = parseInt(this.cdsJunctionGene2/3)
    } else {
      this.effect = 'out-of-frame';
    }

    // check if CDS's length is multiple of 3, if not then print warning

    // if ((len(self.cds.seq) % 3) !=0) {
    // }


    // translate CDS into protein and remove everything after the stop codon

    // if (this.effect == 'out-of-frame') {
    //
    //   // trim the CDS sequence if fusion is out-of-frame
    //
    //   seq = self.cds.seq[0:3*int(len(self.cds.seq)/3)]
    //
    //   protein_seq = seq.translate()
    //   protein_seq = protein_seq[0:protein_seq.find('*')]
    // } else {
    //   protein_seq = self.cds.seq.translate()
    //   protein_seq = protein_seq[0:protein_seq.find('*')]
    // }

    // predict molecular weight

    // self.molecular_weight = SeqUtils.molecular_weight(protein_seq)/1000.

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

        if (this.proteinJunctionGene1 < domain[1]) {
          continue;
        } else if (this.proteinJunctionGene1 >= domain[2]) {

          this.proteinDomains[pdb].push([
            domain[0], //id
            domain[4], //name
            domain[3], //desc
            domain[1], // start
            domain[2] // end
          ]);

        } else if ((this.proteinJunctionGene1 - domain[1]) >= MIN_DOMAIN_LENGTH) {

          this.proteinDomains[pdb].push([
            domain[0], //id
            domain[4], //name
            domain[3], //desc
            domain[1], // start
            this.proteinJunctionGene1 // end
          ]);
        }
      }

      // only find the 3' gene partner's domains if the fusion is in-frame

      if (this.effect != 'out-of-frame') {

        for (var i = 0; i < this.transcript2.proteinDomains[pdb].length; i++) {

          domain = this.transcript2.proteinDomains[pdb][i];

          if (this.proteinJunctionGene2 > domain[2]) {
              continue
          } else if (this.proteinJunctionGene2 <= domain[1]) {

            this.proteinDomains[pdb].push([
              domain[0], //id
              domain[4], //name
              domain[3], //desc
              (domain[1] - this.proteinJunctionGene2) + this.proteinJunctionGene1, //start
              (domain[2] - this.proteinJunctionGene2) + this.proteinJunctionGene1 //end
            ]);

          } else {

            this.proteinDomains[pdb].push([
              domain[0], //id
              domain[4], //name
              domain[3], //desc
              this.proteinJunctionGene1,
              (domain[2] - this.proteinJunctionGene2) + this.proteinJunctionGene1
            ]);
          }
        }
      }
    }
  }
}