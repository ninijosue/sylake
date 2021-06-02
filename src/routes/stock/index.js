import { h, Component } from 'preact';
import { route } from 'preact-router';
import AddNewPurchase from '../../components/addNewPurchase';
import { ColDef, DataTable } from '../../components/data-table';
import PurchasedDetails from '../../components/purchased-details';
import popup from '../../helper/popUp';
import DashboardModel from '../../models/dashboard';
import StockModel from '../../models/stock';
import styles from "./style";
import FilterByDateFields from '../../components/filter-by-date-fields/index';
import { allPermission } from '../../generators/routeVerifier';
import Toast from '../../components/toast';

export default class Stock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: undefined,
            allPurchases: [],
            checkedData: new Map(),
            totalAmountInStock: 0,
            searchValue: ""
        }
        this._rowDef = this._rowDef.bind(this);
        this.user = props.user;
        this.sites = this.user.sites;
    }

    async _getAllPuchases(site) {
        const siteName = this.props.site || site;
        const didIncludeInUserSites = this.sites.includes(siteName);
        if (!siteName || !didIncludeInUserSites) return;
        this.props.isLoading(true);
        const primaryId = this.user.primaryId;
        const allPurchases = await StockModel.getAllGoodsInStock(primaryId, siteName);
        this.setState({ allPurchases });
        this.props.isLoading(false);
    }

    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", { errorMessage: true })
        this._getAllPuchases();
    }
    componentDidUpdate(prevProps) {
        const prevSite = prevProps.site;
        const nextSite = this.props.site;
        if (prevSite !== nextSite) this._getAllPuchases(nextSite);
    }

    rowClicked(type, rowData) {
        if (type == "INPUT") return;
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        if (!permissions.includes("stock")) return;
        const checkedData = this.state.checkedData;
        checkedData.clear();
        this.setState({ rowData, checkedData });
        route(`stock/${rowData.ref.id}`)
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

    _addNewProductInStock() {
        this.setState({ checkedData: new Map() });
        route("/addNewProductInStock");
    }

    async _deleteStockProduct() {
        const productsToDelete = Array.from(this.state.checkedData.values());
        const primaryId = this.user.primaryId;
        if (productsToDelete.length == 0) return;
        const ask = confirm(`Do you want delete ${productsToDelete.length == 1 ? "this" : "these"} ${productsToDelete.length == 1 ? "product" : "products"}?`);
        if (!ask) return;
        this.props.isLoading(true);
        const res = await StockModel.deleteProductFromStock(productsToDelete);
        if (res.status !== 200) Toast.create(res.message, { errorMessage: true });
        else Toast.create(res.message, { successMessage: true });
        this.props.isLoading(false);
        await this._getAllPuchases();
        this.setState({ checkedData: new Map() });


    }

    _rowDef(row, index, rowData) {
        return <tr onClick={evt => this.rowClicked(evt.target.tagName, rowData)}>
            <td>
                {/* <input checked={this.state.checkedData.has(rowData.ref.id)} onChange={evt => this._onCheck(evt, rowData)} type="checkbox" /> */}
                {index + 1}
            </td>
            <td>{row.productName.toUpperCase()}</td>
            <td>{row.quantity.toLocaleString()}</td>
            <td>{row.unitPrice.toLocaleString()}</td>
            <td>{row.price.toLocaleString()}</td>
        </tr>;
    }



    footDef(res) {
        return <tr>
            <td></td>
            <td>Total</td>
            <td>{res.quantity ? res.quantity.toLocaleString() : ""}</td>
            <td></td>
            <td>{res.price ? res.price.toLocaleString() : ""}</td>
        </tr>
    }

    render(props) {
        const checkedData = Array.from(this.state.checkedData.values());
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return (
            <>
                <div className={styles.tableTitle}>
                    <h2>Stock</h2>
                </div>
                {/* <div className={styles.totalSection}>
                    <h3>Total amount: {this.state.totalAmountInStock.toLocaleString()} Rwf</h3>
                </div> */}
                <div className={styles.headerBtns}>
                    <div className={`${styles.tableNavigivationsBtns} ${styles.categoryNavigationsBtn}`}>
                        {
                            permissions.includes("add purchase")
                                ? <button type="button" onClick={_ => this._addNewProductInStock()} > Add new </button>
                                : ""
                        }
                        <span className={styles.btnSpacing}></span>
                        {
                            permissions.includes("stock")
                                ? <button className={styles.deletePurchase} onClick={_ => route("/stock/purchaseLogs")} >Purchase logs</button>
                                : ""
                        }
                        {/* <span className={styles.btnSpacing}></span>
                        {
                            permissions.includes("delete purchase")
                            ? <button disabled={!!checkedData.length == 0} type="button" onClick={_ => this._deleteStockProduct()} >Delete</button>
                            : ""
                        } */}
                    </div>
                </div>
                <div className={styles.tableSection}>
                    <div className={styles.tableHeader}>
                        <div className={styles.leftSide}>
                            <div className={styles.searchInput}>
                                <label for="searchInput">
                                <svg  height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                                </label>
                                <input onInput={evt => this.setState({ searchValue: evt.target.value })} id="searchInput" type="text" placeholder="Search" />
                            </div>
                        </div>
                        <div className={styles.rightSide}>
                            {/* <button title="Filter" onClick={_ => this.showFilter()} type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" /></svg>
                            </button> 
                            */}
                        </div>
                    </div>
                    <DataTable footDef={this.footDef} searchValue={(this.state.searchValue)} rowDef={this._rowDef} className={`${styles.tableContainer}`} showRowNumbers data={this.state.allPurchases}>
                        <ColDef name="productName" >Product name</ColDef>
                        <ColDef calculate={(a, b) => a + b} name="quantity" >Quantity</ColDef>
                        <ColDef name="unitPrice" >Unit price ({this.user.moneyDescription})</ColDef>
                        <ColDef calculate={(a, b) => a + b} name="price" >Price ({this.user.moneyDescription})</ColDef>
                    </DataTable>
                </div>
            </>
        );
    }
}