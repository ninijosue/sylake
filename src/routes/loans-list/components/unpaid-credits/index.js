import { Component } from "preact";
import { ColDef, DataTable } from '../../../../components/data-table';
import popup from '../../../../helper/popUp';
import LoansModel from '../../../../models/loans';
import styles from "./style";
// import CustomerLoanDetails from '../../components/add-edit-customer-loan';
import { route } from 'preact-router';
import PayLoanAMount from '../../../../components/pay-loan-mount';
import { allPermission } from '../../../../generators/routeVerifier';
import Toast from '../../../../components/toast';


export default class UnpaidCredits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: undefined,
            loans: [],
            checkedData: new Map(),

        }
        this._rowDef = this._rowDef.bind(this);
        this.user = props.user;
        this.sites = this.user.sites;;
    }

    async _getAllLoans(site) {
        const didIncludeInUserSites = this.sites.includes(site);
        if (!site || !didIncludeInUserSites) return;
        this.props.isLoading(true);
        const primaryId = this.user.primaryId;
        const loans = await LoansModel.getAllCustomersLoans(primaryId, site);
        this.setState({ loans });
        this.props.isLoading(false);
    }

    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", { errorMessage: true })
        this._getAllLoans(this.props.site);
    }
    componentDidUpdate(prevProps) {
        const prevSite = prevProps.site;
        const nextSite = this.props.site;
        if (prevSite !== nextSite) this._getAllLoans(nextSite);
    }

    refleshData() {
        this._getAllLoans();
    }

    rowClicked(type, rowData) {
        if (type == "INPUT") return;
        if (type == "BUTTON") return;
        this.setState({ checkedData: new Map() });
        route(`/loans/${rowData.ref.id}`);

    }

    _onCheck(checked, rowData) {
        let checkedData = this.state.checkedData;
        if (rowData.isPaied) return;
        if (!checked) {
            checkedData.delete(rowData.ref.id);
        }
        else {
            checkedData.set(rowData.ref.id, rowData);
        }
        this.setState({ checkedData });
    }

    async deleteLoan() {
        const site = this.props.site;
        const checkedData = this.state.checkedData;
        if (checkedData.size == 0) return;
        const primaryId = this.user.primaryId;
        const data = Array.from(checkedData.values());
        const ask = confirm(`Do you want delete ${checkedData.size == 1 ? "this loan" : "these loans"}?`);
        if (!ask) return;
        const loansToDetele = data.map(d => { if (!d.isPaied) return d });
        this.props.isLoading(true);
        const res = await LoansModel.deleteLoans(primaryId, loansToDetele, site);
        if (res.status !== 200) Toast.create(res.message, { errorMessage: true });
        else Toast.create(res.message, { successMessage: true });
        this.setState({ checkedData: new Map() });
        this.props.isLoading(false);
        this._getAllLoans(site);
    }



    _pay(rowData) {
        const remaingAmount = rowData.totalAmount - rowData.paiedAmount;
        const site = this.props.site;
        if (rowData.isPaied) return;
        popup(<PayLoanAMount totalLoanAmount={rowData.creditAmount} site={(site)} reflesh={_ => this._getAllLoans(site)} docRef={rowData.ref}
            paiedAmount={rowData.paiedAmount} remaingAmount={remaingAmount} />);
    }

    _rowDef(row, index, rowData) {
        const isPaied = rowData.isPaied;
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return <tr onClick={evt => this.rowClicked(evt.target.tagName, rowData)}>
            <td><input disabled={isPaied} checked={this.state.checkedData.has(rowData.ref.id)} onChange={evt => this._onCheck(evt.target.checked, rowData)} type="checkbox" /></td>
            <td>{rowData.customerNames.toUpperCase()}</td>
            <td>{rowData.phoneNumber}</td>
            <td>{rowData.location.toUpperCase()}</td>
            <td>{rowData.totalAmount.toLocaleString()}</td>
            <td>{rowData.paiedAmount.toLocaleString()}</td>
            <td>{rowData.deadline}</td>
            <td>{rowData.doneBy.names.toUpperCase()}</td>
            {/* <td>{(rowData.creationTime.toDate()).toLocaleString()}</td> */}
            {
                permissions.includes("edit loan")
                    ?
                    <td>
                        <button onClick={_ => this._pay(rowData)} className={`${styles.loanPayBtn} ${styles.payBtnInLoanList} ${isPaied ? styles.isPaied : ""}`}
                            disabled={isPaied} type="button">{isPaied ? "Paied" : "Pay"}{isPaied ?
                                <svg enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24" /></g><g><path d="M23,12l-2.44-2.79l0.34-3.69l-3.61-0.82L15.4,1.5L12,2.96L8.6,1.5L6.71,4.69L3.1,5.5L3.44,9.2L1,12l2.44,2.79l-0.34,3.7 l3.61,0.82L8.6,22.5l3.4-1.47l3.4,1.46l1.89-3.19l3.61-0.82l-0.34-3.69L23,12z M10.09,16.72l-3.8-3.81l1.48-1.48l2.32,2.33 l5.85-5.87l1.48,1.48L10.09,16.72z" /></g></svg>
                                : ""}
                        </button>
                    </td>
                    : ""
            }
        </tr>;
    }

    render(props) {
        const checkedData = Array.from(this.state.checkedData.values());
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return (
            <>
                <div className={styles.headerBtns}>
                    <div className={`${styles.tableNavigivationsBtns} ${styles.categoryNavigationsBtn}`}>
                        {
                            permissions.includes("add loan")
                                ? <button onClick={_ => route("/addNewLoan")}>
                                    Add credit
                                </button>
                                : ""
                        }
                        <span className={styles.btnSpacing}></span>
                        {
                            permissions.includes("delete loan")
                                ? <button onClick={_ => this.deleteLoan()} disabled={checkedData.length !== 0 ? false : true}>
                                    Delete
                                </button>
                                : ""
                        }
                    </div>
                </div>
                <div className={`${styles.tableSection} ${styles.tableUnderTabs}`}>
                    <div className={styles.tableHeader}>
                        <div className={styles.leftSide}>
                            <div className={styles.searchInput}>
                                <label for="searchInput">
                                <svg  height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                                </label>
                                <input onInput={evt => this.setState({ searchValue: evt.target.value })} id="searchInput" type="text" placeholder="Search" />
                            </div>
                        </div>
                    </div>
                    <DataTable rowDef={this._rowDef} className={`${styles.tableContainer}`} showCheckBoxes data={this.state.loans}>
                        <ColDef name="names" >Customer names</ColDef>
                        <ColDef name="phoneNumber" >Phone number</ColDef>
                        <ColDef name="location" >Location</ColDef>
                        <ColDef name="totalAmount" >Total amount ({this.user.moneyDescription})</ColDef>
                        <ColDef name="paiedAmount" >Paid amount ({this.user.moneyDescription})</ColDef>
                        <ColDef name="deadline" >DeadLine</ColDef>
                        <ColDef name="createdBy" >Registered by</ColDef>
                        {/* <ColDef name="creationTime" >Creation time</ColDef> */}
                        {
                            permissions.includes("delete loan")
                                ? <ColDef name="status" >Status</ColDef>
                                : ""
                        }
                    </DataTable>
                </div>
            </>
        );
    }
}