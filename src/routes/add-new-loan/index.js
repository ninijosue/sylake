import { h, Component, createRef } from 'preact';
import styles from './style.scss';
import CustomerLoanDetails from '../../components/add-edit-customer-loan';
import Form from '../../components/form';
import Button from '../../components/Button';
import ProductModel from '../../models/products';
import StockModel from '../../models/stock';
import Select from '../../components/select-C';
import TextField from '../../components/text-field';
import LoansModel from '../../models/loans';
import SalesModel from '../../models/sales';

export default class AddNewLoan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentView: "customerDetails",
            formData: undefined,
            listOfRows: [],
            recordedData: new Map(),
            productsGroups: new Map(),
            products: [],
            isLoading: false
        }

        this.rowFields = this.rowFields.bind(this);
        this.row = createRef();
        this.user = props.user;
        this.primaryId = this.user.primaryId;
        this.sites = this.user.sites;;
    }

    async getProducts(siteName) {
        const didIncludeInUserSites = this.sites.includes(siteName);
        if(!siteName || !didIncludeInUserSites) return;
        const primaryId = this.user.primaryId;
        const productsDefine = this.user.productsDefine;
        
        this.props.isLoading(true);
        let products = [];
        if (productsDefine == "custom") products = await ProductModel.getProductsWhenDefinedAsCustom(primaryId, siteName);
        else products = await ProductModel.getProducts(primaryId, "both", siteName);
        
        this.setState({products});
        this.props.isLoading(false);
    }

    componentDidMount() {
        // document.addEventListener("sitechange", evt=>{
        //     console.log("site changed", evt.detail);
        //  })
        // const onLine = window.navigator.onLine;
        // if (!onLine) return alert("There is no internet connection.");
        const listOfRows = this.state.listOfRows;
        listOfRows.push(this.rowFields);
        this.setState({ listOfRows });
        this.getProducts(this.props.site);
    }

    componentDidUpdate(prevProps) {
        const prevSite = prevProps.site;
        const nextSite = this.props.site;
        if(prevSite !== nextSite) this.getProducts(nextSite);
    }
    setSite(siteName){
        this.getProducts(siteName);
    }

    async setSelectedProduct(data, index) {
        const site = this.props.site;
        if(!site) return alert("Please choose a site!");
        const productName = data.label.toLowerCase();
        const primaryId = this.user.primaryId;
        const products = this.state.products;
        const productsGroups = this.state.productsGroups;
        this.props.isLoading(true);
        this.setState({ isLoading: true });
        // const currentQuantityOfProductInStock = (await StockModel.getProductInStock(productName, primaryId, site)).quantity;
        const productGroups = await StockModel.getProductGroupsInStock(productName, primaryId, site);
        productsGroups.set(index, productGroups);
        // let currentQuantity = 0;
        // if (currentQuantityOfProductInStock) currentQuantity = currentQuantityOfProductInStock;
        const value = data.value;
        const recordedData = this.state.recordedData;

        const productData = products.filter(pro => pro.productName == productName)[0];
        const productRoleAndName = {
            productRole: productData.productRole,
            productName: productData.productName
        };
        const dataForMap = { ...recordedData.get(index), 
            // currentQuantity, 
            ...productRoleAndName };
        delete dataForMap.productId;
        dataForMap.productId = value;

        recordedData.set(index, dataForMap);
        this.setState({ recordedData, isLoading: false });
        this.props.isLoading(false);
    }


    setTypedQuantityValue(value, index) {
        const recordedData = this.state.recordedData;
        const uid = this.user.uid;
        const dataForMap = { ...recordedData.get(index), uid };
        delete dataForMap.quantity;
        dataForMap.quantity = Number(value);
        recordedData.set(index, dataForMap);
        this.setState({ recordedData });
    }

    setTypedAmountValue(value, index) {
        const recordedData = this.state.recordedData;
        const uid = this.user.uid;
        const dataForMap = { ...recordedData.get(index), uid };
        delete dataForMap.amount;
        dataForMap.amount = Number(value);
        recordedData.set(index, dataForMap);
        this.setState({ recordedData });
    }

    setPurchasedUnitPrice(value, group, index) {
        const recordedData = this.state.recordedData;
        const getSpecifiedData = recordedData.get(index);
        const purchaseUnitPrice = Number(group.purchaseUnitPrice);
        value = Number(value);
        if (isNaN(value || isNaN(purchaseUnitPrice))) return;
        if (value !== purchaseUnitPrice) return;
        const updatedData = { ...getSpecifiedData, purchaseUnitPrice }
        recordedData.set(index, updatedData);
        this.setState({ recordedData });
    }



    rowFields(index, row) {
        const recordedData = this.state.recordedData;
        const productGroups = this.state.productsGroups.get(index);
        const groups = !productGroups ? [] : productGroups;

        return (
            <form>
                <div className={styles.addNewSalesRow} ref={this.row}>
                    <div className={styles.rowHeader}>
                        Product {index + 1}
                    </div>
                    <Select onChange={data => { this.setSelectedProduct(data, index) }} name="product" label="Product Name" >
                        {
                            this.state.products.map(product => <option value={product.ref.id} >{product.productName}</option>)
                        }
                    </Select>
                    <TextField disabled={this.state.isLoading || groups.length === 0} label="Quantity"
                        onChange={evt => this.setTypedQuantityValue(evt.target.value, index)} type="number" />
                        <TextField disabled={this.state.isLoading || groups.length === 0} label="Amount (optional)"
                        onChange={evt => this.setTypedAmountValue(evt.target.value, index)} type="number" />
                    <div className={styles.productInstockToChoose}>
                        <p>Choose the product to dropout</p>
                        {
                            groups.map((group, groupIndex) => (
                                <div className={styles.radiosRow}>
                                    <input onChange={evt => this.setPurchasedUnitPrice(evt.target.value, group, index)} type="radio"
                                        id={`_-radio${index}_${groupIndex}`} name="drone" value={group.purchaseUnitPrice} />
                                    <label for={`_-radio${index}_${groupIndex}`}>{group.purchaseUnitPrice} per unit, total quantity ({group.quantity.toLocaleString()})</label>
                                </div>
                            ))
                        }

                    </div>
                </div>
            </form>
        )
    }

    addRowField() {
        const listOfRows = this.state.listOfRows;
        listOfRows.push(this.rowFields);
        this.setState({ listOfRows });
    }



    async submitAllReccorded() {
        const site = this.props.site;
        if(!site) return alert("Please choose a site");
        const recordedData = new Map();
        const recordedDataInState = this.state.recordedData;
        const unDoneProducts = [];
        const productsReady = [];
        const productsWithRoleOfBoth = [];
        const productsWithRoleOfSales = [];
        const allReccordedTrans = Array.from(recordedDataInState.values());
        if (recordedDataInState.size == 0) return;

        for (const [key, data] of recordedDataInState) {
            const mainKey = data.productId;
            const matchTransions = allReccordedTrans.filter(trans => trans.productId == data.productId);
            if (matchTransions.length !== 1) {
                const getherredTrans = {
                    ...matchTransions[0],
                    quantity: 0
                };

                for (const matchTrans of matchTransions) {
                    getherredTrans.quantity += matchTrans.quantity;
                };
                recordedData.set(mainKey, getherredTrans);
            }
            else {

                recordedData.set(mainKey, data);
            }
        };
        this.props.isLoading(true);

        for (const [key, value] of recordedData) {

            const productId = value.productId;
            const quantity = value.quantity;
            const purchaseUnitPrice = value.purchaseUnitPrice;
            const productInStock = await StockModel.getSpecificProductGroup(this.primaryId, productId, purchaseUnitPrice, site);
            if (!quantity || quantity == "") {
                unDoneProducts.push(value);
            }
            else if (!productId || productId == "") {
                unDoneProducts.push(value);
            }
            else {
                const productsDefine = this.user.productsDefine;
                if (productsDefine == "default") {
                    if (!productInStock) {
                        this.props.isLoading(false);
                        return alert(`There is a problem on product number ${value.productName.toUpperCase()} please verify and try again.`);
                    }
                    const quantity = Number(value.quantity);
                    const stockQuantity = Number(productInStock.quantity);
                    if (quantity > stockQuantity) {
                        this.props.isLoading(false);
                        return alert(`The stock quantity for product (${value.productName.toUpperCase()}) is not enought to serve the the amounte of product.`);
                    }
                    const passedProduct = value;
                    productsReady.push(passedProduct);

                }
                else {
                    const productRole = value.productRole;
                    if (productRole == "product for sale") productsWithRoleOfSales.push(value);
                    else if (productRole == "both") {
                        if (!productInStock) {
                            this.props.isLoading(false);
                            return alert(`There is a problem on product number ${value.productName.toUpperCase()} please verify and try again.`);
                        }
                        const quantity = Number(value.quantity);
                        const stockQuantity = Number(productInStock.quantity);
                        if (quantity > stockQuantity) {
                            this.props.isLoading(false);
                            return alert(`The stock quantity for product (${value.productName.toUpperCase()}) is not enought to serve the the amounte of product.`);
                        }
                        const passedProduct = value;
                        productsWithRoleOfBoth.push(passedProduct);

                    }
                }
            }


        }
        this.props.isLoading(false);
        const onLine = window.navigator.onLine;
        if (!onLine) return alert("There is no internet connection.");
        this.props.isLoading(true);
        const primaryId = this.user.primaryId;
        const productsDefine = this.user.productsDefine;
        const loanDetails = this.state.formData;
        if (productsDefine == "default") {
            const res = await LoansModel.addNewLoanWhenDefinedAsDefault(productsReady, primaryId, loanDetails, this.user, site);
            alert(res.message);
        }
        else {
            try {
                const res = await LoansModel
                    .addNewLoanWhenProductsDefineIsCustomProductRoleNotBoth(productsWithRoleOfSales, primaryId, loanDetails, this.user, site);
                await SalesModel.addNewLoanWhenDefinedAsDefault(productsWithRoleOfBoth, primaryId, loanDetails, this.user, site);
                alert(res.message)
            } catch (error) {
                alert("Failled to save product(s)");
            }

        }
        this.props.isLoading(false);
    }



    products() {
        return (
            <>
                <div className={styles.newSalesFormContainerFluid}>
                    <div className={styles.formHeader}>
                        <h2>Add new credit</h2>
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
        )
    }

    moveToProducts(data) {
        if (data) this.setState({ formData: data, currentView: "products" });

    }

    customerDetailsComponent() {
        return (
            <div className={styles.customerDetailsContainer}>
                <div className={styles.container}>
                    <CustomerLoanDetails site={(this.props.site)} user={this.user} savedDataBefore={this.state.formData} formData={data => this.moveToProducts(data)} />
                </div>
            </div>
        )
    }

    toRender() {
        switch (this.state.currentView) {
            case "customerDetails":
                return this.customerDetailsComponent();
            case "products":
                return this.products();
            default:
                return this.customerDetailsComponent();
        }
    }
    render() {
        return this.toRender();
    }
}
