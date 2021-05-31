import { h, Component, createRef } from 'preact';
import closePopup from '../../helper/closePopUp';
import ProductModel from '../../models/products';
import PurchaseModel from '../../models/purchase';
import Form from '../form';
import Loading from '../loading-C';
import Select from '../select-C';
import TextField from '../text-field';
import styles from "./style.scss";
export default class AddNewPurchase extends Component {
    constructor() {
        super();
        this.state = {
            purchaseProducts: [],
            isLoading: false,
            saveBtnDisabled: false
        };
        this.productName = createRef();
        this.quantity = createRef();
    }

    async getListOfPurchaseProducts() {
        this.setState({ isLoading: true });
        const purchaseProducts = await ProductModel.getProductsToPurchase();
        this.setState({ purchaseProducts, isLoading: false });
    }

    componentDidMount() {
        // const onLine = window.navigator.onLine;
        // if (!onLine) return alert("There is no internet connection.");
        this.getListOfPurchaseProducts();
        const rowData = this.props.rowData;
        const productName = this.productName.current.base.querySelector("input");
        productName.value = rowData ? rowData.productName : "";
        const quantity = this.quantity.current.base.querySelector("input");
        quantity.value = rowData ? rowData.quantity : "";

        if (rowData) {
            this.setState({ saveBtnDisabled: true })
        }
        else {
            this.setState({ saveBtnDisabled: false });
        }


    }

    productsOptions() {
        return this.state.purchaseProducts.map(product => <option value={product.ref.id}>{product.productName}</option>)
    }

    async _formSubmition(data){
        const onLine = window.navigator.onLine;
        if (!onLine) return alert("There is no internet connection.");
        const rowData = this.props.rowData;
        const dataForModel ={
            ...data,
            createdBy: "John doe"
        }

        this.setState({isLoading: true});

        if(!rowData){
            const res = await PurchaseModel.addNewPurchase(dataForModel);
             alert(res.message);
        }
        else{
            const productData = {
                ...dataForModel,
                purchasedProductId: rowData.productRef.id,
                productId: data.productId == "" ? rowData.productId : data.productId
            }
            const res = await PurchaseModel.updatePurchasedProduct(productData);
             alert(res.message);
        }
        
        this.setState({isLoading: false});
        this.props.reflesh();
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
                            <h2 className={styles.formTitle}>{rowData ? "Update purchase" : "Add purchase"}</h2>
                            <Form onSubmit={data => this._formSubmition(data)}>
                                <div>
                                    <Select onChange={_ => this.setState({ saveBtnDisabled: false })} ref={this.productName} name="productId" label="ProductName">
                                        {this.productsOptions()}
                                    </Select>
                                    <TextField onInput={_ => this.setState({ saveBtnDisabled: false })} ref={this.quantity} required name="quantity" label="Quantity" type="number" />

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