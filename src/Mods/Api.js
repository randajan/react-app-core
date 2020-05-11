import jet from "@randajan/jetpack";

import Core from "./Core";

class Api {
    Core;
    Storage;
    origin = window.location.protocol+"//"+window.location.host;
    url;

    constructor(Core, url) {
        jet.obj.addProperty(this, {
            Core,
            Storage:Core.Vault.open("api"),
            url:jet.get("string", url),
            pending:{}
        }, null, false, true);
    }

    formatOptions(method, data, headers) {
        const options = {
            method: method,
            dataType: "JSON",
            //credentials: 'include',
            headers: {
                ...headers,
                //Accept: 'application/json',
                //Origin: this.origin,
                //Authorization: this.Core.Auth.getAccessToken(true),
                //"X-CSRF-Token": this.Storage.get("csrf")
            }
        };
    
        if (method === "GET") {}
        else if (method === "POST") {options.body = Api.dataToForm(data);}

        return options;
    }

    toCache(id, data) {
        return this.Storage.set(["cache", id], {timestamp:new Date(), data}, true);
    }

    fromCache(id, timeout) {
        const cache = this.Storage.get(["cache", id]);
        if (!cache) { return }
        const msleft = new jet.Amount(timeout, "s").valueOf("ms");
        if (new Date().getTime() < new Date(cache.timestamp).getTime()+msleft) {
            return cache.data;
        }
    }

    async fetch(method, path, data, headers, cache) {
        [method, path, data, headers, cache] = jet.untie({method, path, data, headers, cache});
        const id = jet.obj.toJSON([method, path, data, headers]);

        let reply = this.fromCache(id, cache);

        if (reply != null) { return reply; }

        if (this.pending[id]) { return await this.pending[id]; }

        const prom = this.pending[id] = fetch(this.url + path, this.formatOptions(method, data, headers))
            .then(resp=>{
                this.Storage.set("csrf", resp.headers.get("x-csrf-token"));
                return resp.json();
            })

        reply = await prom;
        delete this.pending[id];
        if (cache) { this.toCache(id, reply); }
        return reply;
    }

    get(path, data, headers, cache) {return this.fetch("GET", ...jet.untie({path, data, headers, cache}));}
    post(path, data, headers, cache) {return this.fetch("POST", ...jet.untie({path, data, headers, cache}));}
    put(path, data, headers, cache) {return this.fetch("PUT", ...jet.untie({path, data, headers, cache}));}
    delete(path, data, headers, cache) {return this.fetch("DELETE", ...jet.untie({path, data, headers, cache}));}

    static create(...args) {return new Api(...args);}

    static dataToForm(data) {
        const form = new FormData();
        for (let i in data) {form.append(i, data[i]);}
        return form;
    }

    static use(...path) {
        return Core.use("Api", ...path);
    }

    static useStorage(...path) {
        return Api.use("Storage", ...path);
    }

}

export default Api;