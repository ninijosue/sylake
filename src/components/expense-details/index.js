import { h, Component } from 'preact';
import { allPermission } from '../../generators/routeVerifier';
import UsersModel from '../../models/users';
import AddOrEditNewPurchaseProduct from '../add-new-purchase-product';
import AddNewPurchase from '../addNewPurchase';
import AddOrEditExpense from '../addOrEditExpense';
import ListInfoDisplayer from '../list-info-displayer';
import Loading from '../loading-C';
import Toast from '../toast';
import styles from './style.scss';

export default class ExpenseDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentview: "expenseDetails",
            isLoading: false,
            docCreatorName: ""
        }
        this.user = props.user;
    }

    async getDocumentCreatorInfo() {
        const primaryId = this.user.primaryId;
        const uid = this.props.rowData.createdBy;
        if (!uid) return;
        this.setState({ isLoading: true });
        const docCreator = await UsersModel.getUserInfo(uid, primaryId);
        const docCreatorName = docCreator.names ? docCreator.names : "";
        this.setState({ isLoading: false, docCreatorName });
    }

    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", {errorMessage: true});
        this.getDocumentCreatorInfo()
    }

    _expenseDetails(rowData) {
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;

        return (
            <>
                <Loading visible={this.state.isLoading} />
                <ListInfoDisplayer>
                    <h2>Expense details</h2>
                    <ul>
                        <li>
                            <h4>Expense name</h4>
                            <span>:</span>
                            <h5>{rowData.expenseName.toUpperCase()}</h5>
                        </li>
                        <li>
                            <h4>Price</h4>
                            <span>:</span>
                            <h5>{rowData.price}</h5>
                        </li>
                        <li>
                            <h4>Expense category</h4>
                            <span>:</span>
                            <h5>{rowData.expenseCategory.toUpperCase()}</h5>
                        </li>
                        <li>
                            <h4>Created by</h4>
                            <span>:</span>
                            <h5 className={styles.creatorNames}>{this.state.docCreatorName}</h5>
                        </li>
                        <li>
                            <h4>Created on</h4>
                            <span>:</span>
                            <h5>{(rowData.creationTime.toDate()).toLocaleString()}</h5>
                        </li>
                    </ul>
                    {
                        permissions.includes("edit expense")
                            ? <button onClick={_ => this.setState({ currentview: "editExpense" })} type="button" >
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                            </button>
                            : ""
                    }
                </ListInfoDisplayer>
            </>
        );
    }

    _toRender(rowData) {
        switch (this.state.currentview) {
            case "expenseDetails":
                return this._expenseDetails(rowData);
            case "editExpense":
                return <AddOrEditExpense site={(this.props.site)} user={this.user} reflesh={_ => this.props.reflesh()} rowData={rowData} />;
            default:
                return this._expenseDetails();
        }
    }

    render() {
        const rowData = this.props.rowData;
        return this._toRender(rowData);
    }
}