import { h, Component } from 'preact';
import { ColDef, DataTable } from '../../components/data-table';
import popup from '../../helper/popUp';
import ProductModel from '../../models/products';
import styles from "./style";
import Toast from '../../components/toast';
import AddOrEditProduct from '../../components/add-edit-product';
import { allPermission } from '../../generators/routeVerifier';

export default class Products extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: undefined,
            products: [],
            checkedData: new Map()
        }
        this._rowDef = this._rowDef.bind(this);
        this.user = props.user;
        this.productsDefine = this.user.productsDefine;
        this.sites = this.user.sites;;
    }

    async _getAllProducts(siteName) {
        console.log("here we are");
        const didIncludeInUserSites = this.sites.includes(siteName);
        if(!siteName || !didIncludeInUserSites) return;
        this.props.isLoading(true);
        const primaryId = this.user.primaryId;
        const products = await ProductModel.getAllProductsOfMine(primaryId, siteName);
        this.setState({ products });
        this.props.isLoading(false);
    }

    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", {errorMessage: true});
        document.addEventListener("sitechange", evt=>{})
        this._getAllProducts(this.props.site);
    }

    componentDidUpdate(prevProps) {
        const prevSite = prevProps.site;
        const nextSite = this.props.site;
        if(prevSite !== nextSite) this._getAllProducts(nextSite);
    }

    refleshData() {
        this._getAllProducts(this.props.site);
    }

    rowClicked(type, rowData) {
        if (type == "INPUT") return;
        const site = this.props.site;
        const isInUserSites = this.sites.includes(site);
        if(!site || !isInUserSites) return Toast.create("There is no site selected. Please check!", {errorMessage: true});
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        if (!permissions.includes("edit product")) return;
        const checkedData = this.state.checkedData;
        checkedData.clear();
        this.setState({ rowData, checkedData });
        popup(<AddOrEditProduct site={(this.props.site)} user={this.user} refleshData={_ => this.refleshData()} rowData={rowData} />)

    }

    _onCheck(evt, rowData) {
        const checkedData = this.state.checkedData;
        if (!evt.target.checked) {
            checkedData.delete(rowData.ref.id);
            this.setState({ checkedData });
        }
        else {
            checkedData.set(rowData.ref.id, rowData);
            this.setState({ checkedData });
        }

    }

    _addNewProduct() {
        const site = this.props.site;
        const isInUserSites = this.sites.map(s=>s.trim()).includes(site);
        if(!site || !isInUserSites) return Toast.create("There is no site selected. Please check!", {errorMessage: true});
        popup(<AddOrEditProduct site={site} user={this.user} refleshData={_ => this.refleshData()} />);
    }

    async _deleteProducts() {
        const site = this.props.site;
        if(!site) return Toast.create("There is no site selected. Please check!", {errorMessage: true});
        const primaryId = this.user.primaryId;
        const productsToDelete = Array.from(this.state.checkedData.values());
        const ask = confirm(`Do you want delete ${productsToDelete.length == 1 ? "this" : "these"} ${productsToDelete.length == 1 ? "product" : "products"}?`);
        if (!ask) return;
        this.props.isLoading(true);
        const res = await ProductModel.deleteProducts(productsToDelete);
        this.props.isLoading(false);
        await this._getAllProducts();
        this.setState({ checkedData: new Map() })
    }

    _rowDef(row, index, rowData) {
        return <tr onClick={evt => this.rowClicked(evt.target.tagName, rowData)}>
            <td><input type="checkbox" onChange={evt => this._onCheck(evt, rowData)} /></td>
            <td>{row.productName.toUpperCase()}</td>
            {
                this.productsDefine == "custom"
                    ? <td>{row.productRole.toUpperCase()}</td>
                    : ""
            }
            <td>{row.unitPrice.toLocaleString()}</td>
            <td>{row.productUnitName ? row.productUnitName.toUpperCase() : "-"}</td>
            <td>{row.notifyMeWhenRemain ? row.notifyMeWhenRemain.toLocaleString() : "-"}</td>
        </tr>;
    }

    render() {
        const checkedData = Array.from(this.state.checkedData.values());
        const moneyDiscription = this.user.moneyDiscription;
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        console.log("sites", this.props.site);
        return (
            <>
                <div className={styles.tableTitle}>
                    <h2>Products</h2>
                </div>
                <div className={styles.headerBtns}>
                    <div className={`${styles.tableNavigivationsBtns} ${styles.categoryNavigationsBtn}`}>

                        {
                            permissions.includes("delete product")
                                ? <button className={styles.deletePurchase} onClick={_ => this._deleteProducts()} disabled={checkedData.length !== 0 ? false : true}>
                                    Delete product
                                </button>
                                : ""
                        }
                        <span className={styles.btnSpacing}></span>
                        {
                            permissions.includes("add product")
                                ? <button type="button" onClick={_ => this._addNewProduct()} >
                                    Add product
                                </button>
                                : ""
                        }
                    </div>
                </div>
                <div className={styles.tableSection}>
                    <DataTable rowDef={this._rowDef} className={`${styles.tableContainer}`} showCheckBoxes data={this.state.products}>
                        <ColDef name="productName" >Product name</ColDef>
                        {
                            this.productsDefine == "custom"
                                ? <ColDef name="productRole" >Product role</ColDef>
                                : ""

                        }
                        <ColDef name="unitPrice" >Price ({moneyDiscription})</ColDef>
                        <ColDef name="productUnitName" >Per (Product unit)</ColDef>
                        <ColDef name="notifyMeWhenRemain" >Notify me when remain</ColDef>
                    </DataTable>
                </div>
            </>
        );
    }
}