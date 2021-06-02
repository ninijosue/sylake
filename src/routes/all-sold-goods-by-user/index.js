import { h, Component } from 'preact';
import { route } from 'preact-router';
import { ColDef, DataTable } from '../../components/data-table';
import FilterByDateFields from '../../components/filter-by-date-fields';
import SoldDetails from '../../components/sold-details';
import Toast from '../../components/toast';
import { allPermission } from '../../generators/routeVerifier';
import popup from '../../helper/popUp';
import SalesModel from '../../models/sales';
import styles from "./style";

export default class AllSoldProductsDoneByUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: undefined,
            allSales: [],
            checkedData: new Map(),
            searchValue: "",
            showFilter: false,
            data: []
        }
        this._rowDef = this._rowDef.bind(this);
        this.user = props.user;
    }

    async _getAllSales() {
        const uid = this.user.uid;
        const primaryId = this.user.primaryId;
        this.props.isLoading(true);
        const allSales = await SalesModel.getAllUserDoneSales(uid, primaryId);
        this.setState({ allSales, data: allSales });
        this.props.isLoading(false);
    }

    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", {errorMessage: true});
        this._getAllSales();
    }

    rowClicked(type, rowData) {
        if (type == "INPUT") return;
    }

    showFilter() {
        let showFilter = this.state.showFilter;
        if (showFilter) showFilter = false;
        else showFilter = true;
        this.setState({ showFilter });
    }

    filter(data) {
        if (!data) return
        const allSales = this.state.data;
        const from = data.from;
        const to = data.to;
        if (from == "" && to !== "") return;
        if (from !== "" && to == "") return;
        if (from == "" && to == "") return;
        const timeFrom = new Date(from).getTime();
        const timeTo = new Date(to).getTime();
        const result = allSales.filter(d => {
            const actualTime = new Date(d.creationTime.toDate().toLocaleString()).getTime();
            if (actualTime <= timeFrom && actualTime >= timeTo) return true;
            if (actualTime >= timeFrom && actualTime <= timeTo) return true;
            return false;
        });
        this.setState({ allSales: result, showFilter: false })
    }



    _rowDef(row, index, rowData) {
        const price = Number(rowData.quantity) * Number(rowData.unitPrice);
        return <tr className={styles.aliasPointer} onClick={evt => this.rowClicked(evt.target.tagName, rowData)}>
            <td>{index + 1}</td>
            <td>{row.productName.toUpperCase()}</td>
            <td>{row.quantity.toLocaleString()}</td>
            <td>{row.unitPrice.toLocaleString()}</td>
            <td>{price.toLocaleString()}</td>
            <td>{(row.creationTime.toDate()).toLocaleString()}</td>
        </tr>;
    }

    footDef(res){
        return<tr>
            <td></td>
            <td>Total</td>
            <td>{res.quantity ? res.quantity.toLocaleString() : ""}</td>
            <td></td>
            <td>{res.price ? res.price.toLocaleString() : ""}</td>
            <td></td>
        </tr>
    }

    render() {
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return (
            <>
            <div className={styles.tableTitle}>
                <h2>Sales made by you</h2>
            </div>
                <div className={styles.headerBtns}>
                    <div className={`${styles.tableNavigivationsBtns} ${styles.categoryNavigationsBtn}`}>
                        {/* 
                        <button className={styles.deletePurchase} onClick={_ => this.deleteSoldProduct()} disabled={checkedData.length !== 0 ? false : true}>
                            Delete purchase
                    </button> */}
                        <span className={styles.btnSpacing}></span>
                        {
                            permissions.includes("add new sale")
                            ?<button type="button" onClick={_ => route("/addNewSale")} >Add new sale</button>
                            : ""
                        }
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
                            <FilterByDateFields choosenDate={data => this.filter(data)} show={(this.state.showFilter)} />
                            <button title="Filter" onClick={_ => this.showFilter()} type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" /></svg>
                            </button>
                        </div>
                    </div>
                    <DataTable footDef={this.footDef} searchValue={(this.state.searchValue)} rowDef={this._rowDef} className={`${styles.tableContainer}`} showRowNumbers data={this.state.allSales}>
                        <ColDef name="productName" >Product name</ColDef>
                        <ColDef calculate={(a,b)=>a + b} name="quantity" >Quantity</ColDef>
                        <ColDef name="unitPrice" >Unit price ({this.user.moneyDescription})</ColDef>
                        <ColDef calculate={(a,b)=>a + b} name="price" >Price ({this.user.moneyDescription})</ColDef>
                        <ColDef name="creationTime" >Created at</ColDef>
                    </DataTable>
                </div>
            </>
        );
    }
}