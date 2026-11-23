import importlib.util
import unittest
from pathlib import Path

path=Path(__file__).resolve().parents[1]/"tools"/"omega_sparse_tensor_r902.py"
spec=importlib.util.spec_from_file_location("omega_sparse_tensor_r902",path)
r902=importlib.util.module_from_spec(spec)
spec.loader.exec_module(r902)


class SparseTensorR902Tests(unittest.TestCase):
    def test_dimensions_and_address_digit_wrapping(self):
        self.assertEqual(r902.DIMENSIONS,20736)
        self.assertEqual(r902.TOTAL_POSSIBLE,429981696)
        self.assertEqual(r902.shift_axis(11,0),0)
        self.assertEqual(r902.shift_axis(143,1),11)
        self.assertEqual(r902.shift_axis(20735,3),1727)
        self.assertEqual(r902.shift_axis(0,3),1728)

    def test_one_step_exact_distribution(self):
        actual=r902.sparse_tensor_run_r902({"steps":1,"cell_axis":0,"lane_axis":1,
            "seeds":[{"cell":0,"lane":0,"mass":400}]})
        self.assertEqual(actual["preview"],[
            {"cell":0,"lane":0,"mass":200},
            {"cell":0,"lane":12,"mass":100},
            {"cell":1,"lane":0,"mass":100},
        ])
        self.assertEqual(actual["activeComponents"],3)
        self.assertEqual(actual["activeCells"],2)
        self.assertEqual(actual["totalMassBefore"],400)
        self.assertEqual(actual["totalMassAfter"],400)
        self.assertTrue(actual["conservationExact"])
        self.assertFalse(actual["denseTensorAllocated"])
        self.assertFalse(actual["independentAiModelsTrained"])
        self.assertFalse(actual["gpuComputeProven"])

    def test_repeated_deterministic_and_sparse(self):
        args={"seeds":[{"cell":20735,"lane":20735,"mass":4096}],"steps":4}
        first=r902.sparse_tensor_run_r902(args)
        second=r902.sparse_tensor_run_r902(args)
        self.assertEqual(first["fullStateSha256"],second["fullStateSha256"])
        self.assertEqual(first["totalMassAfter"],4096)
        self.assertLess(first["activeComponents"],r902.MAX_NONZERO)
        self.assertTrue(all(row["totalMass"]==4096 for row in first["audit"]))
        self.assertEqual(first["implicitComponents"],20736*20736)

    def test_mass_aggregation_and_zero_step(self):
        args={"seeds":[{"cell":0,"lane":0,"mass":5},{"cell":0,"lane":0,"mass":7}],"steps":0}
        receipt=r902.sparse_tensor_run_r902(args)
        self.assertEqual(receipt["preview"],[{"cell":0,"lane":0,"mass":12}])
        self.assertEqual(receipt["activeComponents"],1)

    def test_refuse_invalid_and_overdense_requests(self):
        samples=[
            {"steps":9,"seeds":[{"cell":0,"lane":0,"mass":4096}]},
            {"steps":1,"seeds":[{"cell":0,"lane":0,"mass":5}]},
            {"steps":1,"seeds":[{"cell":20736,"lane":0,"mass":4}]},
            {"steps":1,"seeds":[{"cell":0,"lane":20736,"mass":4}]},
            {"steps":1,"cell_axis":4,"seeds":[{"cell":0,"lane":0,"mass":4}]},
            {"steps":True,"seeds":[{"cell":0,"lane":0,"mass":4}]},
            {"steps":1,"seeds":[{"cell":0,"lane":0,"mass":4,"unknown":True}]},
            {"steps":1,"seeds":[{"cell":0,"lane":0,"mass":True}]},
            {"steps":1,"seeds":[{"cell":0,"lane":0,"mass":4}],"operator":"arbitrary"},
            {"steps":1,"seeds":[]},
            {"steps":1,"seeds":[{"cell":0,"lane":0,"mass":4}]*129},
        ]
        for args in samples:
            with self.subTest(args=args),self.assertRaises(ValueError):
                r902.sparse_tensor_run_r902(args)


if __name__=="__main__":unittest.main()
