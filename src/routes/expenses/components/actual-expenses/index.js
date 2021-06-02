import { h, Component } from 'preact';
import AddOrEditExpense from '../../../../components/addOrEditExpense';
import DashboardModel from '../../../../models/dashboard';

import styles from "./style";
import ExpenseModel from '../../../../models/expense/index';
import { ColDef, DataTable } from '../../../../components/data-table';
import FilterByDateFields from '../../../../components/filter-by-date-fields';
import { allPermission } from '../../../../generators/routeVerifier';
import popup from '../../../../helper/popUp';
import ExpenseDetails from '../../../../components/expense-details/index';
import { Snackbar } from '@material-ui/core';
import Toast from '../../../../components/toast';

export default class ActualExpenses extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: undefined,
            allExpenses: [],
            checkedData: new Map(),
            totalAmountOfAllExpenses: 0,
            showFilter: false,
            searchValue: "",
            data: []
        }
        this._rowDef = this._rowDef.bind(this);
        this.user = props.user;
        this.sites = this.user.sites;;
    }

    async _getAllExpenses(site) {
        const didIncludeInUserSites = this.sites.includes(site);
        if (!site || !didIncludeInUserSites) return;
        const primaryId = this.user.primaryId;
        this.props.isLoading(true);
        const allExpenses = await ExpenseModel.getAllExpenses(primaryId, site);
        this.setState({ allExpenses, data: allExpenses });
        this.props.isLoading(false);
    }

    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", { errorMessage: true });
        this._getAllExpenses(this.props.site);
    }

    componentDidUpdate(prevProps) {
        const prevSite = prevProps.site;
        const nextSite = this.props.site;
        if (prevSite !== nextSite) this._getAllExpenses(nextSite);
    }

    rowClicked(type, rowData) {
        if (type == "INPUT") return;
        const site = this.props.site;
        if (!site) return Toast.create("There is no site selected. Please check!", { errorMessage: true });
        const checkedData = this.state.checkedData;
        checkedData.clear();
        this.setState({ rowData, checkedData });
        popup(<ExpenseDetails site={(site)} user={this.user} reflesh={_ => this._getAllExpenses(site)} rowData={rowData} />);
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

    reflesh() {
        this._getAllExpenses(this.props.site);
        this.setState({ checkedData: new Map() })
    }

    _addExpense() {
        const site = this.props.site;
        if (!site) Toast.create("There is no site selected. Please check!", { errorMessage: true });
        popup(<AddOrEditExpense site={(this.props.site)} user={this.user} reflesh={_ => this.reflesh()} />);
    }

    async deleteExpense() {
        const site = this.props.site;
        const expensesToDelete = Array.from(this.state.checkedData.values());
        if (expensesToDelete.length == 0) return;
        const ask = confirm(`Do you want delete ${expensesToDelete.length == 1 ? "this" : "these"} ${expensesToDelete.length == 1 ? "expense" : "expenses"}?`);
        if (!ask) return;
        this.props.isLoading(true);
        const res = await ExpenseModel.deleteExpense(expensesToDelete);
        if (res.status !== 200) Toast.create(res.message, { errorMessage: true });
        else Toast.create(res.message, { successMessage: true });
        this.props.isLoading(false);
        await this._getAllExpenses(site);
        this.setState({ checkedData: new Map() });
    }

    _rowDef(row, index, rowData) {
        return <tr onClick={evt => this.rowClicked(evt.target.tagName, rowData)}>
            <td><input checked={this.state.checkedData.has(rowData.ref.id)} type="checkbox" onChange={evt => this._onCheck(evt, rowData)} /></td>
            <td>{row.expenseName.toUpperCase()}</td>
            <td>{rowData.expenseCategory.toUpperCase()}</td>
            <td>{row.price.toLocaleString()}</td>
            <td>{(row.creationTime.toDate()).toLocaleString()}</td>
        </tr>;
    }

    footDef(res) {
        return <tr>
            <td></td>
            <td>Total</td>
            <td></td>
            <td>{res.price ? res.price.toLocaleString() : ""}</td>
            <td></td>
        </tr>
    }


    showFilter() {
        let showFilter = this.state.showFilter;
        if (showFilter) showFilter = false;
        else showFilter = true;
        this.setState({ showFilter });
    }

    filter(data) {
        if (!data) return
        const allExpenses = this.state.data;
        const from = data.from;
        const to = data.to;
        if (from == "" && to !== "") return;
        if (from !== "" && to == "") return;
        if (from == "" && to == "") return;
        const timeFrom = new Date(from).getTime();
        const timeTo = new Date(to).getTime();
        const result = allExpenses.filter(d => {
            const actualTime = new Date(d.creationTime.toDate().toLocaleString()).getTime();
            if (actualTime <= timeFrom && actualTime >= timeTo) return true;
            if (actualTime >= timeFrom && actualTime <= timeTo) return true;
            return false;
        });
        this.setState({ allExpenses: result, showFilter: false })
    }


    render() {
        const checkedData = Array.from(this.state.checkedData.values());
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return (
            <>
                {/* <div className={styles.tableTitle}>
                    <h2>Expenses</h2>
                </div> */}

                <div className={styles.headerBtns}>
                    <div className={`${styles.tableNavigivationsBtns} ${styles.categoryNavigationsBtn}`}>
                        {
                            permissions.includes("add expense")
                                ? <button type="button" onClick={_ => this._addExpense()} >
                                    Add expense
                                </button>
                                : ""
                        }
                        <span className={styles.btnSpacing}></span>
                        {
                            permissions.includes("delete expense")
                                ? <button onClick={_ => this.deleteExpense()} disabled={checkedData.length !== 0 ? false : true}>
                                    Delete expense
                                </button>
                                : ""
                        }

                    </div>
                </div>
                <div className={`${styles.tableSection} ${styles.hasTabs}`}>
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
                    <DataTable searchValue={(this.state.searchValue)} footDef={this.footDef} rowDef={this._rowDef} className={`${styles.tableContainer}`} showCheckBoxes data={this.state.allExpenses}>
                        <ColDef name="expenseName" >Expense name</ColDef>
                        <ColDef name="expenseCategory">Category</ColDef>
                        <ColDef name="price" calculate={(a, b) => a + b} >Price</ColDef>
                        <ColDef name="creationTime" >Created at</ColDef>
                    </DataTable>
                </div>
            </>
        );
    }
}