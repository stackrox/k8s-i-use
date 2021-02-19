import os
from download_swagger import determine_latest_version, download_specs
from gather_information import parse_files


DL_PATH = os.path.join(".", "swaggers")
ALL_DATA_PATH = os.path.join(".", "frontend", "src")


if __name__ == "__main__":
    print("Determining latest k8s version...")
    latest_k8s_version = determine_latest_version()
    print("Downloading API specs...")
    download_specs(latest_k8s_version, DL_PATH)
    print("Extracting version info for GVKs...")
    parse_files(DL_PATH, ALL_DATA_PATH)
