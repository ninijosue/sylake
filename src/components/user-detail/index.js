import { h, Component } from 'preact';
import UsersModel from '../../models/users';
import AddOrEditUser from '../add-edit-user';
import ListInfoDisplayer from '../list-info-displayer';
import Loading from '../loading-C';
import styles from "./style.scss";
import { closeIcon } from '../../assets/icons/icons';
import { route } from 'preact-router';
import closePopup from '../../helper/closePopUp';
import { allPermission } from '../../generators/routeVerifier';
import Toast from '../toast';
export default class UserDetail extends Component {

    constructor(props) {
        super();
        this.state = {
            currentView: "userInfo",
            isLoading: false,
            permittedRessources: [],
        };
        this.rowData = props.rowData;
        this.user = props.user;
        this.permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;

    }

    componentDidMount() {
        const permittedRessources = this.rowData.permittedRessources;
        this.setState({ permittedRessources });
    }

    async resetPassWord() {
        const email = this.props.rowData.email;
        this.setState({ isLoading: true });
        const res = await UsersModel.sendLinkToResetPassword(email);
        if(res.status !== 200) Toast.create(res.message, {errorMessage: true});
        else Toast.create(res.message, {successMessage: true});
        this.setState({ isLoading: false });
    }

    edit() {
        const rowData = this.props.rowData;
        this.props.backedRowData(rowData);
        route(`users/editUser/${rowData.ref.id}`);
        closePopup()
    }

    async removeRessource(ressourceToRemove) {
        const primaryId = this.user.primaryId;
        const givenRessources = this.state.permittedRessources;
        const remainRessources = [];
        const docRef = this.rowData.ref;
        for (const ressource of givenRessources) {
            if (ressource !== ressourceToRemove) {
                remainRessources.push(ressource);
            }
        }
        this.setState({ isLoading: true });
        const res = await UsersModel.removeRessources(docRef, remainRessources)
        if (res.status !== 200) Toast.create(res.message, {errorMessage: true});
        else this.setState({ permittedRessources: remainRessources });
        this.setState({ isLoading: false });
        this.props.reflesh();
    }

    permissionsComponent() {
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return (
            <div className={styles.ressourcesContainer}>
                <label>Permitted ressources</label>
                {
                    this.state.permittedRessources.map(ressource => {
                        return (
                            <div className={styles.ressource}>
                                <h5>{ressource}</h5>
                                {
                                    permissions.includes("edit user")
                                        ? <button type="button" onClick={_ => this.removeRessource(ressource)}>{closeIcon}</button>
                                        : ""
                                }
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    assignedSites() {
        const rowData = this.props.rowData;
        const sites = rowData ? rowData.sites ? rowData.sites : [] : [];

        return (
            <div className={`${styles.ressourcesContainer} ${styles.butAlsoIsSitesContainerList}`}>
                <label>Sites</label>
                {
                    sites.map(ressource => {
                        return (
                            <div className={styles.ressource}>
                                <h5>{ressource}</h5>
                                <button type="button" onClick={_ => this.removeRessource(ressource)}>{closeIcon}</button>
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    _userInfo(rowData) {
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return (
            <>
                <Loading visible={this.state.isLoading} />
                <ListInfoDisplayer>
                    <h2>{rowData.names} information</h2>
                    <ul>
                        <li>
                            <h4>Username</h4>
                            <span>:</span>
                            <h5>{rowData.names}</h5>
                        </li>
                        <li>
                            <h4>Email</h4>
                            <span>:</span>
                            <h5>{rowData.email}</h5>
                        </li>
                        <li>
                            <h4>ID number</h4>
                            <span>:</span>
                            <h5>{rowData.idNumber}</h5>
                        </li>
                        <li>
                            <h4>Phone number</h4>
                            <span>:</span>
                            <h5>{rowData.phoneNumber}</h5>
                        </li>

                        <li>
                            <h4 className={styles.sendLink}><a onClick={_ => this.resetPassWord()} role="button" type="button">Reset password</a></h4>
                        </li>
                    </ul>
                    {
                        permissions.includes("edit user")
                            ? <button onClick={_ => this.edit()} type="button" >
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                            </button>
                            : ""
                    }
                </ListInfoDisplayer>
                {this.assignedSites()}
                {this.permissionsComponent()}
            </>
        );
    }

    _toRender(rowData) {
        switch (this.state.currentView) {
            case "userInfo":
                return this._userInfo(rowData);
            case "editUserInfo":
                return <AddOrEditUser reflesh={_ => this.props.reflesh()} rowData={rowData} />
            default:
                return this._userInfo();
        }
    }

    render(props) {
        const rowData = props.rowData;
        return this._toRender(rowData);
    }
}