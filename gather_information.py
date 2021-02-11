import json
from typing import NamedTuple, Dict
import sys
import os


def _validate_version(version: int):
    assert type(version) is int and version >= 6


class GVK(NamedTuple):
    group: str
    version: str
    kind: str


class FieldKey(NamedTuple):
    gvk: GVK
    field_name: str


class GVKWithVersions:
    def __init__(self, gvk):
        self.gvk = gvk
        self.seen_in_versions = []
        self.deprecated_in_versions = []

    def mark_seen_in_version(self, version):
        _validate_version(version)
        self.seen_in_versions.append(version)

    def mark_deprecated_in_version(self, version):
        _validate_version(version)
        self.deprecated_in_versions.append(version)


class Field:
    def __init__(self, field_key):
        self.field_key = field_key
        self.seen_in_versions = []
        self.deprecated_in_versions = []

    def mark_seen_in_version(self, version):
        _validate_version(version)
        self.seen_in_versions.append(version)

    def mark_deprecated_in_version(self, version):
        _validate_version(version)
        self.deprecated_in_versions.append(version)


def _process_fields_recursive(all_definitions: Dict, gvk: GVK, version: int, definition_key: str, all_fields: Dict[FieldKey, Field],
                              def_keys_seen_so_far=None, path_so_far=None):
    if def_keys_seen_so_far is None:
        def_keys_seen_so_far = set()
    if path_so_far is None:
        path_so_far = []

    # Prevents cycles
    if definition_key in def_keys_seen_so_far:
        return
    def_keys_seen_so_far.add(definition_key)

    for field_name, field_desc in all_definitions[definition_key].get("properties", {}).items():
        path_with_field_name = path_so_far + [field_name]

        if field_desc.get("type") == "array":
            ref = field_desc["items"].get("$ref")
        else:
            ref = field_desc.get("$ref")
        if ref:
            assert ref.startswith("#/definitions/")
            _process_fields_recursive(all_definitions, gvk, version, ref[len("#/definitions/"):],
                                      all_fields, def_keys_seen_so_far, path_with_field_name)
            continue

        field_key = FieldKey(gvk=gvk, field_name=".".join(path_with_field_name))
        if field_key not in all_fields:
            all_fields[field_key] = Field(field_key)

        # TODO: improve this heuristic?
        deprecated = "deprecated" in field_desc.get('description', '').lower()
        if deprecated:
            all_fields[field_key].mark_deprecated_in_version(version)
        else:
            all_fields[field_key].mark_seen_in_version(version)


def parse_swagger_file(path: str, all_gvks: Dict[GVK, GVKWithVersions], all_fields: Dict[FieldKey, Field]):
    with open(path, 'r') as f:
        swagger_loaded = json.load(f)

    # this extracts version x out of paths that end in v1.x.json
    version = int(path.split('.')[-2])
    for key, desc in swagger_loaded['definitions'].items():
        gvk_jsons = desc.get('x-kubernetes-group-version-kind')
        if not gvk_jsons:
            continue

        # TODO: improve this heuristic?
        deprecated = "deprecated" in desc.get('description', '').lower()
        for gvk_json in gvk_jsons:
            gvk = GVK(group=gvk_json["group"], version=gvk_json["version"], kind=gvk_json["kind"])

            if gvk not in all_gvks:
                all_gvks[gvk] = GVKWithVersions(gvk)

            if deprecated:
                all_gvks[gvk].mark_deprecated_in_version(version)
            else:
                all_gvks[gvk].mark_seen_in_version(version)

            _process_fields_recursive(swagger_loaded['definitions'], gvk, version, key, all_fields)


def parse_files(dir):
    all_gvks: Dict[GVK, GVKWithVersions] = {}
    all_fields: Dict[FieldKey, Field] = {}
    for filename in os.listdir(dir):
        if not filename.endswith('.json'):
            continue
        parse_swagger_file(os.path.join(dir, filename), all_gvks, all_fields)

    giant_json = []
    for gvk, gvk_with_versions in all_gvks.items():
        curr = {
            "group": gvk.group, "version": gvk.version, "kind": gvk.kind,
            "seen_in": sorted(gvk_with_versions.seen_in_versions), "deprecated_in": sorted(gvk_with_versions.deprecated_in_versions),
            "fields": []
        }
        for field_key, field in all_fields.items():
            if field_key.gvk == gvk:
                curr["fields"].append({
                    "name": field_key.field_name,
                    "seen_in": sorted(field.seen_in_versions),
                    "deprecated_in": sorted(field.deprecated_in_versions),
                })

        giant_json.append(curr)
    with open("gvk_metadata.json", "w") as out_f:
        json.dump(giant_json, out_f)


if __name__ == "__main__":
    parse_files(sys.argv[1])