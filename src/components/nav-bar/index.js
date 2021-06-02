import { h, Component, createRef } from 'preact';
import { route } from 'preact-router';
import { Link } from 'preact-router/match';
import { AppDB } from '../../db';
import { allPermission } from '../../generators/routeVerifier';
import SiteModel from '../../models/sites';
import Select from '../select-C';
import styles from "./style.scss";

export default class NavBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showNav: false
        };
        this.user = props.user;
        this.sites = this.user.sites;
        this.sitesSelectField = createRef();
        this.primaryId = this.user.primaryId;
    }

    componentDidMount() {
        const siteInput = this.sitesSelectField.current.input.current.base.querySelector("input");
        siteInput.value = this.sites.length !== 0 ? this.sites[0] : "";
        this.siteChanged(this.sites[0]);
    }

    adminNavs() {
        let permissions;
        permissions = this.user.permittedRessources;
        if (this.user.isOwner) permissions = allPermission;
        return (
            <>
                {/* {
                    permissions.includes("dashboard") ?
                        <li>
                            <Link activeClassName={styles.active} href="/">
                                <button className={styles.navBtn}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
                                    <span></span>
                                    <a>Dashboard</a>
                                </button>
                            </Link>
                        </li>
                        : ""
                } */}
                {
                    permissions.includes("add new sale")
                        ? <li>
                            <Link activeClassName={styles.active} href="/addNewSale">
                                <button className={styles.navBtn}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M15.55 13c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2h7.45zM6.16 6h12.15l-2.76 5H8.53L6.16 6zM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" /></svg>
                                    <span></span>
                                    <a>Add new sale</a>
                                </button>
                            </Link>
                        </li>
                        : ""
                }
                {/* {
                    permissions.includes("personal sales")
                        ? <li>
                            <Link activeClassName={styles.active} href="/allProductSoldByUser">
                                <button className={styles.navBtn}>
                                    {moneytization}
                                    <span></span>
                                    <a>Your Sales</a>
                                </button>
                            </Link>
                        </li>
                        : ""
                } */}
                {
                    permissions.includes("add purchase")
                        ? <li>
                            <Link activeClassName={styles.active} href="/addNewProductInStock">
                                <button className={styles.navBtn}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" /></svg>
                                    <span></span>
                                    <a>new perchase</a>
                                </button>
                            </Link>
                        </li>
                        : ""
                }
                {
                    this.user.productsDefine == "custom"
                        ? <li>
                            <Link activeClassName={styles.active} href="/removeFromStock">
                                <button className={styles.navBtn}>
                                    <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24" /></g><g><path d="M20,2H4C3,2,2,2.9,2,4v3.01C2,7.73,2.43,8.35,3,8.7V20c0,1.1,1.1,2,2,2h14c0.9,0,2-0.9,2-2V8.7c0.57-0.35,1-0.97,1-1.69V4 C22,2.9,21,2,20,2z M15,14H9v-2h6V14z M20,7H4V4h16V7z" /></g></svg>
                                    <span></span>
                                    <a>Remove from stock</a>
                                </button>
                            </Link>
                        </li>
                        : ""
                }
                {
                    permissions.includes("stock")
                        ? <li>
                            <Link activeClassName={styles.active} href="/stock">
                                <button className={styles.navBtn}>
                                    <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24" /></g><g><path d="M20,2H4C3,2,2,2.9,2,4v3.01C2,7.73,2.43,8.35,3,8.7V20c0,1.1,1.1,2,2,2h14c0.9,0,2-0.9,2-2V8.7c0.57-0.35,1-0.97,1-1.69V4 C22,2.9,21,2,20,2z M15,14H9v-2h6V14z M20,7H4V4h16V7z" /></g></svg>
                                    <span></span>
                                    <a>Stock</a>
                                </button>
                            </Link>
                        </li>
                        : ""
                }
                {
                    permissions.includes("sales")
                        ? <li>
                            <Link activeClassName={styles.active} href="/sales">
                                <button className={styles.navBtn}>
                                    <svg height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" /></svg>
                                    <span></span>
                                    <a>Sales</a>
                                </button>
                            </Link>
                        </li>
                        : ""
                }
                {
                    permissions.includes("expenses")
                        ? <li>
                            <Link activeClassName={styles.active} href="/more">
                                <button className={styles.navBtn}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M3 8.41l9 9 7-7V15h2V7h-8v2h4.59L12 14.59 4.41 7 3 8.41z" /></svg>
                                    <span></span>
                                    <a>More</a>
                                </button>
                            </Link>
                        </li>
                        : ""
                }

                {
                    permissions.includes("products")
                        ? <li>
                            <Link activeClassName={styles.active} href="/products">
                                <button className={styles.navBtn}>
                                    <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24" /></g><g><g /><g><path d="M8,8H6v7c0,1.1,0.9,2,2,2h9v-2H8V8z" /><path d="M20,3h-8c-1.1,0-2,0.9-2,2v6c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2V5C22,3.9,21.1,3,20,3z M20,11h-8V7h8V11z" /><path d="M4,12H2v7c0,1.1,0.9,2,2,2h9v-2H4V12z" /></g></g><g display="none"><g display="inline" /><g display="inline"><path d="M8,8H6v7c0,1.1,0.9,2,2,2h9v-2H8V8z" /><path d="M20,3h-8c-1.1,0-2,0.9-2,2v6c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2V5C22,3.9,21.1,3,20,3z M20,11h-8V7h8V11z" /><path d="M4,12H2v7c0,1.1,0.9,2,2,2h9v-2H4V12z" /></g></g></svg>
                                    <span></span>
                                    <a>Products</a>
                                </button>
                            </Link>
                        </li>
                        : ""
                }
                {
                    permissions.includes("add loan")
                        ? <li>
                            <Link activeClassName={styles.active} href="/addNewLoan">
                                <button className={styles.navBtn}>
                                    <svg height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" /></svg>
                                    <span></span>
                                    <a>Add credit</a>
                                </button>
                            </Link>
                        </li>
                        : ""
                }
                {
                    permissions.includes("loans")
                        ? <li>
                            <Link activeClassName={styles.active} href="/loans">
                                <button className={styles.navBtn}>
                                    <svg height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z" /></svg>
                                    <span></span>
                                    <a>Credits</a>
                                </button>
                            </Link>
                        </li>
                        : ""
                }
                {
                    permissions.includes("users")
                        ? <li>
                            <Link activeClassName={styles.active} href="/users">
                                <button className={styles.navBtn}>
                                    <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24" /></g><g><g /><g><path d="M16.67,13.13C18.04,14.06,19,15.32,19,17v3h4v-3C23,14.82,19.43,13.53,16.67,13.13z" /><path d="M15,12c2.21,0,4-1.79,4-4c0-2.21-1.79-4-4-4c-0.47,0-0.91,0.1-1.33,0.24C14.5,5.27,15,6.58,15,8s-0.5,2.73-1.33,3.76 C14.09,11.9,14.53,12,15,12z" /><path d="M9,12c2.21,0,4-1.79,4-4c0-2.21-1.79-4-4-4S5,5.79,5,8C5,10.21,6.79,12,9,12z M9,6c1.1,0,2,0.9,2,2c0,1.1-0.9,2-2,2 S7,9.1,7,8C7,6.9,7.9,6,9,6z" /><path d="M9,13c-2.67,0-8,1.34-8,4v3h16v-3C17,14.34,11.67,13,9,13z M15,18H3l0-0.99C3.2,16.29,6.3,15,9,15s5.8,1.29,6,2V18z" /></g></g></svg>
                                    <span></span>
                                    <a>Users</a>
                                </button>
                            </Link>
                        </li>
                        : ""
                }
            </>
        )
    }



    async logOut() {
        this.props.isLoading(true);
        await AppDB.auth().signOut();
        this.props.isLoading(false);
        this.props.goTo("login");

    }

    toogleNav(showNav) {
        // let showNav = this.state.showNav;
        if (showNav) showNav = false;
        else showNav = true;
        this.props.showNavInReturn(showNav);

    }

    async siteChanged(data) {
        this.props.isLoading(true);
        const siteData = await SiteModel.getOneSite(this.primaryId, data);
        this.props.isLoading(false);
        this.props.selectedSite(siteData);
        document.dispatchEvent(new CustomEvent("sitechange", { detail: { site: data } }));
    }

    render(props, state) {
        const adminGroup = this.user.isOwner ? "admin" : this.user.administrativeGroup;
        const showNav = props.showNav;
        return (
            <>
                <div onClick={_ => this.toogleNav(showNav)} className={showNav ? styles.backBlack : ""}></div>
                <div className={`${styles.navContainerFluid} ${showNav ? styles.showNav : ""}`}>
                    <button onClick={_ => this.toogleNav(showNav)} type="button" className={styles.navButtonToogle} >
                        <svg height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>;
                    </button>
                    <div className={styles.navigationPositioning}>
                        <div className={styles.container}>
                            <ul className={styles.navListSection}>
                                {this.adminNavs()}
                                <li>

                                    <Link activeClassName={styles.active} href="/report">
                                        <button className={styles.navBtn}>
                                            <svg enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><path d="M0,0h24v24H0V0z" fill="none" /><g><path d="M19.5,3.5L18,2l-1.5,1.5L15,2l-1.5,1.5L12,2l-1.5,1.5L9,2L7.5,3.5L6,2v14H3v3c0,1.66,1.34,3,3,3h12c1.66,0,3-1.34,3-3V2 L19.5,3.5z M19,19c0,0.55-0.45,1-1,1s-1-0.45-1-1v-3H8V5h11V19z" /><rect height="2" width="6" x="9" y="7" /><rect height="2" width="2" x="16" y="7" /><rect height="2" width="6" x="9" y="10" /><rect height="2" width="2" x="16" y="10" /></g></svg>
                                            <span></span>
                                            <a>Report</a>
                                        </button>
                                    </Link>
                                </li>
                            </ul>
                            <div className={styles.siteSelectRow}>
                                <Select ref={this.sitesSelectField} className={styles.siteSelectElt} name="site" label="Site" onChange={data => this.siteChanged(data)}>
                                    {
                                        this.sites.map((site) => <option value={site}>{site}</option>)
                                    }
                                </Select>
                            </div>
                        </div>

                    </div>
                </div>
            </>
        );
    }
}