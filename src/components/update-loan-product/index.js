import { h, Component, createRef } from 'preact';
import closePopup from '../../helper/closePopUp';
import LoansModel from '../../models/loans';
import ProductModel from '../../models/products';
import StockModel from '../../models/stock';
import Form from '../form';
import Loading from '../loading-C';
import Select from '../select-C';
import TextField from '../text-field';
import styles from "./style.scss";

export default class UpdateLoanProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            products: [],
            productGroupsInStock: [],
            saveBtnDisabled: false,
            currentPurUnitPrice: undefined
        };
        this.user = props.user;
        this.rowData = props.rowData;
        this.productName = createRef();
        this.quantity = createRef();
        this.primaryId = this.user.primaryId;
    }

    async getProducts() {
        const site = this.props.site;
        const productsDefine = this.user.productsDefine;
        this.setState({ isLoading: true });
        if (productsDefine == "custom") {
            const products = await ProductModel.getProductsWhenDefinedAsCustom(this.primaryId, site);
            this.setState({ products });
        }
        else {
            const products = await ProductModel.getProducts(this.primaryId, "both", site);
            this.setState({ products });
        }
        this.setState({ isLoading: false });
    }

    async getProductInStock(productName) {
        const site = this.props.site;
        if (!site || !this.primaryId) return;
        this.setState({ isLoading: true });
        const productGroupsInStock = await StockModel.getProductGroupsInStock(productName, this.primaryId, site);
        this.setState({ isLoading: false, productGroupsInStock });
    }

    componentDidMount() {
        this.getProducts();
        const productInput = this.productName.current.input.current.base.querySelector("input");
        productInput.value = this.rowData ? this.rowData.productName : "";
        const quantityInput = this.quantity.current.base.querySelector("input");
        quantityInput.value = this.rowData ? this.rowData.quantity : "";
        const productName = this.rowData.productName;
        this.getProductInStock(productName);
        this.setState({currentPurUnitPrice: this.rowData.purchaseUnitPrice});
    }

    async _formSubmition(data) {
        const site = this.props.site;
        if (!site) return alert("There is no site selected!");
        if (!data) return;
        let productName = data.productName;
        const quantity = Number(data.quantity);
        const purchaseUnitPrice = Number(data.purchaseUnitPrice);
        if (isNaN(quantity) || isNaN(purchaseUnitPrice)) return;
        if (productName == "") productName = this.rowData.productName;
        const dataForFire = { productName, quantity,purchaseUnitPrice  };
        this.setState({ isLoading: true })
        const res = await LoansModel.updateLoanProduct(this.primaryId, dataForFire, this.rowData, site);
        this.setState({ isLoading: false });
        this.props.reflesh()
        alert(res.message);
        closePopup()
    }

    async productChanged(selectedData){
        if(!selectedData.value) return;
        const productName = selectedData.value.toLowerCase()
        const site = this.props.site;
        if (!site || !this.primaryId) return alert("There no site selected!");
        this.setState({isLoading: true });
        const productGroupsInStock = await StockModel.getProductGroupsInStock(productName, this.primaryId, site);
        if(productGroupsInStock.length == 0) this.setState({saveBtnDisabled: true});
        else this.setState({saveBtnDisabled: false})
        this.setState({ isLoading: false, productGroupsInStock });
    }

    render(_, state) {
        const disabled = state.isLoading ? state.isLoading : state.saveBtnDisabled;
        const currentPurUnitPrice = state.currentPurUnitPrice;
        return (
            <>
                <Loading visible={this.state.isLoading} />
                <div className={styles.addNewPurchaseContainer}>
                    <div className={styles.formContainerPoition}>
                        <div>
                            <h2 className={styles.formTitle}>{this.rowData ? "Update product" : "Add product"}</h2>
                            <Form onSubmit={data => this._formSubmition(data)}>
                                <div>
                                    <Select ref={this.productName} onChange={value => this.productChanged(value)} label="Product role" name="productName">
                                        {
                                            this.state.products.map(product => <option name={product.productName} value={product.productName.toLowerCase()} >{product.productName.toUpperCase()}</option>)
                                        }
                                    </Select>
                                    <TextField ref={this.quantity} onInput={_ => this.setState({ saveBtnDisabled: false })} required name="quantity" label="Number of items" type="number" />
                                </div>
                                <div className={styles.radioSelectForProd}>
                                    {
                                        state.productGroupsInStock.map((group, index) => {
                                            const value = group.purchaseUnitPrice;
                                            return(
                                                <div className={styles.singleSlelectElt}>
                                                    <input checked={value == currentPurUnitPrice} onChange={_=>this.setState({currentPurUnitPrice: value})} id={`stock__-${index}`} required type="radio" name="purchaseUnitPrice" value={value} />
                                                    <label for={`stock__-${index}`}>Purchased unit price is {group.purchaseUnitPrice} full quantity is {group.quantity}</label>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                <div className={styles.submitBtn}>
                                    <button disabled={disabled} className="btn_main" type="submit" >Update</button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
