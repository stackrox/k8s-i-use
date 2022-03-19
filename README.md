# k8s-i-use
This is the source for ~~https://k8siuse.com~~ https://stackrox.github.io/k8s-i-use/ (temporary, while we iron out some DNS issues).

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
You will need yarn & npm installed for this to work.  
Start by installing dependencies with `yarn install`.  
The dev server is started by calling `yarn start`.  


## Deployment
Deployment is done via `yarn deploy`, which creates/updates an optimized production build
that is pushed to the branch *gh-pages*.  
**Warning**: The production build can take quite some time to build.  

### Domain Config
For external domains, GitHub Pages expects a `CNAME` file with the domain name in the root of the repo.  
If we ever want to change the domain, this file can be found in `frontend/public/CNAME`.
