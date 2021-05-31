import { h, Component } from 'preact';
import { choosenDate, formatDates } from '../../helper/utils';
import Button from '../Button';
import Form from '../form';
import TextField from '../text-field';
import styles from "./style.scss";

export default class FilterByDateFields extends Component {
    _chooseDate(data) {
        let date;
        if (!data.to) date = {
            from: null,
            to: null,
            date: data.from
        }
        else date = {
            from: data.from,
            to: data.to,
            date: null
        }
        const choosenTimeRange = choosenDate(date);
        document.dispatchEvent(new CustomEvent("datechange", {detail: {choosenTimeRange}}));
        this.props.choosenDate(date);
    }

    render(props) {
        return (
            <>
                <div className={`${styles.byDateFilterContainer}  ${props.show ? styles.showIt : ""} dateFilter`}>
                    <div className={`${styles.filterRow} dateFilter`}>
                        <p>Select the adequate date </p>
                        {
                            props.show ?
                                <Form onSubmit={data => this._chooseDate(data)}>
                                    <TextField max={formatDates(new Date())} name="from" required className={`${styles.inputField} dateFilter`} type="date" label="From or specific day" />
                                    <TextField max={formatDates(new Date())} name="to" className={`${styles.inputField} dateFilter`} type="date" label="To (optional)" />
                                    <div className={`${styles.submitFilterBtnSec} dateFilter`}>
                                        <Button className="dateFilter" type="submit" >Get</Button>
                                    </div>
                                </Form>
                                : ""
                        }

                    </div>
                </div>
            </>
        );
    }
}