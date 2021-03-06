
import React from 'react'
import { BrowserRouter } from "react-router-dom";

import jet from "@randajan/react-jetpack";
import ModalProvider from "@randajan/react-popup";

import Core from "../Mods/Core";

import IcoDefs from "./IcoDefs";
import PageProvider from "./PageProvider";
import Lang from "./Lang";

import BaseProvider from "../Base/Provider";

class CoreProvider extends BaseProvider {

  static useMod(name) {
    return CoreProvider.useSerf()[name];
  }

  static useApi() {
    return CoreProvider.useMod("api");
  }

  static defaultFlags = {
    //pending: c => c.tray.isPending(),
    //error: c => c.tray.isError(),
  }

  build(props) {
    return Core.create(props);
  }

  getBody() {
    return jet.map.dig(this, "refs.modal.refs.body");
  }

  fetchSelfProps() {
    const { id, className, onLoad, flags } = this.props;

    return {
      id, className, ref:"modal",
      onLoad: _ => jet.fce.run(onLoad, this),
      flags:jet.rele.flags({ ...CoreProvider.defaultFlags, ...flags }, this.base)
    };

  }

  render() {
    const { trayBar } = this.props;
    const { build } = this.base;

    return (
      <BrowserRouter>
        <CoreProvider.Context.Provider value={this.base}>
          <PageProvider/>
          <ModalProvider {...this.fetchSelfProps()}>
            {build.is("result") ? 
              <React.Fragment>
                <Lang/>
                <IcoDefs />
                {this.props.children}
              </React.Fragment>
            : null}
            {trayBar}
          </ModalProvider>
        </CoreProvider.Context.Provider>
      </BrowserRouter>
    )
  }
}

export default CoreProvider;
