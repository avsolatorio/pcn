from importlib.resources import files
import json

def load_cases():
    return json.loads((files(__package__) / "cases.json").read_text(encoding="utf-8"))
