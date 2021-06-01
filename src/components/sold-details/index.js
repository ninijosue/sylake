import { h, Component } from 'preact';
import { allPermission } from '../../generators/routeVerifier';
import UsersModel from '../../models/users';
import EditSoldProduct from '../edit-sold-product';
import ListInfoDisplayer from '../list-info-displayer';
import Loading from '../loading-C';
import Toast from '../toast';
import styles from './style.scss';

export default class SoldDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentview: "soldDetails",
            isLoading: false,
            docCreatorName: "",
            docUpdaterName: undefined

        }
        this.user = props.user;
    }

    async getDocumentCreatorInfo() {
        const primaryId = this.user.primaryId;

        const uid = this.props.rowData.doneBy;
        if (!uid) return;
        this.setState({ isLoading: true });
        const docCreator = await UsersModel.getUserInfo(uid, primaryId, this.user.isOwner);
        const docCreatorName = docCreator.names ? docCreator.names : "";
        this.setState({ isLoading: false, docCreatorName });
    }

    async getDocUpdator() {
        const primaryId = this.user.primaryId;
        const uid = this.props.rowData.updatedBy;
        if (!uid) return;
        this.setState({ isLoading: true });
        const docCreator = await UsersModel.getUserInfo(uid, primaryId, this.user.isOwner);
        const docUpdaterName = docCreator.names ? docCreator.names : "";
        this.setState({ isLoading: false, docUpdaterName });
    }

    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", {errorMessage: true});
        this.getDocumentCreatorInfo();
        const updatedBy = this.props.rowData.updatedBy;
        if (updatedBy && updatedBy !== "") this.getDocUpdator();
    }

    _editSold(){
        const site = this.props.site;
        if(!site) return Toast.create("There is no site selected. Please check!", {errorMessage: true});
        this.setState({ currentview: "editSold" });
    }

    _soldDetails(rowData) {
        const price = Number(rowData.quantity) * Number(rowData.unitPrice);
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return (
            <>
                <Loading visible={this.state.isLoading} />
                <ListInfoDisplayer>
                    <h2>Sold details</h2>
                    <ul>
                        <li>
                            <h4>Product name</h4>
                            <span>:</span>
                            <h5>{rowData.productName}</h5>
                        </li>
                        <li>
                            <h4>Quantity</h4>
                            <span>:</span>
                            <h5>{rowData.quantity}</h5>
                        </li>
                        <li>
                            <h4>unitPrice</h4>
                            <span>:</span>
                            <h5>{rowData.unitPrice} Rwf</h5>
                        </li>
                        <li>
                            <h4>Price</h4>
                            <span>:</span>
                            <h5>{price.toLocaleString()} Rwf</h5>
                        </li>
                        <li>
                            <h4>Created by</h4>
                            <span>:</span>
                            <h5 className={styles.creatorNames}>{this.state.docCreatorName}</h5>
                        </li>
                        {
                            this.state.docUpdaterName ?
                                <li>
                                    <h4>Updated by</h4>
                                    <span>:</span>
                                    <h5 className={styles.creatorNames}>{this.state.docUpdaterName}</h5>
                                </li>
                                : ""
                        }
                        <li>
                            <h4>Created on</h4>
                            <span>:</span>
                            <h5>{(rowData.creationTime.toDate()).toLocaleString()}</h5>
                        </li>
                        {
                            rowData.updatedTime ?
                                <li>
                                    <h4>Updated on</h4>
                                    <span>:</span>
                                    <h5>{(rowData.updatedTime.toDate()).toLocaleString()}</h5>
                                </li>
                                : ""
                        }
                    </ul>
                    {
                        permissions.includes("edit sales")
                            ? <button onClick={_ => this._editSold()} type="button" >
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
            case "soldDetails":
                return this._soldDetails(rowData);
            case "editSold":
                return <EditSoldProduct site={(this.props.site)} user={this.user} reflesh={_ => this.props.reflesh()} rowData={rowData} />;
            default:
                return this._soldDetails();
        }
    }

    render() {
        const rowData = this.props.rowData;
        return this._toRender(rowData);
    }
}