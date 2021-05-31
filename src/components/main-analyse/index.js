import { h, Component } from 'preact';
import { Bubble, Doughnut, Line, Pie, Polar, Radar, Scatter } from 'react-chartjs-2';
import DashboardModel from '../../models/dashboard';

class MainAnalyse extends Component {
    constructor(props) {
        super(props);
        this.user = props.user
        this.state = {
            chartData: {},
            chartDimension: {
                width: 250,
                height: 600,
            }
        }
    }
    async getChartData() {
        const primaryId = this.user.primaryId;
        const chartData = await DashboardModel.chartData(primaryId);
        this.setState({ chartData });
    }

    componentDidMount() {
        this.getChartData()
    }
    render(props, { }) {
        const chartData = this.state.chartData;
        const sales = props.sales ? Number(props.sales) : 0;
        const expenses = props.expenses ? Number(props.expenses) : 0;
        const amount = props.amount ? Number(props.amount) : 0;
        const profit = props.profit ? Number(props.profit) : 0;
        const purchase = props.purchase ? Number(props.purchase) : 0;

        return (
            <div>
                <p>Initial analyze</p>
                <Doughnut
                    data={{
                        labels: ["Sales", "Expenses", "Purchase", "Net profit"],
                        fontSize: 12,
                        datasets: [
                            {
                                label: 'Sales',
                                data: [sales, expenses, purchase, profit],
                                backgroundColor: ["#03506f", "#91091e", "#1687a7", "#6f4a8e", "#32e0c4"],
                                borderColor: "#70adb5",
                                borderWidth: 2,
                            },
                        ],
                    }}
                    height={screen.height < 600 ? 200 : 300 }
                    width={screen.width < 600 ? 100 : 600 }
                    options={{
                        maintainAspectRatio: false,
                        scales: {
                            yAxes: [
                                {
                                    ticks: {
                                        beginAtZero: true,

                                    },
                                    gridLines: {
                                        color: "rgba(0, 0, 0, 0)",
                                    },
                                    display: false
                                },
                            ],

                            xAxes: [
                                {
                                    gridLines: {
                                        color: "rgba(0, 0, 0, 0)",
                                    },
                                    display: false

                                }
                            ]
                        },
                        legend: {
                            labels: {
                                fontSize: 10,
                                boxWidth: 10,
                                padding: 20
                            },
                            position: "top",
                            align: "start",
                            display: true

                        },
                    }}
                />
            </div>
        );
    }
}

export default MainAnalyse;