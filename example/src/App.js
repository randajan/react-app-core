import React, { Component } from 'react'

import CoreProvider, { Core, Images, usePromise, Lang, View, Query, Ico, Img, PopUp } from '@randajan/react-app-core';

const coreConfig = {
  //nocache:true,
  debug:true,
  version:"1.0.2",
  cryptKey:"XYZ",
  langFallback:"en",
  langList:["en", "cs", "any"],
  langLibs:[
    {priority:10, list:["cs"], path:"index", fetch:lang=>fetch("/index.html").then(data=>data.text())}, 
  ],
  iconsList:[
    require("./menu.svg")
  ],
  imagesList:[
    require("./menu.svg")
  ],
  apiUrl:"https://reqres.in",
  addProps:add=>add(View=>({view:View.size}), "View")
}

function Example() {
  const query = Query.use();
  const lang = Lang.use();
  const view = View.use();
  console.log(usePromise(_=>{console.log("test")}, []));

  return (
    <div className="Example">
      <PopUp>Test</PopUp>
      <h1>Majestic APP</h1>
      <h2>{view.size}</h2>
      <h2>{lang.now}</h2>
      <a onClick={_=>query.set("test", !query.get("test") ? true : undefined)}>Add to query</a>
      <Ico src="menu"/>
      <Ico src="menu"/>
      <Img src="menu"/>
      <Img src="menu"/>
    </div>
  )
    

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
