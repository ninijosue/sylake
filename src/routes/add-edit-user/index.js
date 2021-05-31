import { h, Component, createRef } from 'preact';
import Form from '../../components/form';
import TextField from '../../components/text-field';
import UsersModel from '../../models/users';
import styles from "./style.scss";
import Button from '../../components/Button/index';
import { allPermission } from '../../generators/routeVerifier';
import SiteModel from '../../models/sites';
import { route } from 'preact-router';

export default class AddEditUserComponent extends Component {
    constructor(props) {
        super();
        this.state = {
            isLoading: false,
            saveBtnDisabled: false,
            salesProducts: [],
            checkedData: new Map(),
            choosenSites: new Map(),
            rowData: undefined,
            sites: []

        };
        this.names = createRef();
        this.email = createRef();
        this.phoneNumber = createRef();
        this.idNumber = createRef();
        this.role = createRef();
        this.locationField = createRef();
        this.userNameField = createRef();
        this.isEdit = props.isEdit;
        this.user = props.user;
        this.permissions = allPermission;
        this.primaryId = this.user.uid;

    }

    setGivenRoutes(rowData) {
        if (!rowData) return
        const userPermissions = rowData ? rowData.permittedRessources ? rowData.permittedRessources : [] : [];
        const userPermittedSites = rowData ? rowData.sites ? rowData.sites : [] : [];

        for (const userPermission of userPermissions) {
            this.permissions.forEach((permi, index) => {
                if (permi == userPermission) {
                    this.state.checkedData.set(index, permi);
                }
            });
        }



        for (const permittedSite of userPermittedSites) {
            this.state.sites.forEach((site, index) => {
                if (site.siteName == permittedSite)
                    this.state.choosenSites.set(index, permittedSite);
            });
        }
    }

    async getSites() {
        this.props.isLoading(true);
        const sites = await SiteModel.getSites(this.primaryId);
        this.props.isLoading(false);
        this.setState({ sites })
    }

    async getDataFromFire(userDocId) {
        const dataForModel = {
            isOwner: false,
            uid: userDocId,
            primaryId: this.user.primaryId
        };

        this.props.isLoading(true);
        const rowData = await UsersModel.getUser(dataForModel);
        this.setGivenRoutes(rowData);
        this.props.isLoading(false);
        if (rowData) {
            this.setState({ rowData })
            const names = this.names.current.base.querySelector("input");
            names.value = rowData ? rowData.names : "";
            const email = this.email.current.base.querySelector("input");
            email.value = rowData ? rowData.email : "";
            const phoneNumber = this.phoneNumber.current.base.querySelector("input");
            phoneNumber.value = rowData ? rowData.phoneNumber : "";
            const idNumber = this.idNumber.current.base.querySelector("input");
            idNumber.value = rowData ? rowData.idNumber : "";
            const locationField = this.locationField.current.base.querySelector("input");
            locationField.value = rowData ? rowData.location ? rowData.location : "" : "";
            const userNameField = this.userNameField.current.base.querySelector("input");
            userNameField.value = rowData ? rowData.userName ? rowData.userName : "" : "";

        }


    }

