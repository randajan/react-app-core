import React, { Component, useEffect } from 'react'

import { NavLink } from "react-router-dom";

import jet from "@randajan/jetpack";

import Core, { CoreProvider, Ico, Img, Modal, Markdown, Article, Nest, Pack, Caption, Tile, Avatar } from '@randajan/react-app-core';

function TrayBar() {
  const tray = Core.use("tray");
  const pop = Modal.usePop();
  console.log(tray);
  console.log("RERENDER TRAY");

  useEffect(_=>{
    if (tray.isError()) {
      pop.up({children:tray.getError().map((v,k)=><p key={k}>{v}</p>)});
    }  
  })

  return (
    <div className="TrayBar">
      {tray.getPending().map((v,k)=><p key={k}>{v}</p>)}
    </div>
  );
}

const coreConfig = {
  //nostore:true,
  //debug:true,
  version:"1.0.5",
  cryptKey:"XYZ",
  langDefault:"en",
  langList:["en", "cs"],
  langLibs:[
    {priority:10, list:["cs", "en"], path:"index", fetch:lang=>fetch("/index.html").then(data=>data.text())},
    {priority:11, list:["cs", "en"], path:"md.test", fetch:lang=>fetch("/test."+lang+".md").then(data=>data.text())}
  ],
  flags:core=>{
    console.log("FLAGS", core);
  },
  iconsList:[
    require("./menu.svg"),
    require("./cart.svg"),
    require("./cash.svg"),
    require("./avatar.svg")
  ],
  imagesList:[
    require("./menu.svg")
  ],
  apiUrl:"http://api.itcan.dev.itcan.cz",
  authPath:"sauth",
  authProviders:["google"],
  atBuild:core=>{
    core.lock("query.fbclid");
  },
  trayBar:<TrayBar/>,
  crashMsg:"Critical error please contact our support info@itcan.cz",
  atBuild:core=>{

    //title page change
    core.fit("page", next=>{
        const v = next();
        v.title = "TEST APP";
        delete v.search["fbclid"];
        return v;
    })

    core.eye("page", page=>console.log("EYEPAGE", page));
  },
  onBuild:async core=>{
    const { page, auth } = core;

    //auto authenticate user
    if (page.is("pathname", "/user") && page.get("search.code")) {
        await auth.setPassport(page.pull("search.code"));
    }
  }
}

function Example() {
  const api = Core.useApi();
  const val = Core.useVal("page.search.jo");
  
  return (
    <Pack className="Example" inView>
      <Nest caption="Majestic APP"/>
      <Nest caption="Test">
        <NavLink to={"/foo?jo=6545"}>Goto Foo</NavLink>
        <br/>
        <NavLink to={"/bar?jo=2"}>Gotot Bar</NavLink>
      </Nest>
      {/* <Markdown>#Ahoj</Markdown> */}
      {/* <Article src="test"/> */}
      <Pack>
        {val == 2 ? <Pack><Caption>h1</Caption><Caption>h2</Caption></Pack> : null }
        <Pack><Nest caption="h3.1"></Nest></Pack>
        <Pack inView><Nest caption="h2"></Nest></Pack>
        <Pack><Nest caption="h3.3"></Nest></Pack>
      </Pack>
      <Nest caption="Data">
        <table>
          <thead>
            <tr>
              <th>Path</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <ShowKey path="tray.pending" />
            <ShowKey path="tray.cancel" />
            <ShowKey path="tray.timeout" />
            <ShowKey path="tray.error" />
            <ShowKey path="tray.result" />
            <ShowKey path="lang.now" />
            <ShowKey path="screen" format={k=>jet.map.melt(jet.rele.flags(k), " ")} />
            <ShowKey path="test.test" />
            <ShowKey path="page.title" />
            <ShowKey path="page.path" />
            <ShowKey path="auth.user.data" format={k=>jet.obj.json.to(k)} />
            <ShowKey path="auth.user.profile.name" />
          </tbody>
        </table>
      </Nest>
      <Nest className={"icons"} caption="Icons" wrap inView>
        <Ico src="menu" inView/>
        <Ico src="cart"/>
        <Ico src="cash"/>
        <Ico src="avatar"/>
      </Nest>
      <Nest className={"images"} caption="Images" wrap>
        <Img src="menu"/>
        <Img src="menu"/>
      </Nest>

    </Pack>
  )
}

function ShowKey(props) {
    const { path, format } = props;
    const [ key ] = Core.useKey(path);
    const core = Core.useSerf();
    console.log("Rerender", path, key, core.get(path));
    return (<tr><td>{path}</td><td>{jet.fce.is(format) ? format(key) : key}</td></tr>)
}



export default class App extends Component {
  render () {
    return (
      <CoreProvider className="App" {...coreConfig}>
        <Example/>
      </CoreProvider>
    )
  }
}
