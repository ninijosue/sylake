import { h, Component } from 'preact';
import { route } from 'preact-router';
import { allPermission } from '../../generators/routeVerifier';
import popup from '../../helper/popUp';
import LoansModel from '../../models/loans';
import { ColDef, DataTable } from '../data-table';
import Toast from '../toast';
import UpdateLoanProduct from '../update-loan-product';
import styles from "./style.scss";
export default class CustomerLoanProducts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedData: new Map(),
            products: [],
            totalPrice: 0
        }
        this.user = props.user;
        this.loanId = this.props.loanId;
        this._rowDef = this._rowDef.bind(this);
        this.footDef = this.footDef.bind(this);
        this.sites = this.user.sites;   
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
        this.getLoanProducts(this.props.site)
    }

    componentDidUpdate(prevProps) {
        const prevSite = prevProps.site;
        const nextSite = this.props.site;
        if(prevSite !== nextSite) this.getLoanProducts(nextSite);
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

    rowClicked(evt, rowData, isPaied) {
        const site = this.props.site;
        if(!site) return Toast.create("There is no site selected. Please check!", {errorMessage: true});
        if(isPaied) return;
        if (evt.target.tagName == "INPUT") return;
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;
        if(!permissions.includes("delete loan")) return
        popup(<UpdateLoanProduct site={(site)} rowData={rowData} user={this.user} reflesh={_ => this.getLoanProducts(site)} />);
        this.setState({ checkedData: new Map() })
    }

    _rowDef(row, index, rowData) {
        const numberOfItems = rowData.quantity;
        const isPaied = !!(this.state.totalPrice == this.props.paiedAmount);
        return <tr onClick={evt => this.rowClicked(evt, rowData, isPaied)}>
            <td>
                {
                    isPaied
                        ? `${index + 1}`
                        : <input checked={this.state.checkedData.has(rowData.ref.id)} onChange={evt => this._onCheck(evt, rowData)} type="checkbox" />
                }
            </td>
            <td>{rowData.productName.toUpperCase()}</td>
            <td>{numberOfItems.toLocaleString()}</td>
            <td>{rowData.unitPrice.toLocaleString()}</td>
            <td>{row.price.toLocaleString()}</td>
        </tr>
    }

    footDef(res) {
        const price = res.price ? res.price : 0;
        this.props.totalLoanAmount(price);
        this.state.totalPrice = price;
        return <tr>
            <td></td>
            <td>Total</td>
            <td>{res.quantity ? res.quantity.toLocaleString() : ""}</td>
            <td></td>
            <td>{price ? price.toLocaleString() : ""}</td>
        </tr>
    }

    async _deleteProducts() {
        const site = this.props.site;
        if(!site) return "Please select a site!";
        const checkedData = Array.from(this.state.checkedData.values());
        const primaryId = this.user.primaryId;
        const ask = confirm(`Do you want delete ${checkedData.length == 1 ? "this" : "these"} ${checkedData.length == 1 ? "product" : "products"}?`);
        if (!ask) return;
        this.props.isLoading(true);
        const res = await LoansModel.deleteLoanProducts(primaryId, checkedData, site);
        if(res.status !== 200) Toast.create(res.message, {errorMessage: true});
        else Toast.create(res.message, {successMessage: true});
        const products = await LoansModel.getSpesificLoanproducts(primaryId, this.loanId, site);
        this.props.isLoading(false);
        if (products.length == 0) {
            this.props.isLoading(true);
            await LoansModel.deleteOneLoan(primaryId, this.loanId, site);
            this.props.isLoading(false);
            route("/loans");
        }
        else {
            this.getLoanProducts();
        }

    }



    render() {
        const checkedData = Array.from(this.state.checkedData.values());
        const isPaied = !!(this.state.totalPrice == this.props.paiedAmount);
        const permissions = this.user.isOwner ? allPermission : this.user.permittedRessources;

        return (
            <>
                <div className={styles.tableTitle}>
                    <h2>Products</h2>
                </div>
                <div className={styles.headerBtns}>
                    <div className={`${styles.tableNavigivationsBtns} ${styles.categoryNavigationsBtn}`}>
                        {
                            !isPaied ?
                                permissions.includes("delete loan")
                                    ? <button className={styles.deletePurchase} onClick={_ => this._deleteProducts()} disabled={checkedData.length !== 0 ? false : true}>
                                        Delete product
                                    </button>
                                    : ""
                                : ""
                        }

                    </div>
                </div>
                <div className={`${styles.tableSection} ${isPaied ? styles.isPaied : ""}`}>
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
                        </div>
                    </div>
                    <DataTable footDef={this.footDef} searchValue={(this.state.searchValue)} rowDef={this._rowDef} className={`${styles.tableContainer}`} showCheckBoxes={!isPaied} showRowNumbers={isPaied} data={this.state.products}>
                        <ColDef name="productName" >Product name</ColDef>
                        <ColDef calculate={(a, b) => a + b} name="numberOfIems" >Quantity</ColDef>
                        <ColDef name="unitPrice" >Unit price</ColDef>
                        <ColDef calculate={(a, b) => a + b} name="price" >Price</ColDef>
                    </DataTable>
                </div>
            </>
        );
    }
}