import { h, Component } from 'preact';
import { route } from 'preact-router';
import { AppDB } from '../../db';
import { allPermission } from '../../generators/routeVerifier';
import Button from '../Button';
import styles from "./style.scss";

class UserInfo extends Component {
    constructor(props) {
        super(props);
        this.user = props.user;
    }

    async logout() {
        await AppDB.auth().signOut();
    }
    render({ showInfo }, { }) {
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return (
            <div unDismissibleProf className={`${styles.userInfoContainerFluid} ${showInfo ? styles.show : ""}`}>
                <div unDismissibleProf className={styles.userInfoContainer}>
                    <div unDismissibleProf className={styles.userHead}>
                        <div unDismissibleProf className={styles.avatarSection}>
                            <span unDismissibleProf>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            </span>
                        </div>
                        <h4 unDismissibleProf>{this.user.names}</h4>
                    </div>
                    <div unDismissibleProf className={styles.routes}>
                        <h6 unDismissibleProf>Permissions</h6>
                        <div unDismissibleProf className={styles.routesRow}>
                        {
                            permissions.map(permis => <span>{permis}</span>)
                        }
                        </div>
                    </div>
                    <div unDismissibleProf className={styles.logoutBtn}>
                        <Button onClick={_ => this.logout()} type="button" >Logout</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default UserInfo;