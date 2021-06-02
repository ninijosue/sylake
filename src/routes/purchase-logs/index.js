import { h, Component } from 'preact';
import { ColDef, DataTable } from '../../components/data-table';
import popup from '../../helper/popUp';
import styles from "./style";
import PurchaseLogsModel from '../../models/purchase-logs';
import EditPurchasedProduct from '../../components/edit-purchase-log';
import { searchIcon } from '../../assets/icons/icons';
import FilterByDateFields from '../../components/filter-by-date-fields';
import { choosenDate } from '../../helper/utils';
import Toast from '../../components/toast';

export default class PurchaseLogs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: undefined,
            logs: [],
            checkedData: new Map(),
            searchValue: "",
            showFilter: false,
            data: [],
            date: undefined
        }
        this._rowDef = this._rowDef.bind(this);
        this.user = props.user;
    }

    async _getAllProducts(site, date) {
        const productName = undefined;
        const primaryId = this.user.primaryId;
        if (!site) return;
        this.props.isLoading(true);
        const logs = await PurchaseLogsModel.getPurchaseLogs(primaryId, productName, site, date);
        this.props.isLoading(false);
        this.setState({ logs });
    }

    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", { errorMessage: true });
        const date = choosenDate({ date: new Date() });
        this.setState({ date });
        this._getAllProducts(this.props.site, date);

    }
    componentDidUpdate(prevProps) {
        const prevSite = prevProps.site;
        const nextSite = this.props.site;
        const date = this.state.date
            ? this.state.date
            : choosenDate({ date: new Date() });
        if (prevSite !== nextSite) this._getAllProducts(nextSite, date);
    }

    refleshData() {
        this._getAllProducts(this.props.site);
    }

    rowClicked(type, rowData) {
        if (rowData.takenAction !== "purchased") return;
        if (type == "INPUT") return;
        if (rowData.notEditable) return;
        const checkedData = this.state.checkedData;
        checkedData.clear();
        this.setState({ rowData, checkedData });
        popup(<EditPurchasedProduct user={this.user} refleshData={_ => this.refleshData()} rowData={rowData} />)

    }

    showFilter() {
        let showFilter = this.state.showFilter;
        if (showFilter) showFilter = false;
        else showFilter = true;
        this.setState({ showFilter });
    }

    filter(choosenRangeDate) {
        this.setState({ showFilter: false });
        const date = choosenDate(choosenRangeDate);
        if (!date) return;
        const from = new Date(date.from).toLocaleDateString();
        const to = date.isOneDay ? null : new Date(date.to).toLocaleDateString();

        this.setState({
            showFilter: false,
            dateRange: { from, to },
            date
        });
        this._getAllProducts(this.props.site, date);
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
        const takenAction = rowData.takenAction;
        const tekenActionVerified = takenAction == "purchased" || takenAction == "restored" ? "purchased" : takenAction;
        const takenActionDependingToCredit = takenAction == "loan" ? "credit" : takenAction;
        return <tr className={rowData.takenAction !== "purchased" ? styles.dataNotEditable : ""}
            title={tekenActionVerified !== "purchased" ? "Not editable here" : ""}
            onClick={evt => this.rowClicked(evt.target.tagName, rowData)}>
            <td><input disabled={!!(tekenActionVerified !== "purchased")} type="checkbox"
                checked={this.state.checkedData.has(rowData.ref.id)} onChange={evt => this._onCheck(evt, rowData)} /></td>
            <td>{row.productName.toUpperCase()}</td>
            <td>{row.quantity.toLocaleString()}</td>
            <td className={styles.takenActionRow}>{takenActionDependingToCredit}</td>
            <td className={styles.rowCaptalize}>{row.namesOfWhoCreatedThis ? row.namesOfWhoCreatedThis : ""}</td>
            <td>{(row.creationTime.toDate()).toLocaleString()}</td>
        </tr>;
    }

    footDef(res) {
        return <tr>
            <td></td>
            <td>Total</td>
            <td>{res.quantity ? res.quantity.toLocaleString() : ""}</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    }

    async deletePurchasedProduct() {
        const primaryId = this.user.primaryId;
        const productsToDelete = Array.from(this.state.checkedData.values());
        const site = this.props.site;
        const date = this.state.date
            ? this.state.date
            : choosenDate({ date: new Date() });
        if (productsToDelete.length == 0) return;
        const ask = confirm(`Do you want delete ${productsToDelete.length == 1 ? "this" : "these"} ${productsToDelete.length == 1 ? "product" : "products"}?`);
        if (!ask) return;
        this.props.isLoading(true);
        for (const product of productsToDelete) {
            const res = await PurchaseLogsModel.deletePurchasedProduct(product, primaryId, site);
            if (res.status == 500) {
                this.props.isLoading(false);
                return Toast.create(`Failled to delete ${product.productName.toUpperCase()} created on ${new Date(product.tx_t).toLocaleString()}`, { errorMessage: true })
            }
        }
        this.props.isLoading(false);
        await this._getAllProducts(site, date);
        this.setState({ checkedData: new Map() });
    }

    render() {
        const checkedData = Array.from(this.state.checkedData.values());
        return (
            <>
                <div className={styles.tableTitle}>
                    <h2>Purchase logs</h2>
                </div>
                <div className={styles.headerBtns}>
                    <div className={`${styles.tableNavigivationsBtns} ${styles.categoryNavigationsBtn}`}>
                        <button className={styles.deletePurchase} onClick={_ => this.deletePurchasedProduct()} disabled={checkedData.length !== 0 ? false : true}>
                            Delete
                        </button>
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
                        <ColDef name="productName" >Product name</ColDef>
                        <ColDef calculate={(a, b) => a + b} name="quantity" >Quantity</ColDef>
                        <ColDef name="takenAction" >Taken action</ColDef>
                        <ColDef name="namesOfWhoCreatedThis">Created by</ColDef>
                        <ColDef name="creationTime" >Created at</ColDef>
                    </DataTable>
                </div>
            </>
        );
    }
}