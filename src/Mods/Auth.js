import jet from "@randajan/jetpack";

import Serf from "../Base/Serf";

class Auth extends Serf {

    constructor(core, path, authPath, providers, sessionUrl, cryptKey) {
        super(core, path);
        const { tray, lang } = core;

        this.fitTo("providers", "arr");
        this.fitTo("authPath", "str");
        this.fitType("login", "obj");
        this.fitType("user", "obj");

        this.fit("passport", next=>{
            const v = jet.obj.tap(next());
            if (!v.access_token) { return {}; }
            v.authorization = jet.map.melt([v.token_type, v.access_token], " ");
            return v;
        });

        this.eye("passport.authorization", _=>
            tray.watch(
                async _=>this.set("user", await this.fetchUser(cryptKey)), 
                g=>lang.spell(["core.auth.watch.user", g.state])
            )
        )

        jet.obj.prop.add(this, "build", tray.watch(
            async _=>{
                const passport = await this.storeSession("passport", sessionUrl).encrypt(cryptKey).pull();
                const user = await this.fetchUser(cryptKey);

                this.set({
                    authPath,
                    providers,
                    passport,
                    user,
                });
            },
            g=>lang.spell(["core.auth.watch.session", g.state])
        ));

    }

    async login(provider) {
        const { api, tray, lang } = this.parent;
        return tray.watch(async _=>{
            const data = await api.get(this.get("authPath")+"/"+provider, null, null, true );
            const redirect = jet.map.dig(data, "redirect_uri");
            if (!redirect) { throw new Error("Login failed: Missing redirect link"); }
            await new Promise(_=>window.location = redirect);
        }, g=>lang.spell(["core.auth.watch.login", g.state]));
    }

    logout() { this.rem("passport"); }

    async setPassport(code) {
        return this.set("passport", await this.fetchPassport(code));
    }

    async fetchPassport(code) {
        const { api, tray, lang } = this.parent;
        return tray.watch(
            api.post(this.get("authPath")+"/token", api.toForm({ code }), null, true), 
            g=>lang.spell(["core.auth.watch.passport", g.state])
        )
    }

    async fetchUserProfile() {
        if (!this.isFull("passport.authorization")) { return; }
        const user = await this.storeApi("user.profile", "user").pull();
        if (user) { return user; }
        this.logout();
    }

    async fetchUser(cryptKey) {
        const profile = await this.fetchUserProfile() || await this.storeLocal("user.profile", ["auth.user", "anonym", "profile"]).encrypt(cryptKey).pull();
        const { id, key } = jet.obj.tap(profile);
        const data = await this.storeLocal("user.data", ["auth.user", id||"anonym", "data"]).encrypt([cryptKey, key]).pull();
        return {profile, data};
    }

    // getMenu() {
    //     const lang = this.Core.Lang;
    //     //if (!this.Tray.isDone()) {return []; }
    //     if (this.User.isReal()) { return [[lang.get("auth.logout"), this.logout.bind(this)]]; }
    //     return this.providers.map(provider=>[lang.get("auth.providers."+provider), _=>this.login(provider)]);
    // }

}


export default Auth;