const JUNCTION_LOCATIONS = [
  "CDS",
  "CDS (start)",
  "CDS (end)",
  "5UTR",
  "5UTR (end)",
  "3UTR",
  "3UTR (start)",
  "3UTR (end)",
  "exon",
  "intron",
  "intron (cds)",
  "intron (before cds)",
  "intron (after cds)",
];

var CODING_COMBINATIONS = {};
for (var i = 0; i < JUNCTION_LOCATIONS.length; i++) {
  CODING_COMBINATIONS[JUNCTION_LOCATIONS[i]] = {};
  for (var j = 0; j < JUNCTION_LOCATIONS.length; j++) {
    CODING_COMBINATIONS[JUNCTION_LOCATIONS[i]][JUNCTION_LOCATIONS[j]] = {
      protein_coding_potential: false,
      truncated: false,
    };
  }
}

CODING_COMBINATIONS["CDS"]["CDS"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["CDS"]["CDS (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["CDS"]["CDS (end)"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["CDS"]["5UTR"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["CDS"]["5UTR (end)"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["CDS"]["3UTR"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["CDS"]["3UTR (start)"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["CDS"]["intron"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["CDS"]["intron (cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["CDS"]["intron (before cds)"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["CDS"]["intron (after cds)"] = {
  protein_coding_potential: true,
  truncated: true,
};

CODING_COMBINATIONS["CDS (end)"]["CDS"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["CDS (end)"]["CDS (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["CDS (end)"]["CDS (end)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["CDS (end)"]["5UTR"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["CDS (end)"]["5UTR (end)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["CDS (end)"]["3UTR"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["CDS (end)"]["3UTR (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["CDS (end)"]["intron"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["CDS (end)"]["intron (cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["CDS (end)"]["intron (before cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["CDS (end)"]["intron (after cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};

// CODING_COMBINATIONS['CDS (start)']['CDS'] = {'protein_coding_potential':true,'truncated':false};
CODING_COMBINATIONS["CDS (start)"]["CDS (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
// CODING_COMBINATIONS['CDS (start)']['CDS (end)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['CDS (start)']['5UTR'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['CDS (start)']['5UTR (end)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['CDS (start)']['3UTR'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['CDS (start)']['3UTR (start)'] = {'protein_coding_potential':true,'truncated':false};
CODING_COMBINATIONS["CDS (start)"]["intron"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["CDS (start)"]["intron (cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["CDS (start)"]["intron (before cds)"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["CDS (start)"]["intron (after cds)"] = {
  protein_coding_potential: true,
  truncated: true,
};

// CODING_COMBINATIONS['5UTR']['CDS'] = {'protein_coding_potential':true,'truncated':false};
CODING_COMBINATIONS["5UTR"]["CDS (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
// CODING_COMBINATIONS['5UTR']['CDS (end)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['5UTR']['5UTR'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['5UTR']['5UTR (end)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['5UTR']['3UTR'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['5UTR']['3UTR (start)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['5UTR']['intron'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['5UTR']['intron (cds)'] = {'protein_coding_potential':true,'truncated':false};
CODING_COMBINATIONS["5UTR"]["intron (before cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
// CODING_COMBINATIONS['5UTR']['intron (after cds)'] = {'protein_coding_potential':true,'truncated':false};

// CODING_COMBINATIONS['5UTR (end)']['CDS'] = {'protein_coding_potential':true,'truncated':false};
CODING_COMBINATIONS["5UTR (end)"]["CDS (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
// CODING_COMBINATIONS['5UTR (end)']['CDS (end)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['5UTR (end)']['5UTR'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['5UTR (end)']['5UTR (end)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['5UTR (end)']['3UTR'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['5UTR (end)']['3UTR (start)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['5UTR (end)']['intron (cds)'] = {'protein_coding_potential':true,'truncated':false};
CODING_COMBINATIONS["5UTR (end)"]["intron (before cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
// CODING_COMBINATIONS['5UTR (end)']['intron (after cds)'] = {'protein_coding_potential':true,'truncated':false};

CODING_COMBINATIONS["3UTR"]["CDS"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR"]["CDS (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR"]["CDS (end)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR"]["5UTR"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR"]["5UTR (end)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR"]["3UTR"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR"]["3UTR (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR"]["intron"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR"]["intron (cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR"]["intron (before cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR"]["intron (after cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};

CODING_COMBINATIONS["3UTR (start)"]["CDS"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR (start)"]["CDS (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR (start)"]["CDS (end)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR (start)"]["5UTR"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR (start)"]["5UTR (end)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR (start)"]["3UTR"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR (start)"]["3UTR (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR (start)"]["intron"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR (start)"]["intron (cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR (start)"]["intron (after cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["3UTR (start)"]["intron (before cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};

// CODING_COMBINATIONS['3UTR (end)']['CDS'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['3UTR (end)']['CDS (start)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['3UTR (end)']['CDS (end)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['3UTR (end)']['5UTR'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['3UTR (end)']['5UTR (end)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['3UTR (end)']['3UTR'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['3UTR (end)']['3UTR (start)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['3UTR (end)']['intron'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['3UTR (end)']['intron (cds)'] = {'protein_coding_potential':true,'truncated':false};
CODING_COMBINATIONS["3UTR (end)"]["intron (before cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
// CODING_COMBINATIONS['3UTR (end)']['intron (after cds)'] = {'protein_coding_potential':true,'truncated':false};

// CODING_COMBINATIONS['intron']['CDS'] = {'protein_coding_potential':true,'truncated':false};
CODING_COMBINATIONS["intron"]["CDS (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
// CODING_COMBINATIONS['intron']['CDS (end)'] = {'protein_coding_potential':true,'truncated':false};
CODING_COMBINATIONS["intron"]["5UTR"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["intron"]["5UTR (end)"] = {
  protein_coding_potential: true,
  truncated: false,
};
// CODING_COMBINATIONS['intron']['3UTR'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['intron']['3UTR (start)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['intron']['intron'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['intron']['intron (cds)'] = {'protein_coding_potential':true,'truncated':false};
CODING_COMBINATIONS["intron"]["intron (before cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
// CODING_COMBINATIONS['intron']['intron (after cds)'] = {'protein_coding_potential':{'protein_coding_potential':true,'truncated':false};,'truncated':false};

CODING_COMBINATIONS["intron (cds)"]["CDS"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["intron (cds)"]["CDS (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["intron (cds)"]["CDS (end)"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["intron (cds)"]["5UTR"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["intron (cds)"]["5UTR (end)"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["intron (cds)"]["3UTR"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["intron (cds)"]["3UTR (start)"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["intron (cds)"]["intron"] = {
  protein_coding_potential: true,
  truncated: true,
};
CODING_COMBINATIONS["intron (cds)"]["intron (cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
// CODING_COMBINATIONS['intron (cds)']['intron (before cds)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['intron (cds)']['intron (after cds)'] = {'protein_coding_potential':true,'truncated':false};

// CODING_COMBINATIONS['intron (before cds)']['CDS'] = {'protein_coding_potential':true,'truncated':false};
CODING_COMBINATIONS["intron (before cds)"]["CDS (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
// CODING_COMBINATIONS['intron (before cds)']['CDS (end)'] = {'protein_coding_potential':true,'truncated':false};
CODING_COMBINATIONS["intron (before cds)"]["5UTR"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["intron (before cds)"]["5UTR (end)"] = {
  protein_coding_potential: true,
  truncated: false,
};
// CODING_COMBINATIONS['intron (before cds)']['3UTR'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['intron (before cds)']['3UTR (start)'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['intron (before cds)']['intron'] = {'protein_coding_potential':true,'truncated':false};
// CODING_COMBINATIONS['intron (before cds)']['intron (cds)'] = {'protein_coding_potential':true,'truncated':false};
CODING_COMBINATIONS["intron (before cds)"]["intron (before cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
// CODING_COMBINATIONS['intron (before cds)']['intron (after cds)'] = {'protein_coding_potential':true,'truncated':false};

CODING_COMBINATIONS["intron (after cds)"]["CDS"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["intron (after cds)"]["CDS (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["intron (after cds)"]["CDS (end)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["intron (after cds)"]["5UTR"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["intron (after cds)"]["5UTR (end)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["intron (after cds)"]["3UTR"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["intron (after cds)"]["3UTR (start)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["intron (after cds)"]["intron"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["intron (after cds)"]["intron (cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["intron (after cds)"]["intron (before cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};
CODING_COMBINATIONS["intron (after cds)"]["intron (after cds)"] = {
  protein_coding_potential: true,
  truncated: false,
};

const PDBS = [
  "pfam",
  "smart",
  "superfamily",
  "tigrfam",
  "pfscan",
  "tmhmm",
  "seg",
  "ncoils",
  "prints",
  "pirsf",
  "signalp",
];

const PROTEINWEIGHT = {
  A: 89.0932,
  C: 121.1582,
  D: 133.1027,
  E: 147.1293,
  F: 165.1891,
  G: 75.0666,
  H: 155.1546,
  I: 131.1729,
  K: 146.1876,
  L: 131.1729,
  M: 149.2113,
  N: 132.1179,
  O: 255.3134,
  P: 115.1305,
  Q: 146.1445,
  R: 174.201,
  S: 105.0926,
  T: 119.1192,
  U: 168.0532,
  V: 117.1463,
  W: 204.2252,
  Y: 181.1885,
};

// from https://github.com/biopython/biopython/blob/master/Bio/Data/CodonTable.py

const CODON = {
  Standard: {
    table: {
      TTT: "F",
      TTC: "F",
      TTA: "L",
      TTG: "L",
      TCT: "S",
      TCC: "S",
      TCA: "S",
      TCG: "S",
      TAT: "Y",
      TAC: "Y",
      TGT: "C",
      TGC: "C",
      TGG: "W",
      CTT: "L",
      CTC: "L",
      CTA: "L",
      CTG: "L",
      CCT: "P",
      CCC: "P",
      CCA: "P",
      CCG: "P",
      CAT: "H",
      CAC: "H",
      CAA: "Q",
      CAG: "Q",
      CGT: "R",
      CGC: "R",
      CGA: "R",
      CGG: "R",
      ATT: "I",
      ATC: "I",
      ATA: "I",
      ATG: "M",
      ACT: "T",
      ACC: "T",
      ACA: "T",
      ACG: "T",
      AAT: "N",
      AAC: "N",
      AAA: "K",
      AAG: "K",
      AGT: "S",
      AGC: "S",
      AGA: "R",
      AGG: "R",
      GTT: "V",
      GTC: "V",
      GTA: "V",
      GTG: "V",
      GCT: "A",
      GCC: "A",
      GCA: "A",
      GCG: "A",
      GAT: "D",
      GAC: "D",
      GAA: "E",
      GAG: "E",
      GGT: "G",
      GGC: "G",
      GGA: "G",
      GGG: "G",
      TAA: "*",
      TAG: "*",
      TGA: "*",
    }, //stop
    start_codons: ["TTG", "CTG", "ATG"],
  },
};

function translate(seq, type = "Standard") {
  var protein = "";
  seq = seq.split("");

  var codon = "";

  for (var i = 0; i < seq.length; i++) {
    codon += seq[i];

    if (codon.length === 3) {
      if (!(codon in CODON[type]["table"])) {
        console.log(codon + " not in list of valid codons!");
        codon = "";
        continue;
      }

      protein += CODON[type]["table"][codon];

      codon = "";
    }
  }

  return protein;
}

function molecularWeight(seq) {
  var weight = 0;
  seq = seq.split("");

  for (var i = 0; i < seq.length; i++) {
    var aa = seq[i];

    if (!(aa in PROTEINWEIGHT)) {
      console.log(aa + " not in list of valid codons!");
      continue;
    }

    weight += PROTEINWEIGHT[aa];
  }

  return weight / 1000;
}

const AVAILABLE_ENSEMBL_SPECIES = {
  homo_sapiens_hg38: {
    ensembl_releases: [94],
    default_release: 94,
    species: "homo_sapiens",
    display: "Human (hg38 / GRCh38)",
  },
  homo_sapiens_hg19: {
    ensembl_releases: [75],
    default_release: 75,
    species: "homo_sapiens",
    display: "Human (hg19 / GRCh37)",
  },
  mus_musculus_mm10: {
    ensembl_releases: [92],
    default_release: 92,
    species: "mus_musculus",
    display: "Mouse (mm10 / GRCm38)",
  },
};

const UPLOAD_FORMATS = [
  "Generic CSV",
  "Generic TSV",
  "Bellerophontes",
  "Chimerascan",
  "ChimeRScope",
  "DeFuse",
  "EricScript",
  "FusionCatcher",
  "FusionInspector",
  "FusionMap",
  "JAFFA",
  "MapSplice",
  "STARFusion",
  "TopHatFusion",
  // 'FusionHunter',
  // 'BreakFusion',
  // 'InFusion',
];

export {
  CODING_COMBINATIONS,
  PDBS,
  translate,
  molecularWeight,
  AVAILABLE_ENSEMBL_SPECIES,
  UPLOAD_FORMATS,
};
