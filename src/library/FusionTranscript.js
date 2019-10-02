
import { CODING_COMBINATIONS } from './utils';

export class FusionTranscript {
  constructor(transcript1, transcript2, gene1Junction, gene2Junction) {
    this.transcript1 = transcript1;
    this.transcript2 = transcript2;
    this.gene1Junction = gene1Junction;
    this.gene2Junction = gene2Junction;

    this.name = this.transcript1.id + '_' + this.transcript2.id;
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

    // create a sequence record

    // if self.cds_5prime is not None and self.cds_3prime is not None:
    //     seq = self.cds_5prime + self.cds_3prime

    // self.cds = SeqRecord.SeqRecord(
    //     Seq.Seq(seq,generic_dna),
    //     id=self.name,
    //     name=self.name,
    //     description="length: {}, genes: {}/{}, strands: {}/{}".format(
    //         len(self.cds_5prime + self.cds_3prime),
    //         self.transcript1.gene.name,
    //         self.transcript2.gene.name,
    //         self.transcript1.gene.strand,
    //         self.transcript2.gene.strand
    //     )
    // )

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

    fusion_domains = []
    gene5prime_domains = []
    gene3prime_domains = []

    tmp_domains = []

    // fetch the translation ids

    sqlite3_command = "SELECT * FROM " + self.db.build + "_transcript WHERE transcript_stable_id==\"" + self.transcript1.id + "\""
    self.db.logger.debug('SQLite - ' + sqlite3_command)
    self.db.sqlite3_cursor.execute(
        sqlite3_command
    )
    gene5prime_translation_id = self.db.sqlite3_cursor.fetchall()[0][3]

    sqlite3_command = "SELECT * FROM " + self.db.build + "_transcript WHERE transcript_stable_id==\"" + self.transcript2.id + "\""
    self.db.logger.debug('SQLite - ' + sqlite3_command)
    self.db.sqlite3_cursor.execute(
        sqlite3_command
    )
    gene3prime_translation_id = self.db.sqlite3_cursor.fetchall()[0][3]

    for protein_database in self.protein_databases:

        // fetch protein annotation

        sqlite3_command = "SELECT * FROM " + self.db.build + "_" + protein_database + " WHERE translation_id==\"" + gene5prime_translation_id + "\""
        self.db.logger.debug('SQLite - ' + sqlite3_command)
        self.db.sqlite3_cursor.execute(
            sqlite3_command
        )
        tmp_domains += [list(x) for x in self.db.sqlite3_cursor.fetchall()]

    for d in tmp_domains:

        pfeature_ID = d[2]
        pfeature_name = d[6]
        pfeature_description = d[5]
        pfeature_start = int(d[3])
        pfeature_end = int(d[4])

        gene5prime_domains.append([
            pfeature_ID,
            pfeature_name,
            pfeature_description,
            pfeature_start,
            pfeature_end
        ])

        try:
            if self.transcript_protein_junction_5prime < pfeature_start:
                continue
            elif self.transcript_protein_junction_5prime >= pfeature_end:

                fusion_domains.append([
                    pfeature_ID,
                    pfeature_name,
                    pfeature_description,
                    pfeature_start,
                    pfeature_end
                ])

            elif (self.transcript_protein_junction_5prime - pfeature_start) >= MIN_DOMAIN_LENGTH:

                pfeature_end = self.transcript_protein_junction_5prime

                fusion_domains.append([
                    pfeature_ID,
                    pfeature_name,
                    pfeature_description,
                    pfeature_start,
                    pfeature_end
                ])
        except:
            import pdb; pdb.set_trace()

    // only find the 3' gene partner's domains if the fusion is in-frame

    if self.effect != 'out-of-frame':

        tmp_domains = []

        for database in self.protein_databases:

            sqlite3_command = "SELECT * FROM " + self.db.build + "_" + database + " WHERE translation_id==\"" + gene3prime_translation_id + "\""
            self.db.logger.debug('SQLite - ' + sqlite3_command)
            self.db.sqlite3_cursor.execute(
                sqlite3_command
            )
            tmp_domains += [list(x) for x in self.db.sqlite3_cursor.fetchall()]

        for d in tmp_domains:

            pfeature_ID = d[2]
            pfeature_name = d[6]
            pfeature_description = d[5]
            pfeature_start = int(d[3])
            pfeature_end = int(d[4])

            gene3prime_domains.append([
                pfeature_ID,
                pfeature_name,
                pfeature_description,
                pfeature_start,
                pfeature_end
            ])

            if self.transcript_protein_junction_3prime > pfeature_end:
                continue
            elif self.transcript_protein_junction_3prime <= pfeature_start:

                pfeature_start = (pfeature_start-self.transcript_protein_junction_3prime) + self.transcript_protein_junction_5prime
                pfeature_end = (pfeature_end-self.transcript_protein_junction_3prime) + self.transcript_protein_junction_5prime

                fusion_domains.append([
                    pfeature_ID,
                    pfeature_name,
                    pfeature_description,
                    pfeature_start,
                    pfeature_end
                ])

            else:

                pfeature_start = self.transcript_protein_junction_5prime
                pfeature_end = (pfeature_end-self.transcript_protein_junction_3prime) + self.transcript_protein_junction_5prime

                fusion_domains.append([
                    pfeature_ID,
                    pfeature_name,
                    pfeature_description,
                    pfeature_start,
                    pfeature_end
                ])

            if pfeature_end < pfeature_start:
                import pdb; pdb.set_trace()

    self.domains['fusion'] = fusion_domains
    self.domains[self.transcript1.id] = gene5prime_domains
    self.domains[self.transcript2.id] = gene3prime_domains
  }
}