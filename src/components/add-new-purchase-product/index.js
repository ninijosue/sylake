import { h, Component, createRef } from 'preact';
import closePopup from '../../helper/closePopUp';
import ProductModel from '../../models/products';
import Form from '../form';
import Loading from '../loading-C';
import TextField from '../text-field';
import styles from "./style.scss";
export default class AddOrEditNewPurchaseProduct extends Component {
    constructor() {
        super();
        this.state = {
            isLoading: false,
            saveBtnDisabled: false
        };
        this.productName = createRef();
        this.price = createRef();
    }

    componentDidMount() {
        // const onLine = window.navigator.onLine;
        // if (!onLine) return alert("There is no internet connection.");
        const rowData = this.props.rowData;
        const productName = this.productName.current.base.querySelector("input");
        productName.value = rowData ? rowData.productName : "";
        const price = this.price.current.base.querySelector("input");
        price.value = rowData ? rowData.unitPrice : "";

        if (rowData) {
            this.setState({ saveBtnDisabled: true });
        }
        else {
            this.setState({ saveBtnDisabled: false });
        }
    }

    async _formSubmition(data) {
        const onLine = window.navigator.onLine;
        if (!onLine) return alert("There is no internet connection.");
        const rowData = this.props.rowData;
        this.setState({ isLoading: true });
        if (!rowData) {
            const res = await ProductModel.addProductToPurchase(data);
            alert(res.message);
        }
        else{
            const dataToUpdate = {
                ...data,
                docId: rowData.ref.id
            }

            const res = await ProductModel.updateProductsToPurchase(dataToUpdate);
        }
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
                            <h2 className={styles.formTitle}>{rowData ? "Update product to purchase" : "Add product to purchase"}</h2>
                            <Form onSubmit={data => this._formSubmition(data)}>
                                <div>
                                    <TextField onInput={_ => this.setState({ saveBtnDisabled: false })} required ref={this.productName} name="productName" label="Product name" />
                                    <TextField onInput={_ => this.setState({ saveBtnDisabled: false })} ref={this.price} required name="unitPrice" label="unitPrice" type="number" />
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