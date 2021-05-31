import { h, Component } from 'preact';
import { Line } from 'react-chartjs-2';
import DashboardModel from '../../models/dashboard';
import Sales from '../../routes/sales/index';

class FirstChart extends Component {
    constructor(props) {
        super(props);
        this.user = props.user
        this.state = {
            chartData: {}
        }
    }
    async getChartData() {
        const primaryId = this.user.primaryId;
        const chartData = await DashboardModel.chartData(primaryId);
        this.setState({chartData});
    }

    componentDidMount() {
        this.getChartData()
    }
    render({ }, { }) {
        const chartData = this.state.chartData;
        return (
            <div>
                <p>Sales analyze</p>
                <Line
                    data={{
                        labels: chartData.label ? chartData.label : [],
                        fontSize: 12,
                        datasets: [
                            {
                                label: 'Sales',
                                data: chartData.salesQantity ? chartData.salesQantity : [],
                                // backgroundColor: [
                                //   'rgba(255, 99, 132, 0.2)',
                                // ],
                                borderColor: "blue",
                                borderWidth: 2,
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
                                    // gridLines: {
                                    //     color: "rgba(0, 0, 0, 0)",
                                    // }
                                },
                            ],

                            xAxes: [
                                {
                                    // gridLines: {
                                    //     color: "rgba(0, 0, 0, 0)",
                                    // }
                                }
                            ]
                        },
                        legend: {
                            labels: {
                                fontSize: 20,
                                boxWidth: 15,
                                padding: 20
                            },
                            position: "top",
                            align: "start",
                        display:false
                        },
                    }}
                />
            </div>
        );
    }
}

export default FirstChart;