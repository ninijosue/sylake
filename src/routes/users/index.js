import { h, Component } from 'preact';
import { route } from 'preact-router';
import AddOrEditUser from '../../components/add-edit-user';
import { ColDef, DataTable } from '../../components/data-table';
import Toast from '../../components/toast';
import UserDetail from '../../components/user-detail';
import { allPermission } from '../../generators/routeVerifier';
import popup from '../../helper/popUp';
import UsersModel from '../../models/users';
import styles from "./style";

export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: undefined,
            allUsers: [],
            checkedData: new Map()
        }
        this._rowDef = this._rowDef.bind(this);
        this.user = props.user;
    }

    async _getAllUsers() {
        const user = this.props.user;
        const primaryId = this.user.primaryId;
        this.props.isLoading(true);
        const allUsers = await UsersModel.getAllUsers(primaryId);
        this.setState({ allUsers });
        this.props.isLoading(false);
    }

    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", {errorMessage: true})
        this._getAllUsers();
    }

    rowClicked(type, rowData) {
        if (type == "INPUT") return;
        const checkedData = this.state.checkedData;
        checkedData.clear();
        this.setState({ checkedData });
        popup(<UserDetail user={this.user} backedRowData={data => this.props.rowData(rowData)} reflesh={_ => this._getAllUsers()} rowData={rowData} />);
    }

    _onCheck(evt, rowData) {
        const checkedData = this.state.checkedData;
        if (!evt.target.checked) {
            checkedData.delete(rowData.ref.id);
            this.setState({ checkedData });
        }
        else {
            checkedData.set(rowData.ref.id, rowData);
            this.setState({ checkedData });
        }

    }

    _addUser() {
        route("users/addUser");
    }

    async _deleteUsers() {
        const usersToDelete = Array.from(this.state.checkedData.values());
        const ask = confirm(`Do you want delete ${usersToDelete.length == 1 ? "this user" : "these users"} `);
        if (!ask) return;
        this.props.isLoading(true);
        for (const user of usersToDelete) {
            const status = await UsersModel.deleteUser(user);
            if (status !== 200) {
                this.props.isLoading(false);
                return Toast.create(`Failled to delete ${user.names}`, {errorMessage: true});
            };
        }

        this.props.isLoading(false);
        this._getAllUsers();
    }


    _rowDef(row, index, rowData) {
        const hasBeenChecked = this.state.checkedData.has(rowData.ref.id);
        return <tr onClick={evt => this.rowClicked(evt.target.tagName, rowData)}>
            <td><input checked={hasBeenChecked} type="checkbox" onChange={evt => this._onCheck(evt, rowData)} /></td>
            <td>{index + 1}</td>
            <td>{row.names.toUpperCase()}</td>
            <td>{row.email}</td>
            <td>{rowData.phoneNumber}</td>
        </tr>;
    }

    render() {
        const checkedData = Array.from(this.state.checkedData.values());
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;

        return (
            <>
                <div className={styles.tableTitle}>
                    <h2>Users</h2>
                </div>
                <div className={styles.headerBtns}>
                    <div className={`${styles.tableNavigivationsBtns} ${styles.categoryNavigationsBtn}`}>
                        <button className={styles.deletePurchase} onClick={_ => this._deleteUsers()} disabled={checkedData.length !== 0 ? false : true}>
                            Delete
                        </button>
                        <span className={styles.btnSpacing}></span>
                        {
                            permissions.includes("add user")
                                ? <button className={styles.deletePurchase} onClick={_ => this._addUser()}>
                                    Add user
                                </button>
                                : ""
                        }
                    </div>
                </div>
                <div className={styles.tableSection}>
                    <DataTable rowDef={this._rowDef} className={`${styles.tableContainer}`} showRowNumbers data={this.state.allUsers}>
                        <ColDef name="names" >Names</ColDef>
                        <ColDef name="email" >Email</ColDef>
                        <ColDef name="phoneNumber" >PhoneNumber</ColDef>
                    </DataTable>
                </div>
            </>
        );
    }
}