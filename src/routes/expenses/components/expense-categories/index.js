import { Button, IconButton } from '@material-ui/core';
import { h, Component } from 'preact';
import { ColDef, DataTable } from '../../../../components/data-table/index';
import { deleteIcon, searchIcon } from '../../../../assets/icons/icons';
import { allPermission } from '../../../../generators/routeVerifier';
import styles from "./style.scss";
import ExpenseModel from '../../../../models/expense';
import popup from '../../../../helper/popUp';
import AddEditExpenseCategory from '../../../../components/add-edit-expenseCategory';
import Toast from '../../../../components/toast';

class ExpenseCategories extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: undefined,
            allCategories: [],
            checkedData: new Map(),
            searchValue: "",
            data: []
        }
        this._rowDef = this._rowDef.bind(this);
        this.user = props.user;
        this.primaryId = this.user.primaryId;
        this.sites = this.user.sites;;
    }

    async getCategories(site) {
        const didIncludeInUserSites = this.sites.includes(site);
        if (!site || !didIncludeInUserSites) return;
        if (!this.primaryId) return;
        this.props.isLoading(true);
        const allCategories = await ExpenseModel.getExpenseCategories(this.primaryId, site);
        this.setState({ allCategories });
        this.props.isLoading(false);
    }

    componentDidUpdate(prevProps) {
        const prevSite = prevProps.site;
        const nextSite = this.props.site;
        if (prevSite !== nextSite) this.getCategories(nextSite);
    }

    componentDidMount() {
        this.getCategories(this.props.site);
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


    rowClicked(tagName, rowData) {
        if (tagName == "INPUT") return;
        const site = this.props.site;
        if (!site) return Toast.create("There is no site selected. Please check!", { errorMessage: true });
        const checkedData = this.state.checkedData;
        checkedData.clear();
        this.setState({ rowData, checkedData });
        popup(<AddEditExpenseCategory site={(site)} user={this.user} reflesh={_ => this.getCategories(site)} rowData={rowData} />);
    }


    _rowDef(row, index, rowData) {
        return <tr onClick={evt => this.rowClicked(evt.target.tagName, rowData)}>
            <td className={styles.inputTD}><input checked={this.state.checkedData.has(rowData.ref.id)} type="checkbox" onChange={evt => this._onCheck(evt, rowData)} /></td>
            <td>{rowData.categoryName.toUpperCase()}</td>
        </tr>;
    }

    _addNewCategory() {
        const site = this.props.site;
        if (!site) return Toast.create("There is no site selected. Please check!", { errorMessage: true });
        popup(<AddEditExpenseCategory site={(site)} reflesh={_ => this.getCategories(site)} user={this.user} />);
    }

    async deleteCategory() {
        const site = this.props.site;
        const categoriesToDelete = Array.from(this.state.checkedData.values());
        if (categoriesToDelete.length == 0) return;
        const ask = confirm(`Do you want delete ${categoriesToDelete.length == 1 ? "this" : "these"} ${categoriesToDelete.length == 1 ? "category" : "categories"}?`);
        if (!ask) return;
        this.props.isLoading(true);
        const res = await ExpenseModel.deleteExpenseCategories(categoriesToDelete);
        if (res.status !== 200) Toast.create(res.message, { errorMessage: true });
        else Toast.create(res.message, { successMessage: true });
        this.props.isLoading(false);
        this.getCategories(site);
        this.setState({ checkedData: new Map() });
    }


    render({ }, { allCategories }) {

        const checkedData = Array.from(this.state.checkedData.values());
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return (
            <>
                {/* <div className={styles.tableTitle}>
                        <h2>Expenses</h2>
                    </div> */}

                <div className={styles.headerBtns}>
                    <div className={`${styles.tableNavigivationsBtns} ${styles.categoryNavigationsBtn}`}>
                        <button onClick={_ => this._addNewCategory()} >
                            Add new
                        </button>
                        <span className={styles.btnSpacing}></span>
                        <button className={styles.deleteCategory} onClick={_ => this.deleteCategory()} disabled={checkedData.length !== 0 ? false : true}>
                            Delete
                        </button>
                    </div>
                </div>
                <div className={`${styles.tableSection} ${styles.hasTabs} ${styles.categoriesExpensesTable}`}>
                    <div className={styles.tableHeader}>
                        <div className={styles.leftSide}>
                            <div className={styles.searchInput}>
                                <label for="searchInput">
                                    {searchIcon}
                                </label>
                                <input onInput={evt => this.setState({ searchValue: evt.target.value })} id="searchInput" type="text" placeholder="Search" />
                            </div>
                        </div>
                    </div>
                    <DataTable searchValue={(this.state.searchValue)} rowDef={this._rowDef} className={`${styles.tableContainer}`} showCheckBoxes data={allCategories}>
                        <ColDef name="categoryName" >Category name</ColDef>
                    </DataTable>
                </div>
            </>
        );
    }
}

export default ExpenseCategories;