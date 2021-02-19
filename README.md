# hackathon-k8s-api

## Data preparation
Everything starts with the Kubernetes OpenAPI schemas.  
These are downloaded for every version from v1.7 to latest.  
Afterwards, the GVKs are being extracted and version info is parsed, in which versions each GVK is available / deprecated.  
All of this can be done by running 
```
python3 gather_and_prepare_data.py
```  
This script also saves the parsed structure as a valid `JS` file in the frontend,  
where it can be used as `allData` variable after importing it.


## Frontend
The frontend is based on React and can be found in the `frontend` folder.  
You will need yarn installed for this to work.  
Start by installing dependencies with `yarn install`.  
The dev server is started by calling `yarn start`.  
