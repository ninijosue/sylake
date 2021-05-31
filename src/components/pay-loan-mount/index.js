import { h, Component, createRef } from 'preact';
import closePopup from '../../helper/closePopUp';
import LoansModel from '../../models/loans';
import Button from '../Button';
import Form from '../form';
import Loading from '../loading-C';
import TextField from '../text-field';
import styles from './style.scss';

class PayLoanAMount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false
        }
        this.amountRef = createRef();
        this.amount = props.remaingAmount
    }

    componentDidMount() {
        const amountInput = this.amountRef.current.base.querySelector("input");
        amountInput.value = this.amount ? this.amount : "";
    }

    async formSubmition(data) {
        const site = this.props.site;
        if(!site) return alert("There is no site selected");
        const amount = Number(data.amount);
        const remaingAmount = this.props.remaingAmount;
        const paiedAmountbefore = this.props.paiedAmount;
        const docRef = this.props.docRef;
        if (amount > remaingAmount) return alert("The amount is to much compair with the amount to pay. Please check!");
        const ask = confirm(`You are about to pay the loan make sure that the amount which is (${amount}) to pay is as expected and continue.`);
        if (!ask) return;
        const paiedAmount = Number(paiedAmountbefore) + amount;
        const isPaied = (paiedAmount === this.props.totalLoanAmount);
        const dataForModel = {paiedAmount, isPaied}
        this.setState({isLoading: true})
        const res = await LoansModel.addPaymentOfLoan(docRef, dataForModel, site);
        this.setState({isLoading: false})
        alert(res.message);
        this.props.reflesh();
        closePopup();
    }

    render({ }, { }) {
        return (
            <>
                <Loading visible={this.state.isLoading} />
                <div className={styles.formContainerPosition}>
                    <h2 className={styles.formTitle}>Pay Loan amount</h2>
                    <Form onSubmit={data => this.formSubmition(data)}>
                        <div className={styles.addEditRow}>
                            <div className={styles.fieldRow}>
                                <TextField id="pay_--amount" ref={this.amountRef} className={`${styles.inputField} ${styles.amountInput}`} type="text" label="Amont" name="amount" required />
                            </div>
                        </div>
                        <div className={styles.submitBtnForLoanPayment}>
                            <Button disabled={this.state.isLoading} type="submit">Pay</Button>
                        </div>
                    </Form>
                </div>
            </>
        );
    }
}

export default PayLoanAMount;