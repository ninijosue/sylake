import { h, Component, createRef } from 'preact';
import Button from '../Button';
import Form from '../form';
import Loading from '../loading-C';
import TextField from '../text-field';
import styles from "./style.scss";
import closePopup from '../../helper/closePopUp';
import SiteModel from '../../models/sites';

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
        const siteName = formData.siteName;
        if(!siteName || siteName == "") return;
        const data = {
            siteName: siteName.toLowerCase(),
            doneBy: {
                uid: this.user.uid,
                names: this.user.names ? this.user.names : ""
            },
            tx_t: new Date().getTime()
        }
        this.setState({isLoading: true});
        if(this.rowData){
            const dataForModel = {
                ...data,
                ref: this.rowData.ref
            }
            const res = await SiteModel.updateSite(dataForModel);
            alert(res.message)
        }
        else{
            if(!this.primaryId) return;
            const res = await SiteModel.addNewSite(data, this.primaryId)
            alert(res.message);
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
                <h2 className={styles.formTitle}>{this.rowData ? "Edit" : "Add new"} Site</h2>
                <Form onSubmit={data => this.formSubmition(data)}>
                    <div className={styles.addEditRow}>
                        <div className={styles.fieldRow}>
                            <TextField id="site_-_name" onInput={_ => this.onFieldChanged()} ref={this.siteName} className={styles.inputField} type="text" label="Site name" name="siteName" required />
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