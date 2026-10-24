#!/usr/bin/env python3
"""R681 source data truth audit: pristine/read-only behavior and negative evidence."""
from __future__ import annotations
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import sqlite3
import tempfile
import unittest
import zipfile

SOURCE = Path(__file__).resolve().parents[1]/'scripts'/'audit_b053_native_decisions_r681.py'
SPEC = importlib.util.spec_from_file_location('omega_r681_native_decision_truth', SOURCE)
audit = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(audit)


def create_fixture(database:Path, *, changed:bool=False, missing:bool=False):
    c=sqlite3.connect(database)
    c.executescript('''
      CREATE TABLE atlas_nodes(node_id TEXT PRIMARY KEY, shell INTEGER NOT NULL);
      CREATE TABLE runtime_state(
        node_id TEXT PRIMARY KEY, continuity REAL NOT NULL, ledger REAL NOT NULL,
        contradiction REAL NOT NULL, stability_ratio REAL NOT NULL,
        turn_pressure REAL NOT NULL, decision_state TEXT NOT NULL);
    ''')
    for i in range(24):
        node='node_%06d'%(i+1)
        if i % 3 == 0: C,L,Q = .95,.05,.05
        elif i % 3 == 1: C,L,Q = .8,.3,.55
        else: C,L,Q = .1,.5,.5
        s,t,decision=audit.source_decision(C,L,Q)
        if changed and i==0:
            decision='ESCALATE'
            s+=0.17
        if not missing or i!=23:
            c.execute('INSERT INTO atlas_nodes VALUES (?,?)',(node,i//2+1))
        c.execute('INSERT INTO runtime_state VALUES (?,?,?,?,?,?,?)',(node,C,L,Q,s,t,decision))
    c.commit()
    c.close()


class NativeTruthTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.root=Path(self.temp.name)
        self.db=self.root/'archive.db'
        create_fixture(self.db)
        self.hash=hashlib.sha256(self.db.read_bytes()).hexdigest()

    def tearDown(self):
        self.assertEqual(self.db.read_bytes() and hashlib.sha256(self.db.read_bytes()).hexdigest(),self.hash,'snapshot mutated by audit')
        self.temp.cleanup()

    def test_source_kernel_stay_turn_escalate(self):
        self.assertEqual(audit.source_decision(.95,.05,.05)[2],'STAY')
        self.assertEqual(audit.source_decision(.8,.3,.55)[2],'TURN')
        self.assertEqual(audit.source_decision(.1,.5,.5)[2],'ESCALATE')
        with self.assertRaises(ValueError):audit.source_decision(float('nan'),.2,.2)
        with self.assertRaises(ValueError):audit.source_decision(1,-1,0)

    def test_snapshot_without_ground_truth_is_held_even_when_balanced(self):
        result=audit.audit_database(self.db,expected_count=24,source_sha256=self.hash,source_bytes=self.db.stat().st_size)
        self.assertEqual(result['nodes'],24)
        self.assertEqual(result['stored'],{'STAY':8,'TURN':8,'ESCALATE':8})
        self.assertEqual(result['disagreement_count'],0)
        self.assertAlmostEqual(result['stored_shannon_entropy_bits'],math.log2(3))
        self.assertEqual(result['production_admission'],'HELD')
        self.assertIn('EMPIRICAL_LABEL_AND_OUTCOME_CALIBRATION_MISSING',result['blocking_reasons'])
        self.assertEqual(result['source_mutation'],False)
        self.assertEqual(result['thresholds_modified'],False)

    def test_genuine_stored_kernel_and_cached_ratio_disagreement_retained(self):
        other=self.root/'changed.db'
        create_fixture(other,changed=True)
        result=audit.audit_database(other,expected_count=24)
        self.assertEqual(result['disagreement_count'],1)
        self.assertEqual(result['stored_to_recomputed_disagreement'],{'ESCALATE→STAY':1})
        self.assertEqual(result['cached_stability_ratio_disagreements'],1)
        self.assertGreater(result['max_absolute_stability_ratio_residual'],.16)
        self.assertIn('STORED_DECISIONS_CONFLICT_WITH_RECOVERED_KERNEL',result['blocking_reasons'])
        self.assertIn('CACHED_DIAGNOSTICS_CONFLICT_WITH_RECOVERED_KERNEL',result['blocking_reasons'])
        self.assertEqual(len(result['sample_disagreement_ledger']),1)

    def test_missing_atlas_relationship_rejected(self):
        other=self.root/'missing.db'
        create_fixture(other,missing=True)
        with self.assertRaisesRegex(ValueError,'missing/duplicated'):audit.audit_database(other,expected_count=24)

    def test_missing_sqlite_schema_rejected(self):
        other=self.root/'empty.db'
        sqlite3.connect(other).close()
        with self.assertRaisesRegex(ValueError,'schema incomplete'):audit.audit_database(other,expected_count=24)

    def test_exact_bounded_zip_member_and_readonly_io(self):
        archive=self.root/'donor.zip'
        with zipfile.ZipFile(archive,'w') as z:z.write(self.db,audit.DB_MEMBER)
        state=audit.audit_source(archive,from_zip=True,expected_count=24)
        self.assertEqual(state['source_sha256'],self.hash)
        self.assertEqual(state['stored']['STAY'],8)
        self.assertEqual(state['production_admission'],'HELD')
        other=self.root/'wrong.zip'
        with zipfile.ZipFile(other,'w') as z:z.write(self.db,'not-original/source.db')
        with self.assertRaisesRegex(ValueError,'missing or duplicate'):audit.audit_source(other,from_zip=True,expected_count=24)

    def test_forged_digest_and_length_cannot_claim_original_source(self):
        with self.assertRaisesRegex(ValueError,'claimed source digest'):
            audit.audit_database(self.db,expected_count=24,source_sha256=audit.ORIGINAL_SHA256)
        with self.assertRaisesRegex(ValueError,'claimed source length'):
            audit.audit_database(self.db,expected_count=24,source_sha256=self.hash,source_bytes=1)
        actual=audit.audit_database(self.db,expected_count=24)
        self.assertEqual(actual['source_sha256'],self.hash)
        self.assertEqual(actual['source_bytes'],self.db.stat().st_size)
        self.assertFalse(actual['historical_source_hash_verified'])
        self.assertEqual(actual['production_admission'],'HELD')

    def test_wrong_cardinality_and_replay(self):
        with self.assertRaisesRegex(ValueError,'cardinality'):audit.audit_database(self.db,expected_count=25)
        a=audit.audit_source(self.db,from_zip=False,expected_count=24)
        b=audit.audit_source(self.db,from_zip=False,expected_count=24)
        self.assertEqual(json.dumps(a,sort_keys=True),json.dumps(b,sort_keys=True))
        self.assertFalse(a['historical_source_hash_verified'])
        self.assertIn('SOURCE_IDENTITY_NOT_ORIGINAL_B053',a['blocking_reasons'])

if __name__=='__main__':
    unittest.main(verbosity=2)
