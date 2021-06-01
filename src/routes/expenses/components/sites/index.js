import { h, Component } from 'preact';
import { ColDef, DataTable } from '../../../../components/data-table/index';
import { searchIcon } from '../../../../assets/icons/icons';
import styles from "./style.scss";
import popup from '../../../../helper/popUp';
import SiteModel from '../../../../models/sites';
import AddEditSite from '../../../../components/add-edit-site';
import Toast from '../../../../components/toast';

export default class Sites extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: undefined,
            allSites: [],
            checkedData: new Map(),
            searchValue: "",
            data: []
        }
        this._rowDef = this._rowDef.bind(this);
        this.user = props.user;
        this.primaryId = this.user.primaryId;
    }

    async getAllSites() {
        if (!this.primaryId) return;
        this.props.isLoading(true);
        const allSites = await SiteModel.getSites(this.primaryId);
        this.setState({ allSites });
        this.props.isLoading(false);
    }

    componentDidMount() {
        this.getAllSites();
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
        const checkedData = this.state.checkedData;
        checkedData.clear();
        this.setState({ rowData, checkedData });
        popup(<AddEditSite user={this.user} reflesh={_ => this.getAllSites()} rowData={rowData} />);
    }


    _rowDef(row, index, rowData) {
        return <tr onClick={evt => this.rowClicked(evt.target.tagName, rowData)}>
            <td className={styles.inputTD}><input checked={this.state.checkedData.has(rowData.ref.id)} type="checkbox" onChange={evt => this._onCheck(evt, rowData)} /></td>
            <td>{rowData.siteName.toUpperCase()}</td>
        </tr>;
    }

    _addNewSite() {
        popup(<AddEditSite reflesh={_ => this.getAllSites()} user={this.user} />);
    }

    async deleteSite() {
        const site = this.props.site;
        const sitesToDelete = Array.from(this.state.checkedData.values());
        if (sitesToDelete.length == 0) return;
        const ask = confirm(`Do you want delete ${sitesToDelete.length == 1 ? "this" : "these"} ${sitesToDelete.length == 1 ? "site" : "sites"}?`);
        if (!ask) return;
        this.props.isLoading(true);
        const res = await SiteModel.deleteSite(sitesToDelete);
        if (res.status !== 200) Toast.create(res.message, { errorMessage: true });
        else Toast.create(res.message, { successMessage: true });
        this.props.isLoading(false);
        this.getAllSites(site);
        this.setState({ checkedData: new Map() });
    }


    render({ }, { allSites }) {

        const checkedData = Array.from(this.state.checkedData.values());
        return (
            <>
                {/* <div className={styles.tableTitle}>
                        <h2>Expenses</h2>
                    </div> */}

                <div className={styles.headerBtns}>
                    <div className={`${styles.tableNavigivationsBtns} ${styles.categoryNavigationsBtn}`}>
                        <button onClick={_ => this._addNewSite()} >
                            Add new
                        </button>
                        <span className={styles.btnSpacing}></span>
                        <button className={styles.deleteCategory} onClick={_ => this.deleteSite()} disabled={checkedData.length !== 0 ? false : true}>
                            Delete
                        </button>
                    </div>
                </div>
                <div className={`${styles.tableSection} ${styles.hasTabs} ${styles.sitesTable}`}>
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
                    <DataTable searchValue={(this.state.searchValue)} rowDef={this._rowDef} className={`${styles.tableContainer}`} showCheckBoxes data={allSites}>
                        <ColDef name="siteName" >Site name</ColDef>
                    </DataTable>
                </div>
            </>
        );
    }
}