import { h, Component } from 'preact';
import AddOrEditNewPurchaseProduct from '../add-new-purchase-product';
import AddNewPurchase from '../addNewPurchase';
import ListInfoDisplayer from '../list-info-displayer';

export default class PurchasedDetails extends Component {
    constructor() {
        super();
        this.state = {
            currentview: "currentview"
        }

    }

    _purchasedDetails(rowData) {
        return (
            <ListInfoDisplayer>
                <h2>Purchase details</h2>
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
                        <h4>price</h4>
                        <span>:</span>
                        <h5>{rowData.price}</h5>
                    </li>
                    <li>
                        <h4>Registered by</h4>
                        <span>:</span>
                        <h5>{rowData.createdBy}</h5>
                    </li>
                    <li>
                        <h4>Registered on</h4>
                        <span>:</span>
                        <h5>{(rowData.creationTime.toDate()).toLocaleString()}</h5>
                    </li>
                </ul>
                <button onClick={_=>this.setState({currentview: "editPurchase"})} type="button" >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                </button>
            </ListInfoDisplayer>
        );
    }

    _toRender(rowData) {
        switch (this.state.currentview) {
            case "currentview":
                return this._purchasedDetails(rowData);
            case "editPurchase":
                return <AddNewPurchase reflesh={_=>this.props.reflesh()} rowData={rowData} />
            default:
                return this._purchasedDetails();
        }
    }

    render() {
        const rowData = this.props.rowData;
        return this._toRender(rowData);
    }
}