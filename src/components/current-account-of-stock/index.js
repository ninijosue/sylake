import { h, Component } from 'preact';
import { choosenDate } from '../../helper/utils';
import ReportModel from '../../models/report';
import { ColDef, DataTable } from '../data-table';
import Toast from '../toast';
import styles from "./style.scss";

class CurrentAccountOfStock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            date: choosenDate({date: new Date().toString()}),
            products: []
        }
        this.user = props.user;
        this.primaryId = this.user.primaryId;
        this.sites = this.user.sites;;
    }

    async stockReport(site, date) {
        if(!site) return Toast.create("There is no internet connection. Please check!", {errorMessage: true});
        const isSiteIncludedInUserSites = this.sites.includes(site);
        if(!isSiteIncludedInUserSites) return;
        this.props.isLoading(true);
        const products = await ReportModel.getStockCurrentAccount(this.primaryId, site, date);
        this.props.isLoading(false);
        this.setState({products})
    }

    componentDidUpdate(prevProps) {
        const prevSite = prevProps.site;
        const nextSite = this.props.site;
        if (prevSite !== nextSite) this.stockReport(nextSite, this.state.date);
    }

    componentDidMount() {
        const state = this.state;
        const props = this.props;

        document.addEventListener("datechange", evt => {
            const range = evt.detail.choosenTimeRange;
            this.stockReport(props.site, range);
        });

        this.stockReport(this.props.site, state.date);
    }

    _rowDef(row, index, rowData){
        return <tr>
            <td>{index + 1}</td>
            <td>{row.productName.toUpperCase()}</td>
            <td>{row.quantity ? row.quantity.toLocaleString() : "-"}</td>
            <td>{row.purchaseAmount? row.purchaseAmount.toLocaleString() : "-"}</td>
            <td>{row.salesAmount ? row.salesAmount.toLocaleString() : "-"}</td>
            <td>{row.profit ? row.profit.toLocaleString() : "-"}</td>
        </tr>
    }

    footDef(res){
        return <tr>
        <td></td>
        <td>Total</td>
        <td>{res.quantity ? res.quantity.toLocaleString() : ""}</td>
        <td>{res.purchaseAmount? res.purchaseAmount.toLocaleString() : ""}</td>
        <td>{res.salesAmount ? res.salesAmount.toLocaleString() : ""}</td>
        <td>{res.profit ? res.profit.toLocaleString() : ""}</td>
    </tr>
    }

    render({ }, { products }) {
        return (
            <div className={styles.tableContentParentContainer}>
                <DataTable footDef={this.footDef} rowDef={this._rowDef} className={`${styles.tableContainer}`} showRowNumbers data={products}>
                    <ColDef name="productName" >Product Name</ColDef>
                    <ColDef calculate={(a, b) => a + b} name="quantity" >Quantity</ColDef>
                    <ColDef calculate={(a, b) => a + b} name="purchaseAmount" >Purchase amount</ColDef>
                    <ColDef calculate={(a, b) => a + b} name="salesAmount" >sales amount</ColDef>
                    <ColDef calculate={(a, b) => a + b} name="profit" >Profit</ColDef>
                </DataTable>
            </div>
        );
    }
}

export default CurrentAccountOfStock;