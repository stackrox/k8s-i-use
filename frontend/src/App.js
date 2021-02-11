import './App.css';
import './Style.css';
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
    const fields = singleObj.fields.map((item) => 
        <li>{item.name}
            <ul>
                {item.seen_in.length > 0 &&
                (<li><i style={{color: "#239B56"}}>Available</i> in versions: {prettyPrintVersions(item.seen_in)}</li>)}
                {item.deprecated_in.length > 0 &&
                (<li><i style={{color: "#B03A2E"}}>Deprecated</i> but available in versions: {prettyPrintVersions(item.deprecated_in)}</li>)}
            </ul>
        </li>);
    return (
        <>
            <Link to={"/"}>Back to home page</Link>
            <h2> {prettyPrintObj(singleObj)} </h2>
            {singleObj.seen_in.length > 0 &&
                (<p> <i style={{color: "#239B56"}}>Stable</i> and available in Kube versions {prettyPrintVersions(singleObj.seen_in)}</p>)}
             {singleObj.deprecated_in.length > 0 &&
                (<p> <i style={{color: "#B03A2E"}}>Deprecated</i> but available in Kube versions {prettyPrintVersions(singleObj.deprecated_in)}</p>)}
            {singleObj.fields.length > 0 &&
                (<h3>Fields: </h3>)}
            {singleObj.fields.length > 0 &&
                (<ul>{fields}</ul>)}
                
        </>
    );
}

function prettyPrintObj(obj) {
    return `${obj.group}/${obj.version} - ${obj.kind}`;
}

function prettyPrintVersions(versions) {
    if (versions.length === 1) {
        return `v1.${versions[0]}`;
    }
    return `v1.${versions[0]} - v1.${versions.slice(-1)[0]}`;
}

function constructLink(obj) {
    const elems = [obj.group, obj.version, obj.kind];
    return elems.filter(elem => elem).map(elem => elem.toLowerCase()).join('-');
}

export default App;
