import { h, Component } from "preact";
import { menuIcon } from "../../assets/icons/icons";
import NotificationConents from "../notification-contents";
import UserInfo from "../user-info";
import styles from "./style.scss";
import NotificationModel from '../../models/notification/index';
import Select from "../select-C";

export default class Header extends Component {
    constructor(props) {
        super(props);
        this.user = props.user;
        this.state = {
            showInfoUser: false,
            showNotifications: false,
            showNav: false,
            notifications: new Map(),
            hideNotifier: false,
            showInfo: false
        }
        this.sites = this.user.sites;
    }

    async getLoandNotifications(site) {
        const didIncludeInUserSites = this.sites.includes(site);
        if (!site || !didIncludeInUserSites) return;
        const notifications = this.state.notifications;
        const primaryId = this.user.primaryId;
        const loanNotifications = await NotificationModel.getLoansNotifications(primaryId, site);
        for (const notification of loanNotifications) {
            const key = notification.ref.id;
            notifications.set(key, notification);
        }
        this.setState({ notifications });
    }

    async getProductsNotifications(site) {
        const didIncludeInUserSites = this.sites.includes(site);
        if (!site || !didIncludeInUserSites) return;
        const notifications = this.state.notifications;
        const primaryId = this.user.primaryId;
        const loanNotifications = await NotificationModel.getStockNotification(primaryId, site);
        for (const notification of loanNotifications) {
            const key = notification.ref.id;
            notifications.set(key, notification);
        }
        this.setState({ notifications });
    }
    componentDidMount() {
        document.addEventListener("click", evt => {
            const target = evt.target;
            const unDismissible = target.hasAttribute("unDismissible");
            const unDismissibleProf = target.hasAttribute("unDismissibleProf");
            if (!unDismissible) this.setState({ showNotifications: false });
            if (!unDismissibleProf) this.setState({ showInfo: false })

        })

    }
    componentDidUpdate(prevProps) {
        const prevSite = prevProps.site;
        const nextSite = this.props.site;
        if (prevSite !== nextSite) {
            this.getLoandNotifications(nextSite);
            this.getProductsNotifications(nextSite);
        };
    }

    avatarClicked() {
        let showInfo = this.state.showInfo;
        if (showInfo) showInfo = false;
        else showInfo = true;
        this.setState({ showInfo });
    }

    showNotifications() {

        let showNotifications = this.state.showNotifications;
        if (showNotifications) showNotifications = false;
        else showNotifications = true;
        this.setState({ showNotifications, hideNotifier: true });
    }

    toogleNav(showNav) {
        if (showNav) showNav = false;
        else showNav = true;
        this.props.showNavInReturn(showNav);

    }

    tempolaryDeleteNotification(id) {
        const notifications = this.state.notifications;
        notifications.delete(id);
        this.setState({ notifications });
    }



    render(props, state) {
        const notifications = Array.from(this.state.notifications.values());
        return (
            <div className={styles.appHeader}>
                <div className={styles.leftSideHeader}>
                    <button onClick={_ => this.toogleNav(props.showNav)} type="button" className={styles.navButtonToogle} >{menuIcon}</button>
                </div>

                <div className={styles.rightSideHeader}>
                    <div className={styles.clientAppState}>
                        <span>Beta</span>
                    </div>
                    <div className={styles.ringContainer}>
                        <button unDismissible onClick={_ => this.showNotifications()} type="button" className={styles.ringIcon}>
                            {notifications.length !== 0 ? !state.hideNotifier ? <span unDismissible></span> : "" : ""}
                            <svg unDismissible xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path unDismissible d="M0 0h24v24H0V0z" fill="none" /><path unDismissible d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" /></svg>
                        </button>
                        <NotificationConents hideNotifications={_ => this.setState({ showNotifications: false })} delete={id => this.tempolaryDeleteNotification(id)} data={(notifications)} showContents={(this.state.showNotifications)} />
                    </div>
                    <div className={styles.userAvatarRow}>
                        <p className={styles.username}>{this.user ? this.user.names : ""}</p>
                        <div className={styles.userContainer}>
                            <div unDismissibleProf className={styles.avatarImage} onClick={_ => this.avatarClicked()}>
                                <svg unDismissibleProf xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path unDismissibleProf d="M0 0h24v24H0z" fill="none" /><path unDismissibleProf d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                            </div>
                            <UserInfo user={this.user} showInfo={(this.state.showInfo)} />
                        </div>

                    </div>

                </div>
            </div>
        );
    }
}