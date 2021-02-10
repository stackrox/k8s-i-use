# hackathon-k8s-api

To generate gvks_by_version, run:  
`go run ./cmd/apidiffgen swaggers > gvks_by_version.json`


To generate diffs, run:  
`python3 generate_changes.py`  
The script expects `gvks_by_version.json` to be available in the same folder.  
As a result, `diffs.json` will be created.  
It contains the key of the diffed target version with two lists: `added` and `removed`:
```
...
"swagger_v1.20.json":  {
    "added": [ ... ],
    "removed": [ ... ]
},
...
```
This can be read as: "From version 1.19 to 1.20, these items were added and removed".