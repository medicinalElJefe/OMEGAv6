import csv
import hashlib
import importlib.util
import io
import json
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape

MODULE=Path(__file__).resolve().parents[1]/"tools"/"omega_absolute_truth_verifier_r884.py"
spec=importlib.util.spec_from_file_location("omega_absolute_truth_verifier_r884",MODULE)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class TenLedgerTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.root=Path(self.temp.name)
        self.entries=[]
        self.tiers=(["VERIFIED_OR_INTERNALLY_TESTED"]*6872
             +["DERIVED_OR_SCOPED"]*699+["EXTERNAL_OR_OPEN_FRONTIER"]*84)
        index=0
        for i in range(10):
            count=850 if i<9 else 5
            rows=[{"id":f"REC-{j:05d}","tier":self.tiers[j]} for j in range(index,index+count)]
            index+=count
            path=self.root/f"ledger-{i:02d}.{('xlsx' if i==9 else 'csv' if i%2==0 else 'json')}"
            if i==9:self.make_xlsx(path,rows)
            elif i%2==0:
                with path.open("w",newline="",encoding="utf-8") as f:
                    w=csv.DictWriter(f,fieldnames=["id","tier"]);w.writeheader();w.writerows(rows)
            else:path.write_text(json.dumps(rows),encoding="utf-8")
            self.entries.append({"path":path.name,"sha256":mod.sha_bytes(path.read_bytes()),
                "id_column":"id","tier_column":"tier",**({"sheet_name":"Canon"} if i==9 else {})})
        self.manifest={"schema":"OMEGA_TEN_LEDGER_INPUT_R884","ledgers":self.entries}
    def tearDown(self):self.temp.cleanup()
    @staticmethod
    def make_xlsx(path,rows):
        header=[{"id":"id","tier":"tier"}]+rows
        xml=['<?xml version="1.0" encoding="utf-8"?>',
             '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>']
        for k,row in enumerate(header,1):
            xml.append(f'<row r="{k}"><c r="A{k}" t="inlineStr"><is><t>{escape(row["id"])}</t></is></c>'
                       f'<c r="B{k}" t="inlineStr"><is><t>{escape(row["tier"])}</t></is></c></row>')
        xml.append("</sheetData></worksheet>")
        with ZipFile(path,"w",ZIP_DEFLATED) as z:
            z.writestr("xl/workbook.xml",'<?xml version="1.0" encoding="utf-8"?>'
                '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
                'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
                '<sheets><sheet name="Canon" sheetId="1" r:id="rId1"/></sheets></workbook>')
            z.writestr("xl/_rels/workbook.xml.rels",'<?xml version="1.0" encoding="utf-8"?>'
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                '<Relationship Id="rId1" Target="worksheets/sheet1.xml" '
                'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"/></Relationships>')
            z.writestr("xl/worksheets/sheet1.xml","".join(xml))
    def test_exact_source_replay(self):
        result=mod.verify(self.root,self.manifest)
        self.assertTrue(result["ok"],result)
        self.assertEqual(result["state"],"TEN_LEDGER_COUNTS_REPLAYED_FROM_PINNED_BYTES")
        self.assertEqual(result["total"],7655)
        self.assertEqual(result["counts"],mod.TIER_EXPECTED)
        self.assertEqual(len(result["sourceReceipts"]),10)
        self.assertFalse(result["canonPromotion"])
        self.assertFalse(result["historicalSemanticsVerified"])
    def test_hash_tampering_held(self):
        path=self.root/"ledger-00.csv"
        path.write_bytes(path.read_bytes()+b"\n")
        self.assertEqual(mod.verify(self.root,self.manifest)["state"],"LEDGER_SHA_MISMATCH")
    def test_count_drift_held_even_if_repin(self):
        path=self.root/"ledger-00.csv"
        text=path.read_text()
        path.write_text(text.replace("VERIFIED_OR_INTERNALLY_TESTED","DERIVED_OR_SCOPED",1))
        self.manifest["ledgers"][0]["sha256"]=mod.sha_bytes(path.read_bytes())
        res=mod.verify(self.root,self.manifest)
        self.assertEqual(res["state"],"LEDGER_COUNT_MISMATCH_HELD")
        self.assertEqual(res["actualTiers"]["VERIFIED_OR_INTERNALLY_TESTED"],6871)
    def test_record_identity_collision_held(self):
        path=self.root/"ledger-01.json"
        rows=json.loads(path.read_text());rows[0]["id"]="REC-00000";path.write_text(json.dumps(rows))
        self.entries[1]["sha256"]=mod.sha_bytes(path.read_bytes())
        self.assertEqual(mod.verify(self.root,self.manifest)["state"],"CROSS_LEDGER_DUPLICATE_ID")
    def test_sheet_mismatch_held(self):
        self.entries[-1]["sheet_name"]="Nonexistent"
        self.assertEqual(mod.verify(self.root,self.manifest)["state"],"LEDGER_SOURCE_OR_PARSE_HELD")
    def test_input_manifest_incomplete_held(self):
        self.assertEqual(mod.verify(self.root,{"schema":"OMEGA_TEN_LEDGER_INPUT_R884","ledgers":self.entries[:9]})["state"],"EXACT_TEN_LEDGERS_REQUIRED")
    def test_relative_path_confined(self):
        self.entries[0]["path"]="../outside.csv"
        self.assertEqual(mod.verify(self.root,self.manifest)["state"],"LEDGER_SOURCE_OR_PARSE_HELD")

if __name__=="__main__":
    unittest.main()
