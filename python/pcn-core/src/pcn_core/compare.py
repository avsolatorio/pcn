from __future__ import annotations
import re
from typing import Optional
from .types import Claim, Policy

_strip_re = re.compile(r"[\u00A0 ,]")

def _strip(s: str) -> str:
    return _strip_re.sub("", s)

def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()

def _try_float(s: str) -> Optional[float]:
    try:
        return float(s)
    except ValueError:
        return None

def _abbr(s: str) -> Optional[float]:
    m = re.match(r"^([+-]?\d+(?:\.\d+)?)([kmb])?$", s.strip(), flags=re.I)
    if not m:
        return None
    n = float(m.group(1))
    unit = (m.group(2) or "").lower()
    mult = 1e3 if unit == "k" else 1e6 if unit == "m" else 1e9 if unit == "b" else 1.0
    return n * mult

def _pct(s: str) -> Optional[float]:
    t = s.strip()
    is_pct = t.endswith("%")
    num = t[:-1] if is_pct else t
    try:
        n = float(num.replace(",", "").replace(" ", ""))
    except ValueError:
        return None
    return n / 100.0 if is_pct else n

def _ratio(s: str) -> Optional[float]:
    m = re.match(r"^\s*(\d+(?:\.\d+)?)\s*(?:in|/|:)\s*(\d+(?:\.\d+)?)\s*$", s, flags=re.I)
    if not m:
        return None
    a, b = float(m.group(1)), float(m.group(2))
    if b == 0:
        return None
    return a / b

def _range(s: str) -> Optional[tuple[float, float]]:
    compact = _norm(s.lower())
    m = re.search(r"between\s+([^\s]+)\s+(?:and|to)\s+([^\s]+)", compact)
    if not m:
        m = re.match(r"^([^\s]+)\s*(?:–|-|to)\s*([^\s]+)$", compact)
    if not m:
        return None
    a_s, b_s = m.group(1), m.group(2)
    a = _abbr(_strip(a_s)) or _try_float(a_s)
    b = _abbr(_strip(b_s)) or _try_float(b_s)
    if a is None or b is None:
        return None
    return (min(a, b), max(a, b))

def _rounded(a: float, b: float, d: int) -> bool:
    return round(a, d) == round(b, d)

def _tol(a: float, b: float, t: float) -> bool:
    if a == 0 and b == 0:
        return True
    denom = max(1e-12, max(abs(a), abs(b)))
    return abs(a - b) / denom <= t

def compare_by_policy(inner_text: str, claim: Claim, policy: Policy) -> bool:
    inner_raw = str(_norm(str(inner_text)))
    claim_raw = str(claim.value or "").strip()

    def exact() -> bool:
        return _strip(inner_raw.replace("%", "")) == _strip(claim_raw.replace("%", ""))

    if policy["type"] in ("exact", "auto"):
        if exact():
            return True
        if policy["type"] == "exact":
            return False

    inner_abbr, claim_abbr = _abbr(_strip(inner_raw.lower())), _abbr(_strip(claim_raw.lower()))
    inner_pct, claim_pct = _pct(inner_raw), _pct(claim_raw)
    inner_ratio, claim_ratio = _ratio(inner_raw), _ratio(claim_raw)

    if policy["type"] == "abbr":
        return inner_abbr is not None and claim_abbr is not None and inner_abbr == claim_abbr
    if policy["type"] == "percent":
        return inner_pct is not None and claim_pct is not None and inner_pct == claim_pct
    if policy["type"] == "ratio":
        return inner_ratio is not None and claim_ratio is not None and inner_ratio == claim_ratio
    if policy["type"] == "range":
        r = _range(inner_raw)
        claim_num = claim_abbr or claim_pct or claim_ratio or _try_float(claim_raw)
        return r is not None and claim_num is not None and r[0] <= claim_num <= r[1]
    if policy["type"] == "year":
        m1 = re.search(r"\b(19|20)\d{2}\b", inner_raw)
        m2 = re.search(r"\b(19|20)\d{2}\b", claim_raw)
        return bool(m1 and m2 and int(m1.group(0)) == int(m2.group(0)))

    inner_num = inner_pct or inner_abbr or inner_ratio or _try_float(inner_raw)
    claim_num = claim_pct or claim_abbr or claim_ratio or _try_float(claim_raw)

    if policy["type"] == "rounded":
        return inner_num is not None and claim_num is not None and _rounded(inner_num, claim_num, int(policy["decimals"]))
    if policy["type"] == "tolerance":
        return inner_num is not None and claim_num is not None and _tol(inner_num, claim_num, float(policy["tolerance"]))

    if policy["type"] == "auto":
        if exact():
            return True
        if inner_pct is not None and claim_pct is not None and inner_pct == claim_pct:
            return True
        if inner_abbr is not None and claim_abbr is not None and inner_abbr == claim_abbr:
            return True
        if inner_ratio is not None and claim_ratio is not None and inner_ratio == claim_ratio:
            return True
        if inner_num is not None and claim_num is not None and _rounded(inner_num, claim_num, 0):
            return True
        if inner_num is not None and claim_num is not None and _tol(inner_num, claim_num, 0.02):
            return True
        r = _range(inner_raw)
        if r is not None and claim_num is not None and r[0] <= claim_num <= r[1]:
            return True
        return False

    return False
