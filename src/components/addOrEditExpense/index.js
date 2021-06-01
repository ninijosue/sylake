import { h, Component, createRef } from 'preact';
import closePopup from '../../helper/closePopUp';
import ExpenseModel from '../../models/expense';
import Form from '../form';
import Loading from '../loading-C';
import Select from '../select-C';
import TextField from '../text-field';
import Toast from '../toast';
import styles from "./style.scss";
export default class AddOrEditExpense extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            saveBtnDisabled: false,
            expenseCategories: []
        }
        this.expenseName = createRef();
        this.price = createRef();
        this.expenseCategory = createRef();
        this.user = props.user;
        this.primaryId = this.user.primaryId;
    }

    async getExpenseCategories() {
        this.setState({ isLoading: true });
        const expenseCategories = await ExpenseModel.getExpenseCategories(this.primaryId, this.props.site);
        this.setState({ isLoading: false, expenseCategories });
    }

    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) Toast.create("There is no internet connection. Please check!", {errorMessage: true});
        const rowData = this.props.rowData;
        const expenseName = this.expenseName.current.base.querySelector("input");
        expenseName.value = rowData ? rowData.expenseName : "";
        const expenseCategory = this.expenseCategory.current.input.current.base.querySelector("input");
        expenseCategory.value = rowData ? rowData.expenseCategory ? rowData.expenseCategory : "" : "";
        const price = this.price.current.base.querySelector("input");
        price.value = rowData ? rowData.price : "";

        if (rowData) {
            this.setState({ saveBtnDisabled: true })
        }
        else {
            this.setState({ saveBtnDisabled: false });
        }
        this.getExpenseCategories();
    }

    async formSubmition(data) {
        const onLine = window.navigator.onLine;
        if (!onLine) return Toast.create("There is no internet connection. Please check!", {errorMessage: true});
        const site = this.props.site;
        if(!site) return Toast.create("There is no site selected. Please check!", {errorMessage: true});
        let price = Number(data.price);
        if(isNaN(price)) price = 0;
        const rowData = this.props.rowData;
        const primaryId = this.primaryId;
        if(!primaryId) return;
        const dataForFire = {
            ...data,
            price,
            creationTime: new Date(),
            createdBy: this.user.uid
        };

        this.setState({ isLoading: true });
        if (!rowData) {
            const res = await ExpenseModel.addNewExpense(dataForFire, primaryId, site);
            if(res.status !== 200) Toast.create(res.message, {errorMessage: true});
           else Toast.create(res.message, {successMessage: true});
        }
        else {
            const expenseCategory = data.expenseCategory == "" ? rowData.expenseCategory ? rowData.expenseCategory: ""  : data.expenseCategory;
            const dataToUpdate = { 
                ...dataForFire,
                expenseCategory,
                ref: rowData.ref,
                updatedBy: this.user.uid,
            }
            const res = await ExpenseModel.updateExpense(dataToUpdate);
            if(res.status !== 200) Toast.create(res.message, {errorMessage: true});
           else Toast.create(res.message, {successMessage: true});
        }
        this.setState({ isLoading: false });
        this.props.reflesh();
        closePopup();
    }

    render(props, state) {
        const rowData = this.props.rowData;

        return (
            <>
                <Loading visible={this.state.isLoading} />
                <div className={styles.addNewPurchaseContainer}>
                    <div className={styles.formContainerPoition}>
                        <div>
                            <h2 className={styles.formTitle}>{rowData ? "Update Expense" : "Expense"}</h2>
                            <Form onSubmit={data => this.formSubmition(data)}>
                                <div>
                                    <TextField onInput={_ => this.setState({ saveBtnDisabled: false })} required ref={this.expenseName} name="expenseName" label="Expense name" />
                                    <div>
                                        <Select onChange={_ => this.setState({ saveBtnDisabled: false })} ref={this.expenseCategory} label="Category" name="expenseCategory" >
                                            {state.expenseCategories.map(cat => (<option value={cat.categoryName}>{cat.categoryName}</option>))}
                                        </Select>
                                    </div>
                                    <TextField onInput={_ => this.setState({ saveBtnDisabled: false })} ref={this.price} required name="price" label="Amount" type="number" />
                                </div>

                                <div className={styles.submitBtn}>
                                    <button disabled={this.state.saveBtnDisabled | this.state.isLoading} className="btn_main" type="submit" >{rowData ? "Update" : "Save"}</button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}