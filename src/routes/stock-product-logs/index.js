import { h, Component } from 'preact';
import { ColDef, DataTable } from '../../components/data-table';
import popup from '../../helper/popUp';
import styles from "./style";
import PurchaseLogsModel from '../../models/purchase-logs';
import EditPurchasedProduct from '../../components/edit-purchase-log';
import { searchIcon } from '../../assets/icons/icons';
import FilterByDateFields from '../../components/filter-by-date-fields';
import { allPermission } from '../../generators/routeVerifier';
import { choosenDate } from '../../helper/utils';
import Toast from '../../components/toast';

export default class SpecificProductLogInStock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: undefined,
            logs: [],
            checkedData: new Map(),
            searchValue: "",
            showFilter: false,
            data: [],
            productName: "",
            date: undefined
        }
        this._rowDef = this._rowDef.bind(this);
        this.user = props.user;
        this.productId = props.productId;
        this.sites = this.user.sites;;
    }

    async _getAllProducts(site, date) {
        const siteName = this.props.site || site;
        const didIncludeInUserSites = this.sites.includes(siteName);
        if (!siteName || !didIncludeInUserSites) return;
        this.props.isLoading(true);
        const primaryId = this.user.primaryId;
        const productName = await PurchaseLogsModel.getSpecificProductNameInStock(primaryId, this.productId, siteName);
        if (productName) {
            const logs = await PurchaseLogsModel.getPurchaseLogs(primaryId, productName, siteName, date);
            this.setState({ logs, data: logs, productName });
        }
        this.props.isLoading(false);
    }

    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", { errorMessage: true });
        const site = this.props.site;
        const initialDate = choosenDate({ date: new Date() });
        this._getAllProducts(site, initialDate);
        document.addEventListener("datechange", evt => {
            const date = evt.detail.choosenTimeRange;
            this._getAllProducts(this.props.site, date);
            console.log(new Date(date.to).toDateString());
            this.setState({ date });
        });
    }

    componentDidUpdate(prevProps) {
        const stateDate = this.state.date
        const prevSite = prevProps.site;
        const nextSite = this.props.site;
        const date = stateDate ? stateDate : choosenDate({ date: new Date() });
        if (prevSite !== nextSite) this._getAllProducts(nextSite, date);
    }

    refleshData() {
        const state = this.state;
        const initialDate = state.date ? state.date : choosenDate({ date: new Date() });
        this._getAllProducts(this.props.site, initialDate);
    }

    rowClicked(type, rowData) {
        if (rowData.takenAction !== "purchased") return;
        if (type == "INPUT") return;
        if (rowData.notEditable) return;
        const checkedData = this.state.checkedData;
        checkedData.clear();
        this.setState({ rowData, checkedData });
        popup(<EditPurchasedProduct site={this.props.site} user={this.user} refleshData={_ => this.refleshData()} rowData={rowData} />);
    }

    async deletePurchasedProduct() {
        const site = this.props.site;
        const state = this.state;
        if (!site) return Toast.create("There is no site selected. Please check!", { errorMessage: true });
        const primaryId = this.user.primaryId;
        const productsToDelete = Array.from(this.state.checkedData.values());
        if (productsToDelete.length == 0) return;
        const ask = confirm(`Do you want delete ${productsToDelete.length == 1 ? "this" : "these"} ${productsToDelete.length == 1 ? "product" : "products"}?`);
        if (!ask) return;
        this.props.isLoading(true);
        for (const product of productsToDelete) {
            const res = await PurchaseLogsModel.deletePurchasedProduct(product, primaryId, site);
            if (res.status == 500) {
                this.props.isLoading(false);
                return Toast.create(`Failled to delete ${product.productName.toUpperCase()} created on ${new Date(product.tx_t).toLocaleString()}`, { errorMessage: true });
            }
        }
        this.props.isLoading(false);
        const date = state.date ? state.date : choosenDate({ date: new Date() });
        await this._getAllProducts(site, date);
        this.setState({ checkedData: new Map() });
    }

    showFilter() {
        let showFilter = this.state.showFilter;
        if (showFilter) showFilter = false;
        else showFilter = true;
        this.setState({ showFilter });
    }

    filter(data) {
        if (!data) return;
        this.setState({ showFilter: false });
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


    _rowDef(row, index, rowData) {
        return <tr className={rowData.takenAction !== "purchased" ? styles.dataNotEditable : ""}
            title={rowData.takenAction !== "purchased" ? "Not editable here" : ""}
            onClick={evt => this.rowClicked(evt.target.tagName, rowData)}>
            <td><input disabled={!!(rowData.takenAction !== "purchased")} type="checkbox"
                checked={this.state.checkedData.has(rowData.ref.id)} onChange={evt => this._onCheck(evt, rowData)} /></td>
            <td>{(row.creationTime.toDate()).toLocaleString()}</td>
            <td>{row.quantity.toLocaleString()}</td>
            <td className={styles.takenActionRow}>{row.takenAction ? row.takenAction : ""}</td>
            <td className={styles.rowCaptalize}>{row.namesOfWhoCreatedThis ? row.namesOfWhoCreatedThis : ""}</td>
        </tr>;
    }

    footDef(res) {
        return <tr>
            <td></td>
            <td>Total</td>
            <td>{res.quantity ? res.quantity.toLocaleString() : ""}</td>
            <td></td>
            <td></td>
        </tr>
    }

    render() {
        const checkedData = Array.from(this.state.checkedData.values());
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return (
            <>
                <div className={styles.tableTitle}>
                    <h2>{this.state.productName.toUpperCase()} logs</h2>
                </div>
                <div className={styles.headerBtns}>
                    <div className={`${styles.tableNavigivationsBtns} ${styles.categoryNavigationsBtn}`}>
                        {
                            permissions.includes("delete purchase")
                                ? <button className={styles.deletePurchase} onClick={_ => this.deletePurchasedProduct()} disabled={checkedData.length !== 0 ? false : true}>Delete</button>
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
                    <DataTable footDef={this.footDef} searchValue={(this.state.searchValue)} rowDef={this._rowDef} className={`${styles.tableContainer}`} showCheckBoxes data={this.state.logs}>
                        <ColDef name="creationTime" >Created at</ColDef>
                        <ColDef calculate={(a, b) => a + b} name="quantity" >Quantity</ColDef>
                        <ColDef name="takenAction" >Taken action</ColDef>
                        <ColDef name="namesOfWhoCreatedThis">Created by</ColDef>
                    </DataTable>
                </div>
            </>
        );
    }
}