import { h, Component, createRef } from 'preact';
import CurrentAccountOfSales from '../../../../components/current-account-of-sales';
import CurrentAccountOfStock from '../../../../components/current-account-of-stock';
import FilterByDateFields from '../../../../components/filter-by-date-fields';
import Select from '../../../../components/select-C';
import TextField from '../../../../components/text-field';
import { choosenDate, formatDates } from '../../../../helper/utils';
import styles from "./style.scss";

class CurrentAccount extends Component {
    constructor() {
        super();
        this.state = {
            currentReport: "sales",
            showFilter: false,
            dateRange: {
                from: null,
                to: null
            },
            date: undefined
        }

        this.reportSelectFieldRef = createRef();
        
    }

    componentDidMount() {
        const date = choosenDate({ date: new Date() })
        this.setState({ date });
        const reportSelectInput = this.reportSelectFieldRef.current.input.current.base.querySelector("input");
        reportSelectInput.value = "sales";
    }

    currentReportToShow() {
        const state = this.state;
        const props = this.props;
        switch (state.currentReport) {
            case "stock":
                return <CurrentAccountOfStock isLoading={status => this.props.isLoading(status)}
                    user={(props.user)} site={(props.site)} date={(state.date)} />;
            case "sales":
                return <CurrentAccountOfSales isLoading={status => this.props.isLoading(status)}
                    user={(props.user)} site={(props.site)} date={(state.date)} />;
            default:
                return <span></span>
        }
    }
    showFilter() {
        let showFilter = this.state.showFilter;
        if (showFilter) showFilter = false;
        else showFilter = true;
        this.setState({ showFilter });
    }

    filter(choosenRangeDate) {
        this.setState({ showFilter: false });
        const date = choosenDate(choosenRangeDate);
        if (!date) return;
        const from = new Date(date.from).toLocaleDateString();
        const to = date.isOneDay ? null : new Date(date.to).toLocaleDateString();

        this.setState({
            showFilter: false,
            dateRange: { from, to },
            date
        });
    }

    _selectedReport(data){
        const value = data.value;
        this.setState({currentReport: value});
    }

    render({ }, { }) {
        return (
            <div>
                <div className={styles.headQueryDataRow}>
                    <Select ref={this.reportSelectFieldRef} onChange={data=>this._selectedReport(data)} className={styles.selectField} label="Report">
                        <option value="stock">Stock</option>
                        <option value="sales">Sales</option>
                    </Select>
                    <div className={styles.filterContiner}>
                        <button className={styles.filterData} title="Filter" onClick={_ => this.showFilter()} type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" /></svg>
                        </button>
                        <div className={styles.filterRow}>
                            <FilterByDateFields choosenDate={data => this.filter(data)} show={(this.state.showFilter)} />
                        </div>

                    </div>
                    {/* <TextField max={formatDates(new Date())} className={styles.inputField} type="date" label="Specific day" /> */}

                </div>
                {this.currentReportToShow()}
            </div>
        );
    }
}

export default CurrentAccount;