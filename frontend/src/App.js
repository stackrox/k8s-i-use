import './App.css';
import { allData } from "./allData";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import React from "react";


function App() {
  return (
      <Router>
      <Switch>
          <Route path="/:link">
              <SingleObj />
          </Route>
          <Route path="/">
              <Home />
          </Route>
      </Switch>
      </Router>
  );
}

function Home() {
    const gvkLinks = allData.map(obj => {
        const link = constructLink(obj);
        return (
            <p>
            <Link key={link} to={`/${link}`}>{prettyPrintObj(obj)}</Link>
            </p>
        )
    });
    return (
        <>
            <h2>Click on the object of your choice to get started.</h2>
            {gvkLinks}
        </>
    );
}

function SingleObj() {
    const { link } = useParams();
    const singleObj = allData.find(obj => constructLink(obj) === link);
    if (!singleObj) {
        return (
            <>
                <h2>Object not found</h2>
                <Link to={"/"}>Back to home page</Link>
            </>
        )
    }
    return (
        <>
            <h2> {prettyPrintObj(singleObj)} </h2>
            {singleObj.seen_in.length > 0 &&
                (<p> Stable and available in Kube versions {prettyPrintVersions(singleObj.seen_in)}</p>)}
             {singleObj.deprecated_in.length > 0 &&
                (<p> Deprecated but available in Kube versions {prettyPrintVersions(singleObj.deprecated_in)}</p>)}
        </>
    );
}

function prettyPrintObj(obj) {
    return `${obj.group}/${obj.version} ${obj.kind}`;
}

function prettyPrintVersions(versions) {
    return versions.map(version => `v1.${version}`).join(', ');
}

function constructLink(obj) {
    const elems = [obj.group, obj.version, obj.kind];
    return elems.filter(elem => elem).map(elem => elem.toLowerCase()).join('-');
}

export default App;
