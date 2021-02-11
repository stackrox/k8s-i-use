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
            <h1>k8s-iuse</h1>
            <p>Click on the object of your choice to get started.</p>
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
        <li key={item.name}>{item.name}
            <ul>
                {item.seen_in.length > 0 &&
                (<li><i style={{color: "#239B56"}}>Available</i> in versions: {prettyPrintVersions(item.seen_in)}</li>)}
                {item.deprecated_in.length > 0 &&
                (<li><i style={{color: "#FFA500"}}>Deprecated</i> but available in versions: {prettyPrintVersions(item.deprecated_in)}</li>)}
            </ul>
        </li>);

    const fieldRows = singleObj.fields.map((item) => constructRow(item));
    const kindRow = constructRow(singleObj);

    return (
        <>
            <Link to={"/"}>Back to home page</Link>
            <h2> {prettyPrintObj(singleObj)} </h2>
            
            <table class="styled-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>1.7</th><th>1.8</th><th>1.9</th><th>1.10</th><th>1.11</th><th>1.12</th>
                        <th>1.13</th><th>1.14</th><th>1.15</th><th>1.16</th><th>1.17</th><th>1.18</th>
                        <th>1.19</th><th>1.20</th>
                    </tr>
                </thead>
                <tbody>
                    {kindRow}
                </tbody>
            </table>
            {singleObj.seen_in.length > 0 &&
                (<p> <i style={{color: "#239B56"}}>Stable</i> and available in Kube versions {prettyPrintVersions(singleObj.seen_in)}</p>)}
            {singleObj.deprecated_in.length > 0 &&
                (<p> <i style={{color: "#FFA500"}}>Deprecated</i> but available in Kube versions {prettyPrintVersions(singleObj.deprecated_in)}</p>)}
            <table class="styled-table">
                <caption>Fields</caption>
                <thead>
                    <tr>
                    <th>Field Name</th>
                        <th>1.7</th><th>1.8</th><th>1.9</th><th>1.10</th><th>1.11</th><th>1.12</th>
                        <th>1.13</th><th>1.14</th><th>1.15</th><th>1.16</th><th>1.17</th><th>1.18</th>
                        <th>1.19</th><th>1.20</th>
                    </tr>
                </thead>
                <tfoot>
                    <tr>
                    <th>Field Name</th>
                        <th>1.7</th><th>1.8</th><th>1.9</th><th>1.10</th><th>1.11</th><th>1.12</th>
                        <th>1.13</th><th>1.14</th><th>1.15</th><th>1.16</th><th>1.17</th><th>1.18</th>
                        <th>1.19</th><th>1.20</th>
                    </tr>
                </tfoot>
                <tbody>
                    {fieldRows}
                </tbody>
            </table>
            
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

function getClassNameWithColor(entry, version) {
    if (entry.seen_in.includes(version)) {
        return "cl-yes";
    }
    if (entry.deprecated_in.includes(version)) {
        return "cl-maybe";
    }
    return "cl-no";
}

function constructRow(entry) {
    const versions = [7,8,9,10,11,12,13,14,15,16,17,18,19,20];
    return <tr>
        <td>{entry.name}</td>
        {versions.map((version) => 
            <td className={getClassNameWithColor(entry, version)} /> )}
    </tr>
}

function constructLink(obj) {
    const elems = [obj.group, obj.version, obj.kind];
    return elems.filter(elem => elem).map(elem => elem.toLowerCase()).join('-');
}


var clickEvent = "ontouchstart" in window ? "touchend" : "click",
classMethods = ["remove", "add"],
stringArray = ["Add more contrast", "Remove additional contrast", "Dark Mode", "Light Mode"];

function createControls() {
    var contrastButton = document.createElement('button');
      contrastButton.id = "contrast";
      contrastButton.classList.add('cont-inv');
      contrastButton.innerText = stringArray[0];
      contrastButton.tabIndex = 1;
  
    var nightModeButton = document.createElement('button');
      nightModeButton.id = "invmode";
      nightModeButton.classList.add('cont-inv');
      nightModeButton.innerText = stringArray[2];
      nightModeButton.tabIndex = 2;
    document.body.appendChild(contrastButton);
    document.body.appendChild(nightModeButton);
  }

  function someControl(id, textArr, className) {
    var el = document.getElementsByTagName("html")[0];
    var acbox = document.getElementById(id),
      textNode = acbox.firstChild,
      toggled = false;
    acbox.addEventListener(
      clickEvent,
      function() {
        var selector = Number((toggled = !toggled));
        textNode.data = textArr[selector];
        el.classList[classMethods[selector]](className);
      },
      false
    );
  }
  
  function addContrastControl() {
    someControl(
      "contrast",
      [stringArray[0], stringArray[1]],
      "contrast"
    );
  }
  
  function addInvertedControl() {
    someControl("invmode", [stringArray[2], stringArray[3]], "inverted");
  }
  
  createControls();
  addContrastControl();
  addInvertedControl();
export default App;