    componentDidMount() {
        // const onLine = window.navigator.onLine;
        // if (!onLine) return alert("There is no internet connection.");
        const rowData = this.state.rowData;
        const userDocId = this.props.userDocId;
        this.getSites();

        if (userDocId) {
            this.getDataFromFire(userDocId);
        }

        const names = this.names.current.base.querySelector("input");
        names.value = rowData ? rowData.names : "";
        const email = this.email.current.base.querySelector("input");
        email.value = rowData ? rowData.email : "";
        const phoneNumber = this.phoneNumber.current.base.querySelector("input");
        phoneNumber.value = rowData ? rowData.phoneNumber : "";
        const idNumber = this.idNumber.current.base.querySelector("input");
        idNumber.value = rowData ? rowData.idNumber : "";
        const locationField = this.locationField.current.base.querySelector("input");
        locationField.value = rowData ? rowData.location ? rowData.location : "" : "";
        const userNameField = this.userNameField.current.base.querySelector("input");
        userNameField.value = rowData ? rowData.userName ? rowData.userName : "" : "";
        if (rowData) {
            this.setState({ saveBtnDisabled: true });
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
        const isEdit = this.props.isEdit;
        const rowData = this.state.rowData;
        // if (!onLine) return alert("There is no internet connection.");
        const user = this.props.user;
        if (!user.isOwner) return;
        const permittedRessources = Array.from(this.state.checkedData.values());
        const permittedSites = Array.from(this.state.choosenSites.values());
        delete data.email;
        const dataForFire = {
            ...data,
            permittedRessources,
            sites: permittedSites,
            creationTime: new Date()
        };
        this.setState({ isLoading: true });
        this.props.isLoading(true);
        const primaryId = this.user.primaryId;
        if (!isEdit) {
            const res = await UsersModel.createUser(dataForFire, primaryId);
            alert(res.message);
        }
        else {
            const res = await UsersModel.updateUser(dataForFire, primaryId, rowData.ref.id);
            alert(res.message);
        }
        this.props.isLoading(false);
        this.setState({ isLoading: false });
        route("/users");
    }

    /**
     * 
     * @param {boolean} checked 
     * @param {{page: string, index: number}} parsedData 
     */
    onChecking(checked, parsedData) {
        const checkedData = this.state.checkedData;
        const index = parsedData.index;
        if (checked) checkedData.set(index, parsedData.page);
        else checkedData.delete(index);
        this.setState({ checkedData });
    }

    onSiteChecking(checked, parsedData) {
        const choosenSites = this.state.choosenSites;
        const index = parsedData.index;
        if (checked) choosenSites.set(index, parsedData.site);
        else choosenSites.delete(index);
        this.setState({ choosenSites });
    }

    displayAllPages() {
        const checkedData = this.state.checkedData;
        return this.permissions.map((page, index) => {
            const dataToParse = { page, index }
            return (
                <li>
                    <input id={`fjdkqoei3e${index}`} checked={checkedData.has(index)} onChange={evt => this.onChecking(evt.target.checked, dataToParse)} type="checkbox" />
                    <label for={`fjdkqoei3e${index}`}>{page}</label>
                </li>
            )
        })
    }

    _sites() {
        const choosenSite = this.state.choosenSites;
        return this.state.sites.map((data, index) => {
            const dataToParse = { site: data.siteName, index }
            return (
                <li>
                    <input id={`fjdkjal${index}`} checked={choosenSite.has(index)} onChange={evt => this.onSiteChecking(evt.target.checked, dataToParse)} type="checkbox" />
                    <label for={`fjdkjal${index}`}>{data.siteName}</label>
                </li>
            )
        })
    }

    render() {
        return (
            <>
                <div className={styles.addEditUserContainerFluid}>
                    <h1>{this.isEdit ? "Edit user" : "Add user"}</h1>
                    <div className={styles.addEditContainer}>
                        <div className={styles.addEditRows}>
                            <Form onSubmit={data => this.formSubmition(data)}>
                                <div className={styles.fields}>
                                    <div className={styles.addEditRow}>
                                        <TextField className={styles.inputField} onInput={_ => this.setState({ saveBtnDisabled: false })} required ref={this.names} name="names" label="Names" />
                                        <TextField className={styles.inputField} onInput={_ => this.setState({ saveBtnDisabled: false })} ref={this.email} required name="email" label="Email" disabled type="email" />
                                    </div>

                                    <div className={styles.addEditRow}>
                                        <TextField className={styles.inputField} onInput={_ => this.setState({ saveBtnDisabled: false })} ref={this.phoneNumber} required name="phoneNumber" label="Phone number" type="tel" />
                                        <TextField className={styles.inputField} onKeyDown={evt => this._arrowNumericOnly(evt)} inputmode="numeric" pattern="[\d]{16}" autoComplete="none"
                                            onInput={_ => this.setState({ saveBtnDisabled: false })} ref={this.idNumber} required name="idNumber" label="ID number" type="text" />
                                    </div>
                                    <div className={styles.addEditRow}>
                                        <TextField ref={this.userNameField} className={styles.inputField} name="userName" label="User name" type="text" required />
                                        <TextField ref={this.locationField} className={styles.inputField} name="location" label="Location" type="text" required />
                                    </div>
                                </div>
                                <div className={styles.moreInfoAssociated}>
                                    <ul className={styles.ulOfPermisions}>
                                        <h3>Permissions</h3>
                                        {this.displayAllPages()}
                                    </ul>
                                    <ul className={styles.ulOfPermisions}>
                                        <h3>Sites</h3>
                                        {this._sites()}
                                    </ul>
                                </div>
                                <div className={styles.submitBtn}>
                                    <Button disabled={this.state.isLoading} type="submit" >{this.state.rowData ? "Update" : "Save"}</Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}