import json
from pathlib import Path
from pcn_core.types import Claim
from pcn_core.compare import compare_by_policy

def test_spec_fixtures():
    cases_path = Path(__file__).resolve().parents[3] / "specs" / "fixtures" / "cases.json"
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    for c in cases:
        claim = Claim(**c["claim"])
        assert compare_by_policy(c["innerText"], claim, c["policy"]) == c["expect"], c["id"]
