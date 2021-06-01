import { h, Component } from 'preact';
import { searchIcon } from '../../assets/icons/icons';
import { ColDef, DataTable } from '../../components/data-table';
import FilterByDateFields from '../../components/filter-by-date-fields';
import SoldDetails from '../../components/sold-details';
import Toast from '../../components/toast';
import { allPermission } from '../../generators/routeVerifier';
import popup from '../../helper/popUp';
import { choosenDate } from '../../helper/utils';
import ProductModel from '../../models/products';
import SalesModel from '../../models/sales';
import styles from "./style";

export default class Sales extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: undefined,
            allSales: [],
            checkedData: new Map(),
            totalAmountOfSales: 0,
            showFilter: false,
            sales: [],
            searchValue: "",
            data: [],
            date: undefined
        }
        this._rowDef = this._rowDef.bind(this);
        this.user = props.user;
        this.sites = this.user.sites;
    }

    async _getAllSales(siteName, date) {
        const didIncludeInUserSites = this.sites.includes(siteName);
        if (!siteName || !didIncludeInUserSites) return;
        const primaryId = this.user.primaryId;
        this.props.isLoading(true);
        const allSales = await SalesModel.getAllSales(primaryId, siteName, date);
        this.setState({ allSales, data: allSales, sales: allSales });
        this.props.isLoading(false);
    }


    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", { errorMessage: true })
        const initialDate = choosenDate({ date: new Date() });
        this._getAllSales(this.props.site, initialDate);
        document.addEventListener("datechange", evt => {
            const date = evt.detail.choosenTimeRange;
            this.setState({ date });
            this._getAllSales(this.props.site, date)
        });
    }

    componentDidUpdate(prevProps) {
        const prevSite = prevProps.site;
        const nextSite = this.props.site;
        const initialDate = choosenDate({ date: new Date() });
        if (prevSite !== nextSite) this._getAllSales(nextSite, initialDate);
    }


    rowClicked(type, rowData) {
        if (type == "INPUT") return;
        const checkedData = this.state.checkedData;
        const site = this.props.site;
        checkedData.clear();
        this.setState({ checkedData });
        const date = this.state.date ? this.state.date : choosenDate({ date: new Date() });
        popup(<SoldDetails site={(site)} user={this.user} reflesh={_ => this._getAllSales(site, date)} rowData={rowData} />);
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

    async deleteSoldProduct() {
        const site = this.props.site;
        const primaryId = this.user.primaryId;
        const date = this.state.date ? this.state.date : choosenDate({ date: new Date() });
        const productsToDelete = Array.from(this.state.checkedData.values());
        if (productsToDelete.length == 0) return;
        if (!site) return Toast.create("There is no site selected. Please check!", { errorMessage: true });
        const ask = confirm(`Do you want delete ${productsToDelete.length == 1 ? "this" : "these"} ${productsToDelete.length == 1 ? "product" : "products"}?`);
        if (!ask) return;
        this.props.isLoading(true);
        for (const product of productsToDelete) {
            // const quantity = product.quantity;
            // const data = {
            //     productName: product.productName,
            //     purchaseUnitPrice: product.purchaseUnitPrice
            // };
            // const productQuantityInStock = await ProductModel.getProductQuantityInStock(primaryId, data, site);
            // if (!productQuantityInStock) {
            //     this.props.isLoading(false);
            //     this.setState({ checkedData: new Map() });
            //     this._getAllSales(site, date);
            //     return alert("Something went wrong! Please try again later.");
            // }
            // if (productQuantityInStock < quantity) return alert(`The quantity of ${product.productName.toUpperCase()} in stock is less than the current quantity. Deletion failled!`);
            const res = await SalesModel.deleteProduct(product, primaryId, site);
            if (res.status !== 200) {
                this.setState({ checkedData: new Map() });
                this.props.isLoading(false);
                this._getAllSales(site, date);
                Toast.create(`Failled to delete ${product.productName} created on ${new Date(product.tx_t).toLocaleString()}`, { errorMessage: true });
                return;
            }
        }
        Toast.create(`${productsToDelete.length == 1 ? "Product" : "Products"} deleted successfully.`, { errorMessage: true });
        this.props.isLoading(false);
        this._getAllSales(site, date);
        this.setState({ checkedData: new Map() });
    }

    showFilter() {
        let showFilter = this.state.showFilter;
        if (showFilter) showFilter = false;
        else showFilter = true;
        this.setState({ showFilter });
    }

    filter(data) {
        if (!data) return
        this.setState({ showFilter: false })
    }


    _rowDef(row, index, rowData) {
        return <tr onClick={evt => this.rowClicked(evt.target.tagName, rowData)}>
            <td><input type="checkbox" checked={this.state.checkedData.has(rowData.ref.id)} onChange={evt => this._onCheck(evt, rowData)} /></td>
            <td>{row.productName.toUpperCase()}</td>
            <td>{row.quantity.toLocaleString()}</td>
            <td>{row.unitPrice.toLocaleString()}</td>
            <td>{row.price.toLocaleString()}</td>
            <td className={styles.rowCaptalize}>{row.namesOfWhoCreatedThis ? row.namesOfWhoCreatedThis : ""}</td>
            <td>{(row.creationTime.toDate()).toLocaleString()}</td>
        </tr>;
    }

    footDef(result) {
        return <tr>
            <td></td>
            <td>Total</td>
            <td>{result.quantity ? result.quantity.toLocaleString() : ""}</td>
            <td></td>
            <td>{result.price ? result.price.toLocaleString() : ""}</td>
            <td></td>
            <td></td>
        </tr>
    }

    render() {
        const checkedData = Array.from(this.state.checkedData.values());
        console.log(this.state.allSales, "----", checkedData);
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return (
            <>
                <div className={styles.tableTitle}>
                    <h2>All sales</h2>
                </div>
                <div className={styles.headerBtns}>
                    <div className={`${styles.tableNavigivationsBtns} ${styles.categoryNavigationsBtn}`}>

                        {
                            permissions.includes("delete sales")
                                ? <button className={styles.deletePurchase} onClick={_ => this.deleteSoldProduct()} disabled={checkedData.length !== 0 ? false : true}>
                                    Delete product{this.state.checkedData.size > 1 ? "s" : ""}
                                </button>
                                : ""
                        }
                    </div>
                </div>
                <div className={styles.tableSection}>
                    <div className={styles.tableHeader}>
                        <div className={styles.leftSide}>
                            <div className={styles.searchInput}>
                                <label for="searchInput">
                                    {searchIcon}
                                </label>
                                <input onInput={evt => this.setState({ searchValue: evt.target.value })} id="searchInput" type="text" placeholder="Search" />
                            </div>
                        </div>
                        <div className={styles.rightSide}>
                            <FilterByDateFields choosenDate={data => this.filter(data)} show={(this.state.showFilter)} />
                            <button title="Filter" onClick={_ => this.showFilter()} type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" /></svg>
                            </button>
                        </div>
                    </div>
                    <DataTable footDef={this.footDef} searchValue={(this.state.searchValue)} rowDef={this._rowDef} className={`${styles.tableContainer}`} showCheckBoxes data={this.state.allSales}>
                        <ColDef name="productName" >Product name</ColDef>
                        <ColDef calculate={(a, b) => a + b} name="quantity" >Quantity</ColDef>
                        <ColDef name="unitPrice" >Unit price ({this.user.moneyDiscription})</ColDef>
                        <ColDef calculate={(a, b) => a + b} name="price" >Price ({this.user.moneyDescription})</ColDef>
                        <ColDef name="namesOfWhoCreatedThis">Created by</ColDef>
                        <ColDef name="creationTime" >Created at</ColDef>
                    </DataTable>
                </div>
            </>
        );
    }
}