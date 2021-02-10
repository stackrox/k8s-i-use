import json
import sys
import urllib.request


for k8s_tag in range(5, 22):
    print(k8s_tag)
    swagger_json_url = f"https://raw.githubusercontent.com/kubernetes/kubernetes/v1.{k8s_tag}.0/api/openapi-spec/swagger.json"

    with urllib.request.urlopen(swagger_json_url) as response:
        json_contents = response.read()

    out_file = f"swaggers/swagger_v1.{k8s_tag}.json"
    with open(out_file, "w") as f:
        f.write(json_contents.decode())
