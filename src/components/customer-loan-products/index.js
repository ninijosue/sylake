import { h, Component } from 'preact';
import { route } from 'preact-router';
import { searchIcon } from '../../assets/icons/icons';
import { allPermission } from '../../generators/routeVerifier';
import popup from '../../helper/popUp';
import LoansModel from '../../models/loans';
import { ColDef, DataTable } from '../data-table';
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
        if(!site) return alert("There not site selected!");
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
        alert(res.message);
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
                                    {searchIcon}
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