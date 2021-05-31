import { h, Component, createRef } from 'preact';
import closePopup from '../../helper/closePopUp';
import ProductModel from '../../models/products';
import PurchaseLogsModel from '../../models/purchase-logs';
import Form from '../form';
import Loading from '../loading-C';
import TextField from '../text-field';
import styles from "./style.scss";
export default class EditPurchasedProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            saveBtnDisabled: false
        };
        this.productName = createRef();
        this.price = createRef();
        this.amount = createRef();
        this.user = props.user;
    }

    componentDidMount() {
        // const onLine = window.navigator.onLine;
        // if (!onLine) return alert("There is no internet connection.");
        const rowData = this.props.rowData;
        const productName = this.productName.current.base.querySelector("input");
        productName.value = rowData ? rowData.productName : "";
        const price = this.price.current.base.querySelector("input");
        price.value = rowData ? rowData.quantity : "";
        const amount = this.amount.current.base.querySelector("input");
        amount.value = rowData ? rowData.amount ? rowData.amount : "" : "";
        if (rowData) {
            this.setState({ saveBtnDisabled: true });
        }
        else {
            this.setState({ saveBtnDisabled: false });
        }
    }

    async _formSubmition(data) {
        const site = this.props.site;
        if (!site) {
            alert("Please choose a site!");
            closePopup();
            return;
        };
        const onLine = window.navigator.onLine;
        if (!onLine) return alert("There is no internet connection.");
        const amount = Number(data.amount);
        const quantity = Number(data.quantity);
        if (!amount || !quantity) return;
        if (isNaN(amount) || isNaN(quantity)) return
        const rowData = this.props.rowData;
        const primaryId = this.user.primaryId;
        const dataForModel = {
            productName: data.productName.toLowerCase(),
            unitPrice: Number(data.unitPrice),
        };
        this.setState({ isLoading: true });
        const previewQuantity = Number(rowData.quantity);
        const previewAmount = Number(rowData.amount);
        const uid = this.user.uid;
        const dataToUpdate = {
            productName: data.productName.toLowerCase(),
            previewQuantity,
            quantity,
            productRef: this.props.rowData.ref,
            amount,
            previewAmount
        }
        const res = await PurchaseLogsModel.updatePurchasedProduct(dataToUpdate, primaryId, site);
        alert(res.message);
        this.setState({ isLoading: false });
        this.props.refleshData();
        closePopup();
    }

    render() {
        const rowData = this.props.rowData;

        return (
            <>
                <Loading visible={this.state.isLoading} />
                <div className={styles.addNewPurchaseContainer}>
                    <div className={styles.formContainerPoition}>
                        <div>
                            <h2 className={styles.formTitle}>{rowData ? "Update product " : "Add product"}</h2>
                            <Form onSubmit={data => this._formSubmition(data)}>
                                <div>
                                    <TextField disabled onInput={_ => this.setState({ saveBtnDisabled: false })} required ref={this.productName} name="productName" label="Product name" />
                                    <TextField onInput={_ => this.setState({ saveBtnDisabled: false })} ref={this.price} required name="quantity" label="Quantity" type="number" />
                                    <TextField onInput={_ => this.setState({ saveBtnDisabled: false })} ref={this.amount} required name="amount" label="Amount" type="number" />
                                </div>
                                <div className={styles.submitBtn}>
                                    <button disabled={this.state.saveBtnDisabled} className="btn_main" type="submit" >{rowData ? "Update" : "Save"}</button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}