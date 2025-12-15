from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Literal, Optional, TypedDict, Union

@dataclass(frozen=True)
class Claim:
    value: Any
    country: Optional[str] = None
    date: Optional[Union[str, Any]] = None

class ExactPolicy(TypedDict):
    type: Literal["exact"]

class RoundedPolicy(TypedDict):
    type: Literal["rounded"]
    decimals: int

class TolerancePolicy(TypedDict):
    type: Literal["tolerance"]
    tolerance: float

class SimplePolicy(TypedDict):
    type: Literal["percent", "range", "abbr", "ratio", "year", "auto"]

Policy = Union[ExactPolicy, RoundedPolicy, TolerancePolicy, SimplePolicy]
