import React, { useEffect } from 'react';

import Provider from "../Components/Provider";

import Storage from "../Helpers/Storage";
import Core from "./Core";

import { useForceRender } from "@randajan/react-popup";


class Case extends Storage {

    static create(...args) {
        return new Case(...args);
    }

    static use(...path) {
        return Core.use("Case", ...path);
    }

    static useKey(key, value) {
        const rerender = useForceRender();
        const core = Provider.use().Core;
        const cs = core.Case;

        if (!cs[key]) {
            cs.open(key).set("value", value);
        }

        useEffect(_=>core.addOnChange(rerender, "Case", key), []);

        return [cs[key].get("value"), val=>cs[key].set("value", val, true)]
    }
}


export default Case;