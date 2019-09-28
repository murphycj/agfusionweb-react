import pyensembl
import sqlite3
import boto3

dynamodb = boto3.resource('dynamodb')
table_agfusion_gene_synonyms = dynamodb.Table('agfusion_gene_synonyms')
table_agfusion_genes = dynamodb.Table('agfusion_genes')

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


def process_gene_data(species, release, pyens_db, c):

    genes = pyens_db.genes()

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
                data['transcripts'][transcript.id] = {
                    'name': transcript.name,
                    'start': transcript.start,
                    'end': transcript.end,
                    'biotype': transcript.biotype,
                    'complete': transcript.complete,
                    'exons': [[i[0], i[1]] for i in transcript.exon_intervals],
                    'has_start_codon': transcript.contains_start_codon,
                    'has_stop_codon': transcript.contains_stop_codon,
                    'is_protein_coding': transcript.is_protein_coding
                }

                if transcript.is_protein_coding:
                    data['transcripts'][transcript.id]['coding'] = \
                        [[i[0], i[1]] for i in transcript.coding_sequence_position_ranges]

            batch.put_item(Item=data)




def process_data(species, release, agfusion):
    pyens_db = pyensembl.EnsemblRelease(release, species)
    db = sqlite3.Connection(agfusion)
    c = db.cursor()

    # process_gene_synonym(species, release, pyens_db, c)
    process_gene_data(species, release, pyens_db, c)


def put_to_dynamodb():
    pass


process_data('homo_sapiens', 94, '/Users/charliemurphy/Downloads/agfusion.homo_sapiens.94.db')