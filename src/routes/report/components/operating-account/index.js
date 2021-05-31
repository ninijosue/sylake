import { h, Component, createRef } from 'preact';
import Select from '../../../../components/select-C';
import TextField from '../../../../components/text-field';
import { getCurrentYear, getStringfiedMonth } from '../../../../helper/utils';
import ExpenseModel from '../../../../models/expense';
import ReportModel from '../../../../models/report';
import styles from "./style.scss";

class OperatingAccount extends Component {
  constructor(props) {
    super();
    this.state = {
      year: getCurrentYear(),
      reportYears: [],
      report: {},
      expenseCategories: []
    };
    this.user = props.user;
    this.primaryId = props.primaryId;
    this.sites = this.user.sites;;
    this.yearSelectorField = createRef();
  }

  async getOperatingAccount(site, givenYear) {
    const year = givenYear.toString();
    const isInUserSites = this.sites.includes(site);
    if (!site && !isInUserSites) return;
    this.props.isLoading(true);
    await this.getOperatingAccountYears(site);
    await this.getExpenseCategories(site);
    const res = await ReportModel.getOperatingAccount(this.primaryId, site, year);
    if (res.status == 200) {
      this.setState({ report: res.data });
    }
    this.props.isLoading(false);
  }

  async getExpenseCategories(site) {
    const expenseCategories = await ExpenseModel.getExpenseCategories(this.primaryId, site);
    this.setState({ expenseCategories });
  }

  async getOperatingAccountYears(site) {
    const isInUserSites = this.sites.includes(site);
    if (!site && !isInUserSites) return;
    const reportYears = await ReportModel.getOperatingAccountYears(this.primaryId, site);
    this.setState({ reportYears });
  }

  componentDidMount() {
    this.getOperatingAccount(this.props.site, this.state.year);
    const yearSelectorInput = this.yearSelectorField.current.input.current.base.querySelector("input");
    yearSelectorInput.value = getCurrentYear();
  }

  componentDidUpdate(prevProps) {
    const prevSite = prevProps.site;
    const nextSite = this.props.site;
    if (prevSite !== nextSite) this.getOperatingAccount(nextSite, this.state.year);
  }

  yearsOptions() {
    return this.state.reportYears.map(repYear => <option value={`${repYear.year}`}>{repYear.year}</option>);
  }


  render({ }, state) {
    const site = this.props.site;
    const months = state.report.months;
    const report = state.report.report;
    const expenseCategories = state.expenseCategories;
    return (
      <div>
        <Select ref={this.yearSelectorField} onChange={data => this.getOperatingAccount(site, data.label)} className={styles.yearSelector} name="year" label="Year">
          {this.yearsOptions()}
        </Select>
        <div className={styles.operatingAccountTableContainerParent}>
          <div className={styles.operatingAccountTableContainer}>
            <div className={styles.row}>
              <table>
                <thead>
                  <tr>
                    <th colspan="2">details</th>
                    {
                      months ? months.map(month => <th>{getStringfiedMonth(month)}</th>) : ""
                    }
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="2">Sales</td>
                    {
                      report ? report.map(rep => <td>{rep.salesAmount ? rep.salesAmount.toLocaleString() : ""}</td>) : ""
                    }
                  </tr>
                  {/* <tr>
                    <td colspan="2">Credit amount</td>
                    {
                      report ? report.map(rep => <td>{rep.loansAmount ? rep.loansAmount.toLocaleString() : ""}</td>) : ""
                    }
                  </tr> */}

                  <tr className={`${styles.spanedRow} ${styles.creditRowTitle}`}>
                    <td rowspan="4">
                      <span>Credit</span>
                      <h3 className={`${styles.expensesTitle}`}>Credit</h3>
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.catFirtRow}  >Credit amount</td>
                    {report ? report.map(rep => <td>{rep.creditAmount ? rep.creditAmount.toLocaleString() : ""}</td>) : ""}
                  </tr>
                  <tr>
                    <td className={styles.catFirtRow} >Paid credit amount</td>
                    {report ? report.map(rep => <td>{rep.paidCredit ? rep.paidCredit.toLocaleString() : ""}</td>) : ""}
                  </tr>

                  <tr>
                    <td className={styles.catFirtRow} >Remain credit amount</td>
                    {report ? report.map(rep => <td>{rep.remainCreditAmount ? rep.remainCreditAmount.toLocaleString() : ""}</td>) : ""}
                  </tr>




                  <tr>
                    <td colspan="2">Stock</td>
                    {report ? report.map(rep => <td>{rep.stockAmount ? rep.stockAmount.toLocaleString() : ""}</td>) : ""}
                  </tr>
                  <tr>
                    <td colspan="2">Gross profit</td>
                    {report ? report.map(rep => <td>{rep.grossProfit ? rep.grossProfit.toLocaleString() : ""}</td>) : ""}
                    {/* <td>$100</td> */}
                  </tr>
                  <tr className={`${styles.spanedRow} ${styles.creditRowTitle}`}>
                    <td rowspan={(expenseCategories.length + 1).toString()}>
                      <span>expense</span>
                      <h3 className={`${styles.expensesTitle}`}>expense</h3>
                    </td>
                  </tr>
                  {
                    expenseCategories.map(cat => {
                      const categoryName = cat.categoryName;
                      return (
                        <tr>
                          <td className={styles.catFirtRow} >{cat.categoryName}</td>
                          {report ? report.map(rep => <td>{rep.expenses ? rep.expenses
                            ? rep.expenses[categoryName] ? rep.expenses[categoryName] : "" : "" : ""}</td>) : ""}
                        </tr>
                      )
                    })
                  }
                  {/* <tr>
                    <td className={styles.catFirtRow} >cat2</td>
                    <td>$100</td>
                  </tr> */}
                  <tr>
                    <td colspan="2" >net profit</td>
                    {report ? report.map(rep => <td>{rep.netProfit ? rep.netProfit.toLocaleString() : ""}</td>) : ""}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OperatingAccount;