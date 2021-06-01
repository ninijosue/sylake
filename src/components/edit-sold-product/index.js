import { h, Component, createRef } from 'preact';
import closePopup from '../../helper/closePopUp';
import ProductModel from '../../models/products';
import SalesModel from '../../models/sales';
import StockModel from '../../models/stock';
import Form from '../form';
import Loading from '../loading-C';
import Select from '../select-C';
import TextField from '../text-field';
import Toast from '../toast';
import styles from "./style.scss";
export default class EditSoldProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
            salesProducts: [],
            productIdForSale: undefined,
            isLoading: false,
            updateBtnDisabled: true,
            productGroupsInStock: [],
            currentPurUnitPrice: undefined
        }

        this.productName = createRef();
        this.quantity = createRef();
        this.amount = createRef();
        this.user = props.user;
        this.primaryId = this.user.primaryId;
    }

    async getListOfProducts() {
        this.setState({ isLoading: true });
        const site = this.props.site;
        if(!site) return;
        // const primaryId = this.user.primaryId;
        const productsDefine = this.user.productsDefine;
        let products;
        if(productsDefine == "custom") products = await ProductModel.getProductsWhenDefinedAsCustom(this.primaryId, site);
        else products = await ProductModel.getProducts(this.primaryId, "both", site);
        
        const rowData = this.props.rowData;
        if(rowData){
            const foundProduct = products.filter(d => d.productName == rowData.productName);
            const productIdForSale = foundProduct.length == 1 ? foundProduct[0].ref.id : undefined;
            this.setState({productIdForSale});
        }
        this.setState({ salesProducts: products, isLoading: false });
    }
    async getProductInStock(productName) {
        
    }

    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", {errorMessage: true});
        this.getListOfProducts();
        const rowData = this.props.rowData;
        this.getProductInStock(rowData.productName)
        const quantityInput = this.quantity.current.base.querySelector("input");
        const amountInput = this.amount.current.base.querySelector("input");
        const productNameField = this.productName.current.input.current.base.querySelector("input");
        productNameField.value = rowData ? rowData.productName : "";
        quantityInput.value = rowData ? rowData.quantity : "";
        amountInput.value = rowData ? Number(rowData.quantity) * Number(rowData.unitPrice)  : "";
        this.setState({currentPurUnitPrice: rowData.purchaseUnitPrice});

    }

    async _formSubmition(data) {
        const onLine = window.navigator.onLine;
        const site = this.props.site;
        if (!onLine) return Toast.create("There is no internet connection. Please check!", {errorMessage: true});
        if(!site) return Toast.create("There is no site selected. Please check!", {errorMessage: true});
        const IntialproductIdForSale = this.state.productIdForSale;
        const rowData = this.props.rowData;
        const submProductId = data.productId;
        const purchaseUnitPrice = data.purchaseUnitPrice || rowData.purchaseUnitPrice;
        const productSelectedId = !submProductId || submProductId == "" ? IntialproductIdForSale : submProductId ;
        const primaryId = this.user.primaryId;
        let unitPrice;
        if(data.amount || data.amount !== "" ){
            if(isNaN(data.amount) && isNaN(data.quantity)) return;
            unitPrice = Number(data.amount) / Number(data.quantity);
        }
        else{
            this.setState({isLoading: true});
            const rootProduct = await ProductModel.getSingleProduct(this.primaryId, site, productSelectedId);
            this.setState({isLoading: false});
            if(!rootProduct) return Toast.create("Product not found!", {errorMessage: true});
            unitPrice = rootProduct.unitPrice;
        }
        if(!data.quantity || !purchaseUnitPrice || isNaN(purchaseUnitPrice) ) return;
        if(!productSelectedId || "") return;
        this.setState({ isLoading: true });
        const prevPurchaseUnitPrice = rowData.purchaseUnitPrice;
        const price = Number(data.quantity) * unitPrice;
        const productData = {
            ...rowData,
            price,
            purchaseUnitPrice: Number(purchaseUnitPrice),
            prevPurchaseUnitPrice,
            prevProductName: rowData.productName,
            unitPrice,
            productId: productSelectedId,
            quantity: Number(data.quantity),
            updatedBy: this.user.uid,
        };

        const productId = rowData.ref.id;
        const initialQuantity = rowData.quantity;
        if(!initialQuantity) return;
        const res = await SalesModel.updateSoldProduct(
            productData, 
            productId, 
            primaryId, 
            initialQuantity,
            this.user,
            site
            );
        if(res.status !== 200) Toast.create(res.message, {errorMessage: true});
        else Toast.create(res.message, {successMessage: true});
        this.setState({ isLoading: false });
        this.props.reflesh();
        closePopup();
    }

    productsOptions() {
        return this.state.salesProducts.map(product => <option value={product.ref.id}>{product.productName}</option>)
    }
    
    async productChanged(data){
        const site = this.props.site;
        const productName = data.label.toLowerCase();
        if(!productName || !site || !this.primaryId ) return;
        this.setState({ isLoading: true });
        const productGroupsInStock = await StockModel.getProductGroupsInStock(productName, this.primaryId, site);
        if(productGroupsInStock.length == 0) this.setState({updateBtnDisabled: true});
        else this.setState({updateBtnDisabled: false});
        this.setState({ isLoading: false, productGroupsInStock });
    }

    render(_, state) {
        const currentPurUnitPrice = state.currentPurUnitPrice;
        return (
            <>
                <Loading visible={this.state.isLoading} />
                <div className={styles.addNewPurchaseContainer}>
                    <div className={styles.formContainerPoition}>
                        <div>
                            <h2 className={styles.formTitle}> Edit sold product</h2>
                            <Form onSubmit={data => this._formSubmition(data)}>
                                <div>
                                    <Select onChange={data => this.productChanged(data)} ref={this.productName} name="productId" label="ProductName">
                                        {this.productsOptions()}
                                    </Select>
                                    <TextField onInput={_ => this.setState({ updateBtnDisabled: false })} ref={this.quantity} required name="quantity" label="Quantity" type="number" />
                                    <TextField onInput={_ => this.setState({ updateBtnDisabled: false })} ref={this.amount} name="amount" label="Amount (optional)" type="number" />
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
                                    <button disabled={this.state.updateBtnDisabled} className="btn_main" type="submit" >Update</button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}