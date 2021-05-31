import { h, Component } from 'preact';
import CircularLoading from '../../components/circular-loadding';
import CustomerLoanProducts from '../../components/customer-loan-products';
import ListInfoDisplayer from '../../components/list-info-displayer';
import Loading from '../../components/loading-C';
import LoansModel from '../../models/loans';
import styles from "./style.scss";
import popup from '../../helper/popUp';
import CustomerLoanDetails from '../../components/add-edit-customer-loan';
import PayLoanAMount from '../../components/pay-loan-mount';
import { verifiedIcon } from '../../assets/icons/icons';
import { allPermission } from '../../generators/routeVerifier';

export default class CustomerLoanInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loanDetails: {},
            products: [],
            isLoadingForLoanDetails: false,
            totalLoanAmount: 0,
            remaingAmount: 0
        };
        this.customerLoanId = props.customerLoanId;
        this.user = props.user;
        this.loanId = props.customerLoanId;
        this.sites = this.user.sites;;
    }

    async getLoandDetails(site) {
        const isInUserSites = this.sites.includes(site);
        if(!site && !isInUserSites) return alert("Please, select the appropriete site!");
        const primaryId = this.user.primaryId;
        this.setState({ isLoadingForLoanDetails: true });
        const loanDetails = await LoansModel.getLoanDetail(primaryId, this.loanId, site);
        this.setState({
            isLoadingForLoanDetails: false,
            loanDetails
        });
    }

    async getLoanProducts(site) {
        const isInUserSites = this.sites.includes(site);
        if(!site && !isInUserSites) return;
        const primaryId = this.user.primaryId;
        if (!this.loanId || !primaryId) return;
        this.props.isLoading(true);
        const products = await LoansModel.getSpesificLoanproducts(primaryId, this.loanId, site);
        this.setState({ products });
        this.props.isLoading(false);

    }

    componentDidMount() {
        const site = this.props.site;
        this.getLoandDetails(site);
        this.getLoanProducts(site);
    }

    componentDidUpdate(prevProps) {
        const prevSite = prevProps.site;
        const nextSite = this.props.site;
        if(prevSite !== nextSite) {
            this.getLoandDetails(nextSite);
            this.getLoanProducts(nextSite)
        }
    }


    editCustomerInfo() {
        const site = this.props.site;
        if(!site) return alert("No site selected!");
        popup(<CustomerLoanDetails site={(this.props.site)} reflesh={_ => this.getLoandDetails(site)} user={this.user} rowData={this.state.loanDetails} />)
    }


    _pay() {
        const site = this.props.site;
        if(!site) return alert("No site selected!");
        if (this.state.remaingAmount == 0) return;
        const primaryId = this.user.primaryId;
        popup(<PayLoanAMount site={(site)} reflesh={_ => this.getLoandDetails(site)} docRef={this.state.loanDetails.ref}
            paiedAmount={this.state.loanDetails.paiedAmount} totalLoanAmount={this.state.totalLoanAmount} remaingAmount={(this.state.remaingAmount)} />);
    }
    loanDetailsComp() {
        const loanDetail = this.state.loanDetails;
        const totalLoanAmount = this.state.totalLoanAmount;
        let paiedAmount = loanDetail.paiedAmount;
        if (isNaN(paiedAmount)) paiedAmount = 0;
        const remaingAmount = Number(totalLoanAmount) - Number(paiedAmount);
        this.state.remaingAmount = remaingAmount;
        const isPaied = !!(remaingAmount == 0);
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        return (
            <>
                <Loading visible={this.state.isLoading} />
                {
                    permissions.includes("edit loan")
                        ? <button onClick={_ => this._pay()} className={`${styles.loanPayBtn} ${isPaied ? styles.isPaied : ""}`}
                            disabled={isPaied} type="button">{isPaied ? "Paied" : "Pay"}{isPaied ? verifiedIcon : ""}</button>
                        : ""
                }
                <ListInfoDisplayer>
                    <h2>Sold details</h2>
                    <ul>
                        <li>
                            <h4>Names</h4>
                            <span>:</span>
                            <h5>{loanDetail.customerNames ? loanDetail.customerNames.toUpperCase() : ""}</h5>
                        </li>
                        <li>
                            <h4>Phone number</h4>
                            <span>:</span>
                            <h5 className={styles.creatorNames}>{loanDetail.phoneNumber ? loanDetail.phoneNumber : ""}</h5>
                        </li>
                        <li>
                            <h4>Location</h4>
                            <span>:</span>
                            <h5>{loanDetail.location ? loanDetail.location.toUpperCase() : ""}</h5>
                        </li>
                        <li>
                            <h4>Paid amount</h4>
                            <span>:</span>
                            <h5>{loanDetail.paiedAmount ? loanDetail.paiedAmount.toLocaleString() : 0} {this.user.moneyDescription}</h5>
                        </li>
                        <li>
                            <h4>Remaining amount</h4>
                            <span>:</span>
                            <h5>{remaingAmount.toLocaleString()} {this.user.moneyDescription}</h5>
                        </li>
                        <li>
                            <h4>Deadline</h4>
                            <span>:</span>
                            <h5>{loanDetail.deadline ? loanDetail.deadline : ""}</h5>
                        </li>

                        <li>
                            <h4>Registered by</h4>
                            <span>:</span>
                            <h5>{loanDetail.doneBy ? loanDetail.doneBy.names.toUpperCase() : ""}</h5>
                        </li>
                        <li>
                            <h4>Create on</h4>
                            <span>:</span>
                            <h5 className={styles.creatorNames}>{loanDetail.creationTime ? loanDetail.creationTime.toDate().toLocaleString() : ""}</h5>
                        </li>
                    </ul>
                    {
                        permissions.includes("edit loan") ?
                            !isPaied ?
                                <button onClick={_ => this.editCustomerInfo()} type="button" >
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                                </button>
                                : ""
                            : ""
                    }
                </ListInfoDisplayer>
            </>
        );
    }



    render(props, state) {
        const remaingAmount = this.state.remaingAmount;
        const isPaied = !!(remaingAmount == 0);
        return (
            <div className={styles.rowsContainerFluid}>
                <div className={styles.rowsContainer}>
                    <div className={styles.customerDetails}>

                        {
                            this.state.isLoadingForLoanDetails
                                ? <CircularLoading />
                                : <>  {this.loanDetailsComp()}</>
                        }
                    </div>
                    <div className={styles.loanProducts}>
                        <CustomerLoanProducts site={(this.props.site)} totalLoanAmount={amount => state.totalLoanAmount = amount} paiedAmount={this.state.loanDetails.paiedAmount}
                            isLoading={status => this.props.isLoading(status)} loanId={this.loanId} user={this.user} />
                    </div>
                </div>
            </div>
        );
    }
}