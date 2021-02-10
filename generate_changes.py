import collections
import itertools
import json


SOURCE_JSON = "gvks_by_version.json"
DEST_JSON = "diffs.json"


diff_dict = {}


def append_diff(version_str, old_ver_items, new_ver_items):
    # To ensure always the same output and eliminate differences between runs,
    # the lists are always sorted
    old_sorted = sorted(old_ver_items, key=lambda k: (k["Group"], k["Kind"], k["Version"]))
    new_sorted = sorted(new_ver_items, key=lambda k: (k["Group"], k["Kind"], k["Version"]))
    added = [item for item in new_sorted if item not in old_sorted]
    removed = [item for item in old_sorted if item not in new_sorted]
    diff_dict[version_str] = {}
    diff_dict[version_str]["added"] = added
    diff_dict[version_str]["removed"] = removed


def json_load_from_file(filename):
    with open(filename) as json_file:
        json_object = json.load(json_file)
        return json_object


def json_write_to_file(filename, json_data):
    with open(filename, "w") as outfile:
        json.dump(json_data, outfile)


def main():
    versions = json_load_from_file(SOURCE_JSON)

    # we definitely need to have versions sorted!
    # Dicts don't keep order, but OrderedDicts do
    # -> The lambda splits on the minor version and converts it to int.
    # WARNING: THIS WILL STOP WORKING WHEN 2.0 IS INTRODUCED!
    sorted_versions = collections.OrderedDict(sorted(versions.items(), key=lambda x: int(x[0].split("v1.")[1].split(".json")[0])))

    last_version = None
    for version, items in sorted_versions.items():
        if last_version is None:
            last_version = version
            continue # skip first version as there is no diff
        print(f"diffing {last_version} and {version}")
        append_diff(version, versions[last_version], versions[version])
        last_version = version
    
    json_write_to_file(DEST_JSON, diff_dict)



if __name__ == "__main__":
    main()

