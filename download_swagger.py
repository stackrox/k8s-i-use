import os
import urllib.request


def download_specs(latest_version: int, download_path: str) -> None:
    for k8s_tag in range(7, latest_version +1):
        print(f"Downloading spec for 1.{k8s_tag}")
        swagger_json_url = f"https://raw.githubusercontent.com/kubernetes/kubernetes/v1.{k8s_tag}.0/api/openapi-spec/swagger.json"

        if not os.path.exists(download_path):
            os.makedirs(download_path)

        with urllib.request.urlopen(swagger_json_url) as response:
            json_contents = response.read()

        out_file = f"{download_path}/swagger_v1.{k8s_tag}.json"
        with open(out_file, "w") as f:
            f.write(json_contents.decode())



def determine_latest_version() -> int:
    with urllib.request.urlopen("https://dl.k8s.io/release/stable.txt") as response:
        latest_stable_k8s = response.read().decode() # will be something like "v1.20.2"
        assert latest_stable_k8s.startswith("v1.")
        determined_version = int(latest_stable_k8s.split(".")[1])
        print(f"Found latest version to be v1.{determined_version}")
        return determined_version
