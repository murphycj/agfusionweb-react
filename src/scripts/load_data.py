import pyensembl
import sys
import sqlite3
import boto3
import pickle

dynamodb = boto3.resource('dynamodb')
table_agfusion_gene_synonyms = dynamodb.Table('agfusion_gene_synonyms')
table_agfusion_genes = dynamodb.Table('agfusion_genes')
table_agfusion_sequences = dynamodb.Table('agfusion_sequences')

def add_synonym(data, id, ensg):

    if id != '':
        if id not in data:
            data[id] = [ensg]
        else:
            data[id].append(ensg)
    return data

def process_gene_synonym(species, release, pyens_db, c):
    data = {}

    # get gene synonymes

    query = c.execute('select * from ' + species + '_' + str(release) + ';').fetchall()

    for row in query:
        ensg = row[1]
        entrez = row[2]
        symbol = row[3]

        if ensg!='':
            data = add_synonym(data, entrez, ensg)
            data = add_synonym(data, symbol, ensg)
        else:
            continue

    with table_agfusion_gene_synonyms.batch_writer() as batch:
        for gene_id, ensg in data.items():
            batch.put_item(
                Item={
                    'gene_id': gene_id,
                    'species_release': species + '_' + str(release),
                    'ensembl_gene_id': ';'.join(ensg)
                }
            )

def write(db, species, release):

    with table_agfusion_sequences.batch_writer() as batch:
        for gene_id, seq in db.items():
            batch.put_item(
                Item={
                    'id': gene_id,
                    'species_release': species + '_' + str(release),
                    'sequence': seq
                }
            )


def upload_fasta(species, genome, release):

    # cdna

    db = pickle.load(open(
        '/Users/charliemurphy/Library/Caches/pyensembl/{}/ensembl{}/{}.{}.cdna.all.fa.gz.pickle'.format(
            genome,
            release,
            species.capitalize(),
            genome
        )))
    write(db, species, release)
    # import pdb; pdb.set_trace()

    db = pickle.load(open(
        '/Users/charliemurphy/Library/Caches/pyensembl/{}/ensembl{}/{}.{}.ncrna.fa.gz.pickle'.format(
            genome,
            release,
            species.capitalize(),
            genome
        )))
    write(db, species, release)

    # pep

    db = pickle.load(open(
        '/Users/charliemurphy/Library/Caches/pyensembl/{}/ensembl{}/{}.{}.pep.all.fa.gz.pickle'.format(
            genome,
            release,
            species.capitalize(),
            genome
        )))
    write(db, species, release)

def process_gene_data(species, release, pyens_db, c):

    protein_db = [
        'pfam', 'smart', 'superfamily', 'tigrfam', 'pfscan', 'tmhmm', 'seg', 'ncoils', 'prints',
        'pirsf', 'signalp']

    domains = {}
    for pdb in protein_db:
        query = c.execute('select * from {}_{}_{}'.format(species, release, pdb)).fetchall()

        for q in query:
            ensp = q[1]
            if ensp not in domains:
                domains[ensp] = {j:[] for j in protein_db}

            domains[ensp][pdb].append(list(q[2:]))

    genes = pyens_db.genes()

    canonical = c.execute(
        'select g.stable_id, t.transcript_stable_id from {}_{} g left join {}_{}_transcript t on g.canonical_transcript_id = t.transcript_id;'.format(
            species,
            release,
            species,
            release
        )).fetchall()
    canonical = dict(canonical)

    with table_agfusion_genes.batch_writer() as batch:
        for gene in genes:
            data = {
                'id': gene.id,
                'species_release': species + '_' + str(release),
                'name': gene.name,
                'start': gene.start,
                'end': gene.end,
                'strand': gene.strand,
                'contig': gene.contig,
                'biotype': gene.biotype,
                'is_protein_coding': gene.is_protein_coding,
                'transcripts': {}
            }

            for transcript in gene.transcripts:

                five_prime_utr_len = 0
                three_prime_utr_len = 0
                if transcript.contains_start_codon:
                    five_prime_utr_len = len(transcript.five_prime_utr_sequence)
                if transcript.contains_stop_codon:
                    three_prime_utr_len = len(transcript.three_prime_utr_sequence)

                data['transcripts'][transcript.id] = {
                    'name': transcript.name,
                    'start': transcript.start,
                    'end': transcript.end,
                    'biotype': transcript.biotype,
                    'complete': transcript.complete,
                    'exons': [[i[0], i[1]] for i in transcript.exon_intervals],
                    'has_start_codon': transcript.contains_start_codon,
                    'has_stop_codon': transcript.contains_stop_codon,
                    'five_prime_utr_len': five_prime_utr_len,
                    'three_prime_utr_len': three_prime_utr_len,
                    'is_protein_coding': transcript.is_protein_coding,
                    'protein_id': transcript.protein_id,
                    'domains': {j: [] for j in protein_db},
                    'canonical': True if transcript.id == canonical.get(gene.id, '') else False
                }

                if transcript.is_protein_coding:
                    data['transcripts'][transcript.id]['coding'] = \
                        [[i[0], i[1]] for i in transcript.coding_sequence_position_ranges]

                if transcript.protein_id in domains:
                    data['transcripts'][transcript.id]['domains'] = domains[transcript.protein_id]

            batch.put_item(Item=data)

def process_data(species, release, agfusion):
    pyens_db = pyensembl.EnsemblRelease(release, species)
    db = sqlite3.Connection(agfusion)
    c = db.cursor()

    # process_gene_synonym(species, release, pyens_db, c)
    process_gene_data(species, release, pyens_db, c)
    # upload_fasta('homo_sapiens', 'GRCh38', 94)


def put_to_dynamodb():
    pass


process_data('homo_sapiens', 94, '/Users/charliemurphy/Downloads/agfusion.homo_sapiens.94.db')