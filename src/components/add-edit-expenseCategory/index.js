import { h, Component, createRef } from 'preact';
import Button from '../Button';
import Form from '../form';
import Loading from '../loading-C';
import TextField from '../text-field';
import styles from "./style.scss";
import closePopup from '../../helper/closePopUp';
import ExpenseModel from '../../models/expense';
import Toast from '../toast';

export default class AddEditExpenseCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            btnDisabled: false,
            isLoading: false
        }

        this.rowData = props.rowData;
        this.categoryName = createRef();
        this.user = props.user;
        this.primaryId = this.user.primaryId;

    }

    componentDidMount() {
        const categoryName = this.categoryName.current.base.querySelector("input");
        categoryName.value = this.rowData ? this.rowData.categoryName : "";
        if (this.rowData) this.setState({ btnDisabled: true });

    }
    
    onFieldChanged() {
        if (this.rowData) this.setState({ btnDisabled: false });
    }

    async formSubmition(formData) {
        const site = this.props.site;
        if(!site) return Toast.create("There is no site selected. Please check!", {errorMessage: true});
        const categoryName = formData.categoryName;
        if(!categoryName || categoryName == "") return;
        const data = {
            categoryName: categoryName.toLowerCase(),
            doneBy: {
                uid: this.user.uid,
                names: this.user.names
            },
        }
        this.setState({isLoading: true});
        if(this.rowData){
            const dataForModel = {
                ...data,
                ref: this.rowData.ref
            }
            const res = await ExpenseModel.updateExpenseCategory(dataForModel);
            if(res.status !== 200 ) Toast.create(res.message, {errorMessage: true})
            else Toast.create(res.message, {successMessage: true})
        }
        else{
            if(!this.primaryId) return;
            const res = await ExpenseModel.addNewCategory(data, this.primaryId, site)
            if(res.status !== 200 ) Toast.create(res.message, {errorMessage: true})
            else Toast.create(res.message, {successMessage: true})
        }
            this.setState({isLoading: false});
            this.props.reflesh()
            closePopup();
        
    }

    render() {
        return (
            <>
            <Loading visible={this.state.isLoading} />
            <div className={styles.formContainerPosition}>
                <h2 className={styles.formTitle}>{this.rowData ? "Edit" : "Add new"} category</h2>
                <Form onSubmit={data => this.formSubmition(data)}>
                    <div className={styles.addEditRow}>
                        <div className={styles.fieldRow}>
                            <TextField id="expense_-category_name" onInput={_ => this.onFieldChanged()} ref={this.categoryName} className={styles.inputField} type="text" label="Category name" name="categoryName" required />
                        </div>
                    </div>
                    <div className={`${styles.submitBtnRow} ${styles.addOrEditCategoryBtnSubmit}`}>
                        <Button  disabled={this.state.btnDisabled || this.state.isLoading} type="submit">{this.rowData ? "Update" : "Save"}</Button>
                    </div>
                </Form>
            </div>
            </>
        );
    }
}