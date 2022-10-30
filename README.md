[![test](https://img.shields.io/github/v/release/murphycj/agfusionweb-react)](https://img.shields.io/github/v/release/murphycj/agfusionweb-react)
[![test](https://img.shields.io/github/last-commit/murphycj/agfusionweb-react)](https://img.shields.io/github/last-commit/murphycj/agfusionweb-react)
[![Latest deploy](https://github.com/murphycj/agfusionweb-react/actions/workflows/deploy.yaml/badge.svg)](https://github.com/murphycj/agfusionweb-react/actions/workflows/deploy.yaml)
[![CI](https://github.com/murphycj/agfusionweb-react/actions/workflows/test.yaml/badge.svg)](https://github.com/murphycj/agfusionweb-react/actions/workflows/test.yaml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)


**Note:** This repository is not frequantly updated.

# Intro

AGFusion (pronounced 'A G Fusion') is an interactive web app for annotating gene fusions from the human or mouse genomes. The app is available at [https://www.agfusion.app/](https://www.agfusion.app/). There is also a [companion Python package](https://github.com/murphycj/AGFusion).


AGFusion simply needs the reference genome, the two gene partners, and the fusion junction coordinates as input, and outputs the following:

- FASTA files of cDNA, CDS, and protein sequences.
- Visualizes the protein domain and exon architectures of the fusion transcripts.
- Saves tables listing the coordinates of protein features and exons included in the fusion.
- Optional exon structure and protein domain visualization of the wild-type version of the fusion gene partners.



# Usage
AGFusion automatically predicts the functional effect of the gene fusion (e.g. in-frame, out-of-frame, etc.). Annotation is by default done only for canonical gene isoforms, but there is the option to annotate all non-canonical isoform combinations. Lastly, all gene and protein annotation is from Ensembl (up to release 95).

## Input
There are two ways to provide input.

### (1) Single input
The software only needs the following pieces of data per fusion:

- 5' gene partner.
- 5' gene partner junction location.
- 3' gene partner.
- 3' gene partner junction location.
- The reference genome used to call fusions (human and mouse is supported).

### (2) Bulk input

Alternatively, you can provide either a generic TSV/CSV-formatted file or the output file from one of the supported fusion finding-algorithms:
- Bellerophontes
- Chimerascan
- ChimeRScope
- DeFuse
- EricScript
- FusionCatcher
- FusionInspector
- FusionMap
- JAFFA
- MapSplice
- STARFusion
- TopHatFusion

If your fusion-finding algorithm is not supported, you can either ask me to add support or just format it into a simple CSV or TSV file. Each row in the file should contain one fusion like so: gene1,gene1Junction,gene2,gene2Junction (e.g. FGFR2,1231231,DNM3,522312).

## Output

### Prediction

- Functional effect of the gene fusion (e.g. in-frame, out-of-frame, etc.)
- Annotates proteins with domains (e.g. PFAM database and others).

### Downloadable data

- FASTA files of cDNA, CDS, and protein sequences.
- Plots of protein domain and exon architectures.
- Various tables containing many additional details about the fusion(s), including protein domain data, exon structures, etc.


### Interactive figures and tables

- Table 1: All fusions.
- Table 2: Detail view.
- Protein/exon figures.
- Supports output files from fusion-finding tools.
