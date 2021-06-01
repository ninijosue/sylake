import { h, Component, useRef } from "preact";
import styles from "./style.scss";
import { createRef } from "preact";
import DashboardModel from "../../models/dashboard";
import FirstChart from "../../components/first-chart";
import ExpensesChart from "../../components/expenses-chart";
import PurchaseChart from "../../components/purchase-chart";
import LoanChart from "../../components/loan-chart";
import MainAnalyse from "../../components/main-analyse";
import Toast from "../../components/toast";
// import DashboardModel from "../../models/dashboard";

export default class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalAmountOfAllExpenses: 0,
            totalPurchaseAmount: 0,
            totalAmountOfSales: 0,
            vilnerableList: []
        };
        this.props = props;
        this.ref = createRef();
        this.user = props.user;
    }

    async gettotalAmountOfAllExpenses() {
        const primaryId = this.user.primaryId;
        this.props.isLoading(true);
        const totalAmountOfAllExpenses = await DashboardModel.getTotalAmountOfAllExpenses(primaryId);
        this.props.isLoading(false);
        this.setState({ totalAmountOfAllExpenses });
    }

    async getTotalPurchasedAmount() {
        const primaryId = this.user.primaryId;
        this.props.isLoading(true);
        const totalPurchaseAmount = await DashboardModel.getTotalAmountOfAllProductsInStock(primaryId);
        this.props.isLoading(false);
        this.setState({ totalPurchaseAmount });
    }

    async unstableStockProducts() {
        this.props.isLoading(true);
        const primaryId = this.user.primaryId;
        const vilnerableList = await DashboardModel.getListOfVilnirableState(primaryId);
        this.props.isLoading(false);
        this.setState({ vilnerableList });
    }

    async getTotalAmountOfSales() {
        const primaryId = this.user.primaryId;
        this.props.isLoading(true);
        const totalAmountOfSales = await DashboardModel.getTotalAmountOfAllSales(primaryId);
        this.props.isLoading(false);
        this.setState({ totalAmountOfSales })
    }

    componentDidMount() {

        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", {errorMessage: true});
        this.unstableStockProducts();
        this.gettotalAmountOfAllExpenses();
        this.getTotalAmountOfSales();
        this.getTotalPurchasedAmount();
    }

    render(props, state) {
        const netProfit = Number(state.totalAmountOfSales) - (Number(state.totalPurchaseAmount) + Number(state.totalAmountOfAllExpenses) ) ;
        const screenWidth = screen.width;
        return (
            <div className={styles.dashboardSectionsContainer}>
                <div className={styles.topDashboardSection}>

                    <div className={styles.overviewContainer}>
                        <h2>Analyze</h2>
                        <div className={styles.showCardDataContinerCover}>
                            <div className={styles.showCardDataContiner}>
                                <div className={`${styles.card} ${styles.salesAmount}`}>
                                    <div className={styles.parentIconContenter}>
                                        <div className={styles.iconContainer}>
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" /></svg>
                                        </div>
                                    </div>
                                    <div className={styles.mainInfo}>
                                        <h1>{this.state.totalAmountOfSales.toLocaleString()} Rwf</h1>
                                        <p>Sales amount</p>
                                    </div>
                                </div>
                                <div className={`${styles.card} ${styles.purchaseAmount}`}>
                                    <div className={styles.parentIconContenter}>
                                        <div className={styles.iconContainer}>
                                            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24" /></g><g><g><path d="M6,13c-2.2,0-4,1.8-4,4s1.8,4,4,4s4-1.8,4-4S8.2,13,6,13z M12,3C9.8,3,8,4.8,8,7s1.8,4,4,4s4-1.8,4-4S14.2,3,12,3z M18,13 c-2.2,0-4,1.8-4,4s1.8,4,4,4s4-1.8,4-4S20.2,13,18,13z" /></g></g></svg>
                                        </div>
                                    </div>
                                    <div className={styles.mainInfo}>
                                        <h1>{this.state.totalPurchaseAmount.toLocaleString()} Rwf</h1>
                                        <p>Purchase amount</p>
                                    </div>
                                </div>
                                <div className={`${styles.card} ${styles.expenses}`}>
                                    <div className={styles.parentIconContenter}>
                                        <div className={styles.iconContainer}>
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" /></svg>
                                        </div>
                                    </div>
                                    <div className={`${styles.mainInfo}`}>
                                        <h1>{this.state.totalAmountOfAllExpenses.toLocaleString()} Rwf</h1>
                                        <p>Expenses amount</p>
                                    </div>
                                </div>
                                <div className={`${styles.card} ${styles.profit}`}>
                                    <div className={styles.parentIconContenter}>
                                        <div className={styles.iconContainer}>
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" /></svg>
                                        </div>
                                    </div>
                                    <div className={styles.mainInfo}>
                                        <h1>{netProfit.toLocaleString()} Rwf</h1>
                                        <p>Net profit</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        screen.width > 600
                            ? (
                                <div ref={this.ref} className={styles.histogramContainer}>
                                    <MainAnalyse
                                        user={this.user}
                                        sales={state.totalAmountOfSales}
                                        expenses={state.totalAmountOfAllExpenses}
                                        purchase={state.totalPurchaseAmount}
                                        profit={netProfit}
                                    />
                                </div>
                            )
                            : ""
                    }

                </div>

                <div className={`${styles.bottomDashboardSection} ${styles.dropChartDown}`}>
                    <div className={`${styles.eventsDashSection} ${styles.roundSectionAnalise}`}>
                        <FirstChart user={this.user} />
                    </div>
                </div>

                <div className={styles.bottomDashboardSection}>
                    <div className={styles.eventsDashSection}>
                        <ExpensesChart user={this.user} />
                    </div>

                    <div className={styles.otherDashSection}>
                        <PurchaseChart user={this.user} />
                    </div>
                </div>

                <div className={styles.bottomDashboardSection}>
                    <div className={styles.otherDashSection}>
                        <LoanChart user={this.user} />
                    </div>

                    {/* <div className={styles.eventsDashSection}>
                        <h3>Vulnerable Products in stock</h3>
                        <div className={styles.eventsTableContainer}>
                            <table>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Quantity</th>
                                    <th>Status</th>
                                </tr>
                                {
                                    this.state.vilnerableList.map(product => {
                                        return (
                                            <tr className={`${styles.roundedRow} ${product.danger ? styles.mostVulnerable : ""}`}>
                                                <td className={styles.nonBorderLeft}>{product.productName}</td>
                                                <td>{product.quantity}</td>
                                                <td >{product.danger ? "Weak" : "Medium"}</td>
                                            </tr>
                                        );
                                    })
                                }
                            </table>
                        </div>
                    </div> */}

                </div>
                <div className={styles.bottomDashboardSection}>
                    {/* <div className={styles.otherDashSection}>
                        <LoanChart user={this.user} />
                    </div> */}

                    <div className={styles.eventsDashSection}>
                        <h3>Vulnerable Products in stock</h3>
                        <div className={styles.eventsTableContainer}>
                            <table>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Quantity</th>
                                    <th>Status</th>
                                </tr>
                                {
                                    this.state.vilnerableList.map(product => {
                                        return (
                                            <tr className={`${styles.roundedRow} `}>
                                                <td className={styles.nonBorderLeft}>{product.productName.toUpperCase()}</td>
                                                <td>{product.quantity}</td>
                                                <td >{product.danger ? "Weak" : "Medium"}</td>
                                            </tr>
                                        );
                                    })
                                }
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        )

    }
}