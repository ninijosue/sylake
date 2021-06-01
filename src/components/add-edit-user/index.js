import { h, Component, createRef } from 'preact';
import Form from '../form';
import Loading from '../loading-C';
import TextField from '../text-field';
import Select from '../select-C';
import styles from "./style.scss";
import UsersModel from '../../models/users';
import closePopup from '../../helper/closePopUp';
import { AppDB } from '../../db';
import Toast from '../toast';
export default class AddOrEditUser extends Component {
    constructor() {
        super();
        this.state = {
            isLoading: false,
            saveBtnDisabled: false,
            salesProducts: [],

        };
        this.names = createRef();
        this.email = createRef();
        this.phoneNumber = createRef();
        this.idNumber = createRef();
        this.role = createRef();
    }

    componentDidMount() {
        const onLine = window.navigator.onLine;
        if (!onLine) return Toast.create("There is no internet connection. Please check!", {errorMessage: true});
        const rowData = this.props.rowData;
        const names = this.names.current.base.querySelector("input");
        names.value = rowData ? rowData.names : "";
        const email = this.email.current.base.querySelector("input");
        email.value = rowData ? rowData.email : "";
        const phoneNumber = this.phoneNumber.current.base.querySelector("input");
        phoneNumber.value = rowData ? rowData.phoneNumber : "";
        const idNumber = this.idNumber.current.base.querySelector("input");
        idNumber.value = rowData ? rowData.idNumber : "";
        const role = this.role.current.base.querySelector("input");
        
        if (rowData) {
            this.setState({ saveBtnDisabled: true });
        }
        else {
            this.setState({ saveBtnDisabled: false });
        }
    }

    productsOptions() {
        return this.state.salesProducts.map(product => <option value={product.ref.id}>{product.productName}</option>)
    }

    _arrowNumericOnly(evt) {
        const keyCode = evt.keyCode;
        const isControlKey = evt.ctrlKey;
        if (isControlKey) return;
        if (keyCode > 57 && keyCode < 91) evt.preventDefault();
    }

    async formSubmition(data) {
        const onLine = window.navigator.onLine;
        if (!onLine) return Toast.create("There is no internet connection. Please check!", {errorMessage: true});
        const user = this.props.user;
        if(!data.administrativeGroup || data.administrativeGroup == "") return;
        if(!user.isOwner) return;
        const rowData = this.props.rowData;
        const dataForFire = {
            ...data,
            administrativeGroup: data.administrativeGroup.toLowerCase(),
            creationTime: new Date()
        };
        this.setState({ isLoading: true });
        if (!rowData) {
            const owner = user.uid;
            const res = await UsersModel.createUser(dataForFire, owner);
            if(res.status !== 200) Toast.create(res.message, {errorMessage: true});
           else Toast.create(res.message, {successMessage: true});
        }
        else{
            const owner = user.uid;
            const res = await UsersModel.updateUser(dataForFire, owner, rowData.docRef.id);
            if(res.status !== 200) Toast.create(res.message, {errorMessage: true});
           else Toast.create(res.message, {successMessage: true});
        }
        this.setState({ isLoading: false });
        this.props.reflesh();
        closePopup();
        await AppDB.auth().signOut();
        window.location.reload();
    }

    render() {
        const rowData = this.props.rowData;
        return (
            <>
                <Loading visible={this.state.isLoading} />
                <div className={styles.addNewPurchaseContainer}>
                    <div className={styles.formContainerPoition}>
                        <div>
                            <h2 className={styles.formTitle}>{rowData ? "Update user" : "Add user"}</h2>
                            <Form onSubmit={data => this.formSubmition(data)}>
                                <div>
                                    
                                    <Select onChange={_ => this.setState({ saveBtnDisabled: false })} ref={this.role} name="administrativeGroup" label="Role">
                                        <option value="admin">Admin</option>
                                        <option value="cashier">Cashier</option>
                                    </Select>
                                </div>
                                <div className={styles.submitBtn}>
                                    <button disabled={this.state.saveBtnDisabled} className="btn_main" type="submit" >{rowData ? "Update" : "Save"}</button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}