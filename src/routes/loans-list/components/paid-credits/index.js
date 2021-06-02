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


export default class PaidCredits extends Component{
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
        const loans = await LoansModel.getAllCustomersLoans(primaryId, site, true);
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
        route(`/loans/${rowData.ref.id}`);

    }

    _rowDef(row, index, rowData) {
        const isPaied = rowData.isPaied;
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return <tr onClick={evt => this.rowClicked(evt.target.tagName, rowData)}>
            <td>{index + 1}</td>
            <td>{rowData.customerNames.toUpperCase()}</td>
            <td>{rowData.phoneNumber}</td>
            <td>{rowData.location.toUpperCase()}</td>
            <td>{rowData.totalAmount.toLocaleString()}</td>
            <td>{rowData.deadline}</td>
            <td>{rowData.doneBy.names.toUpperCase()}</td>
        </tr>;
    }

    render(props) {
        // const checkedData = Array.from(this.state.checkedData.values());
        // const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return (
            <>
               
                <div className={`${styles.tableSection} ${styles.paidCreditTable} ${styles.tableUnderTabs}`}>
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
                    <DataTable rowDef={this._rowDef} className={`${styles.tableContainer}`} showRowNumbers data={this.state.loans}>
                        <ColDef name="names" >Customer names</ColDef>
                        <ColDef name="phoneNumber" >Phone number</ColDef>
                        <ColDef name="location" >Location</ColDef>
                        <ColDef name="totalAmount" >Total amount ({this.user.moneyDescription})</ColDef>
                        <ColDef name="deadline" >DeadLine</ColDef>
                        <ColDef name="createdBy" >Registered by</ColDef>
                    </DataTable>
                </div>
            </>
        );
    }
}