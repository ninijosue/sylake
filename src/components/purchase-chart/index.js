import { h, Component } from 'preact';
import { Line } from 'react-chartjs-2';
import DashboardModel from '../../models/dashboard';

class PurchaseChart extends Component {
    constructor(props) {
        super(props);
        this.user = props.user
        this.state = {
            chartData: {}
        }
    }
    async getChartData() {
        const primaryId = this.user.primaryId;
        const chartData = await DashboardModel.purchasesChart(primaryId);
        this.setState({ chartData })
    }

    componentDidMount() {
        this.getChartData()
    }
    render({ }, { }) {
        const chartData = this.state.chartData;
        return (
            <div>
                <p>Purchase analyze</p>
                <Line

                    data={{
                        labels: chartData.label ? chartData.label : [],
                        fontSize: 12,
                        datasets: [
                            {
                                label: 'Purchases',
                                data: chartData.purchasesQuantities ? chartData.purchasesQuantities : [],
                                // backgroundColor: [
                                //   'rgba(255, 99, 132, 0.2)',
                                // ],
                                borderColor: [
                                    'orange',
                                ],
                                borderWidth: 1,
                            }
                        ],
                    }}
                    height={300}
                    width={600}
                    options={{
                        maintainAspectRatio: false,
                        scales: {
                            yAxes: [
                                {
                                    ticks: {
                                        beginAtZero: true,

                                    },
                                },
                            ],
                        },
                        legend: {
                            labels: {
                                fontSize: 20,
                                boxWidth: 15,
                                padding: 20
                            },
                            position: "top",
                            align: "start",
                            display: false
                        },
                    }}
                />
            </div>
        );
    }
}

export default PurchaseChart;