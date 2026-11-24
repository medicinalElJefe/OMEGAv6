import importlib.util
import hashlib
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("r907",ROOT/"tools"/"omega_sparse_projection_r907.py")
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ProjectionR907Tests(unittest.TestCase):
    def test_bijective_complete_base12_address_mapping(self):
        self.assertEqual(module.DIMENSIONS,20736)
        for c,xy in ((0,(0,0)),(1,(1,0)),(12,(12,0)),(143,(143,0)),
                     (144,(0,1)),(1728,(0,12)),(20735,(143,143))):
            self.assertEqual(module.address_xy_r907(c),xy)
        self.assertEqual(len({module.address_xy_r907(c) for c in range(20736)}),20736)

    def test_svg_contains_real_verified_aggregated_cells(self):
        rows=[(0,0,4),(0,1,8),(1,0,4),(1728,12,16)]
        digest=hashlib.sha256(b"0:0:4\n0:1:8\n1:0:4\n1728:12:16\n").hexdigest()
        svg,result=module.project_verified_rows_r907(rows,digest)
        self.assertEqual(result["activeCells"],3)
        self.assertEqual(result["nonzeroComponents"],4)
        self.assertEqual(result["totalMass"],32)
        self.assertEqual(result["zeroMassCells"],20733)
        self.assertEqual(result["sourceFullStateSha256"],digest)
        self.assertEqual(len(result["projectionGrid"]),20736)
        self.assertEqual(result["projectionGrid"].count("A"),20733)
        self.assertNotEqual(result["projectionGrid"][0],"A")
        self.assertNotEqual(result["projectionGrid"][1],"A")
        self.assertNotEqual(result["projectionGrid"][12*144],"A")
        self.assertEqual(result["projectionGridEncoding"],"BASE64_ALPHABET_QUANTIZED_MASS_INTENSITY_R907")
        self.assertFalse(result["gpuComputeProven"])
        root=ET.fromstring(svg)
        shapes=[el for el in root.iter() if el.tag.endswith("rect") and el.get("fill")=="#5edac5"]
        self.assertEqual(len(shapes),3)
        coords={(int(el.get("x")),int(el.get("y"))) for el in shapes}
        self.assertEqual(coords,{(0,0),(5,0),(0,60)})
        self.assertNotIn(b"<script",svg)
        self.assertLess(len(svg),4*1024*1024)

    def test_r961_projection_rejects_valid_format_but_wrong_source_digest(self):
        digest=hashlib.sha256(b"0:0:4\n").hexdigest()
        module.project_verified_rows_r907([(0,0,4)],digest)
        for rows in ([(0,0,5)],[(0,1,4)],[(1,0,4)]):
            with self.subTest(rows=rows),self.assertRaisesRegex(ValueError,"R907_SOURCE_STATE_SHA_DRIFT_HELD"):
                module.project_verified_rows_r907(rows,digest)

    def test_reject_unsorted_invalid_or_bad_digest(self):
        good="a"*64
        for rows,sha in (([],good),([(20736,0,1)],good),
                         ([(0,20736,1)],good),([(0,0,0)],good),
                         ([(1,0,1),(0,0,1)],good),
                         ([(0,0,1),(0,0,1)],good),
                         ([(0,0,1)],"INVALID"),
                         ([(0,0,10**15+1)],good)):
            with self.subTest(rows=rows,sha=sha),self.assertRaises(ValueError):
                module.project_verified_rows_r907(rows,sha)


if __name__=="__main__":
    unittest.main()
