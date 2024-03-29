import { h, Component } from 'preact';
import Button from '../../components/Button';
import Form from '../../components/form';
import Select from '../../components/select-C';
import TextField from '../../components/text-field';
import Toast from '../../components/toast';
import ProductModel from '../../models/products';
import SalesModel from '../../models/sales';
import StockModel from '../../models/stock';
import styles from "./style.scss";

export default class AddNewProductInStock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listOfRows: [],
            recordedData: new Map(),
            products: [],
            isLoading: false,

        }

        this.rowFields = this.rowFields.bind(this);
        this.user = props.user;
        this.sites = this.user.sites;;
    }

    async getProducts(siteName) {
        const didIncludeInUserSites = this.sites.includes(siteName);
        if (!siteName || !didIncludeInUserSites) return;
        const primaryId = this.user.primaryId;
        const productsDefine = this.user.productsDefine;
        this.props.isLoading(true);
        const productRole = productsDefine == "custom" ? "product for purchase" : "both";
        const products = await ProductModel.getProducts(primaryId, productRole, siteName);
        this.setState({ products });
        this.props.isLoading(false);
    }

    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", {errorMessage: true});
        const listOfRows = this.state.listOfRows;
        listOfRows.push(this.rowFields);
        this.setState({ listOfRows });
        this.getProducts(this.props.site);
    }

    componentDidUpdate(prevProps) {
        const prevSite = prevProps.site;
        const nextSite = this.props.site;
        if (prevSite !== nextSite) this.getProducts(nextSite);
    }

    async setSelectedProduct(data, index) {
        const productName = data.label.toLowerCase();
        const primaryId = this.user.primaryId;
        this.props.isLoading(true);
        this.setState({ isLoading: true });
        const currentQuantityOfProductInStock = (await StockModel.getProductInStock(productName, primaryId)).quantity;
        let currentQuantity = 0;
        if (currentQuantityOfProductInStock) currentQuantity = currentQuantityOfProductInStock;
        const value = data.value;
        const recordedData = this.state.recordedData;
        const uid = this.user.uid;
        const dataForMap = { ...recordedData.get(index), uid, currentQuantity };
        delete dataForMap.productId;
        dataForMap.productId = value;
        recordedData.set(index, dataForMap);
        this.setState({ recordedData, isLoading: false });
        this.props.isLoading(false);
    }

    setTypedQuantityValue(evt, index) {
        const value = Number(evt.target.value);
        const name = evt.target.name
        if (name !== "quantity" & name !== "amount") return;
        if (isNaN(value)) return Toast.create(`Enter a valid ${name.toUpperCase()}`, {errorMessage: true});
        const recordedData = this.state.recordedData;
        const uid = this.user.uid;
        const dataForMap = { ...recordedData.get(index), uid };
        dataForMap[name] = value;
        recordedData.set(index, dataForMap);
        this.setState({ recordedData });
    }

    rowFields(index, row) {
        return (
            <div className={styles.addNewSalesRow}>
                <div className={styles.rowHeader}>
                    Product {index + 1}
                </div>
                <Select onChange={data => this.setSelectedProduct(data, index)} name="product" label="Product Name" >
                    {
                        this.state.products.map(product => <option value={product.ref.id} >{product.productName}</option>)
                    }
                </Select>
                <TextField disabled={this.state.isLoading} label="Quantity" name="quantity" onChange={evt => this.setTypedQuantityValue(evt, index)} type="number" />
                <TextField disabled={this.state.isLoading} label="Purchase amount" name="amount" onChange={evt => this.setTypedQuantityValue(evt, index)} type="number" />

            </div>
        )
    }

    addRowField() {
        const listOfRows = this.state.listOfRows;
        listOfRows.push(this.rowFields);
        this.setState({ listOfRows })
    }

    async submitAllReccorded() {
        const site = this.props.site;
        if (!site || !this.sites.includes(site)) return Toast.create("There is no site selected. Please check!", {errorMessage: true});
        const recordedData = this.state.recordedData;
        const unDoneProducts = [];
        const productsReady = [];
        const allReccordedTrans = Array.from(recordedData.values(recordedData));
        if (allReccordedTrans.length == 0) return;
        for (const [key, value] of recordedData) {
            const productId = value.productId;
            const quantity = value.quantity;
            if (!quantity || quantity == "") {
                unDoneProducts.push(value);
            }
            else if (!productId || productId == "") {
                unDoneProducts.push(value);
            }
            else {
                if (!value.amount || value.amount == "") return Toast.create(`The amount can not be empty.`, {errorMessage: true});
                const quantity = Number(value.quantity);
                const amount = Number(value.amount);
                const purchaseUnitPrice = amount / quantity;
                const passedProduct = { ...value, purchaseUnitPrice };
                productsReady.push(passedProduct);
            }

        }
        const onLine = window.navigator.onLine;
        if (!onLine) return Toast.create("There is no internet connection. Please check!", {errorMessage: true});
        if (productsReady.length == 0) return;
        this.props.isLoading(true);
        const uid = this.user.uid;
        const primaryId = this.user.primaryId;
        const failledProducts = [];
        for (const productReady of productsReady) {
            const res = await StockModel.addNewProductInStock(productReady, uid, primaryId, this.user, site);
            if (res.status !== 200) {
                const productDetails = await ProductModel.getSingleProduct(primaryId, site, productReady.productId);
                const failledProductName = productDetails.productName;
                Toast.create(`Failled to save ${failledProductName}`, {errorMessage: true});
            }
        }
        
        if(failledProducts.length !== 0) Toast.create(`All products was saved eccept ${failledProducts.map(failProd=>`${failProd} ,`)}.`, {errorMessage: true});
        else Toast.create(`${productsReady.length == 1 ? "Products" : "Product"} saved succefully.`, {errorMessage: true});        
        this.props.isLoading(false);
    }



    render() {
        return (
            <>
                <div className={styles.newSalesFormContainerFluid}>
                    <div className={styles.formHeader}>
                        <h2>Add new purchases</h2>
                        <button onClick={_ => this.setState({ listOfRows: [], recordedData: new Map() })} className={styles.cleanBtn}>
                            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24" /></g><g><path d="M16,11h-1V3c0-1.1-0.9-2-2-2h-2C9.9,1,9,1.9,9,3v8H8c-2.76,0-5,2.24-5,5v7h18v-7C21,13.24,18.76,11,16,11z M19,21h-2v-3 c0-0.55-0.45-1-1-1s-1,0.45-1,1v3h-2v-3c0-0.55-0.45-1-1-1s-1,0.45-1,1v3H9v-3c0-0.55-0.45-1-1-1s-1,0.45-1,1v3H5v-5 c0-1.65,1.35-3,3-3h8c1.65,0,3,1.35,3,3V21z" /></g></svg>
                        </button>
                    </div>
                    <div className={styles.newSalesFormConteiner}>
                        <Form>
                            {this.state.listOfRows.map((row, index) => row(index, row))}
                            <button onClick={_ => this.addRowField()} className={styles.addProductFieldBtn} type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                            </button>
                        </Form>
                        <div className={styles.submitAllReccorded}>
                            <Button onClick={_ => this.submitAllReccorded()} type="button">Save</Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}