import { h, Component } from 'preact';
import { route } from 'preact-router';
import { userIcon } from '../../assets/icons/icons';
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
                            <span unDismissibleProf>{userIcon}</span>
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