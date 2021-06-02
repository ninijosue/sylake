import { h, Component, createRef } from 'preact';
import Button from '../Button';
import Form from '../form';
import Loading from '../loading-C';
import TextField from '../text-field';
import styles from "./style.scss";
import closePopup from '../../helper/closePopUp';
import SiteModel from '../../models/sites';
import Toast from '../toast';
import Select from '../select-C';

export default class AddEditSite extends Component {
    constructor(props) {
        super(props);
        this.state = {
            btnDisabled: false,
            isLoading: false
        }

        this.rowData = props.rowData;
        this.siteName = createRef();
        this.user = props.user;
        this.primaryId = this.user.primaryId;

    }

    componentDidMount() {
        const siteNameInput = this.siteName.current.base.querySelector("input");
        siteNameInput.value = this.rowData ? this.rowData.siteName : "";
        if (this.rowData) this.setState({ btnDisabled: true });
    }

    onFieldChanged() {
        if (this.rowData) this.setState({ btnDisabled: false });
    }

    async formSubmition(formData) {
        
        const productsDefine = formData.productsDefine.toLowerCase();
        console.log(productsDefine)
        const online = window.navigator.onLine;
        if (!online) return Toast.create("There is no internet connection. Please check!", { errorMessage: true });
        const siteName = formData.siteName;
        if (!siteName || siteName == "") return;
        const data = {
            siteName: siteName.toLowerCase(),
            productsDefine,
            doneBy: {
                uid: this.user.uid,
                names: this.user.names ? this.user.names : ""
            },
            tx_t: new Date().getTime()
        }
        this.setState({ isLoading: true });
        if (this.rowData) {
            const dataForModel = {
                ...data,
                ref: this.rowData.ref,
                productsDefine
            }
            const res = await SiteModel.updateSite(dataForModel);
            if (res.status !== 200) Toast.create(res.message, { errorMessage: true });
            else Toast.create(res.message, { successMessage: true });
        }
        else {
            if (!this.primaryId) return;
            const res = await SiteModel.addNewSite(data, this.primaryId)
            if (res.status !== 200) Toast.create(res.message, { errorMessage: true });
            else Toast.create(res.message, { successMessage: true });
        }
        this.setState({ isLoading: false });
        this.props.reflesh()
        closePopup();

    }

    render() {
        return (
            <>
                <Loading visible={this.state.isLoading} />
                <div className={styles.formContainerPosition}>
                    <h2 className={styles.formTitle}>{this.rowData ? "Edit" : "Add new"} Site</h2>
                    <Form onSubmit={data => this.formSubmition(data)}>
                        <div className={styles.addEditRow}>
                            <div className={styles.fieldRow}>
                                <TextField id="site_-_name" onInput={_ => this.onFieldChanged()} ref={this.siteName} className={styles.inputField} type="text" label="Site name" name="siteName" required />
                            </div>
                            <div>
                                <Select  name="productsDefine" label="Products Defined">
                                    <option value="default">Default</option>
                                    <option value="custom">Custom</option>
                                </Select>
                            </div>
                        </div>
                        <div className={`${styles.submitBtnRow} ${styles.addOrEditCategoryBtnSubmit}`}>
                            <Button  type="submit">{this.rowData ? "Update" : "Save"}</Button>
                        </div>
                    </Form>
                </div>
            </>
        );
    }
}