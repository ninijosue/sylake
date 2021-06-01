import { h, Component, createRef } from 'preact';
import LoansModel from '../../models/loans';
import Button from '../Button';
import Form from '../form';
import Loading from '../loading-C';
import TextField from '../text-field';
import styles from "./style.scss";
import closePopup from '../../helper/closePopUp';
import Toast from '../toast';

export default class CustomerLoanDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            btnDisabled: false,
            isLoading: false
        }

        this.rowData = props.rowData;
        this.names = createRef();
        this.location = createRef();
        this.phoneNumber = createRef();
        this.deadline = createRef();
        this.user = props.user;
    }

    componentDidMount() {
        const nameInput = this.names.current.base.querySelector("input");
        nameInput.value = this.rowData ? this.rowData.customerNames : "";
        const locationInput = this.location.current.base.querySelector("input");
        locationInput.value = this.rowData ? this.rowData.location : "";
        const phoneNumber = this.phoneNumber.current.base.querySelector("input");
        phoneNumber.value = this.rowData ? this.rowData.phoneNumber : "";
        const deadlineInput = this.deadline.current.base.querySelector("input");
        deadlineInput.value = this.rowData ? this.rowData.deadline : "";
        if (this.rowData) this.setState({ btnDisabled: true });

    }

    onFieldChanged() {
        if (this.rowData) this.setState({ btnDisabled: false });
    }

    async formSubmition(formData) {
        const site = this.props.site;
        if(!site) return Toast.create("There is no site selected. Please check!", {errorMessage: true});
        const data = {
            ...formData,
            doneBy: {
                uid: this.user.uid,
                names: this.user.names
            },
            deadlineTimestamp: new Date(formData.deadline),
            isPaied: false
        }
        if (!this.rowData) this.props.formData(data);
        else{
            const docRef = this.rowData.ref;
            if(!docRef || !data) return;
            this.setState({isLoading: true});
            const res = await LoansModel.updateLoanDetails(docRef, data );
            this.setState({isLoading: false});
            if(res.status !== 200 ) Toast.create(res.message, {errorMessage: true});
            else Toast.create(res.message, {successMessage: true});
            this.props.reflesh();
            closePopup();

        }
    }

    render() {
        return (
            <>
            {
                this.rowData 
                ? <Loading visible={this.state.isLoading} /> 
                : ""
            }
            <div className={`${styles.formContainerPosition} ${styles.loanCustomerFillOutInfo}`}>
                <h2 className={styles.formTitle}>Customer details loan</h2>
                <Form onSubmit={data => this.formSubmition(data)}>
                    <div className={styles.addEditRow}>
                        <div className={styles.fieldRow}>
                            <TextField id="load--details_names" onInput={_ => this.onFieldChanged()} ref={this.names} className={styles.inputField} type="text" label="Names" name="customerNames" required />
                            <TextField id="load--details_location" onInput={_ => this.onFieldChanged()} ref={this.location} className={styles.inputField} type="location" label="Location" name="location" required />
                        </div>
                        <div className={styles.fieldRow}>
                            <TextField id="load--details_phoneNumber" onInput={_ => this.onFieldChanged()} ref={this.phoneNumber} className={styles.inputField} type="phonenumber" label="Phone number" name="phoneNumber" required />
                            <TextField id="load--details_deadline" onInput={_ => this.onFieldChanged()} ref={this.deadline} className={styles.inputField} type="date" label="Deadline" name="deadline" required />
                        </div>
                    </div>
                    <div className={styles.submitBtnRow}>
                        <Button disabled={this.state.btnDisabled || this.state.isLoading} type="submit">{this.rowData ? "Update" : "Save"}</Button>
                    </div>
                </Form>
            </div>
            </>
        );
    }
}