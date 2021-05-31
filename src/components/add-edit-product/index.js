import { h, Component, createRef } from 'preact';
import closePopup from '../../helper/closePopUp';
import ProductModel from '../../models/products';
import Form from '../form';
import Loading from '../loading-C';
import Select from '../select-C';
import TextField from '../text-field';
import styles from "./style.scss";
export default class AddOrEditProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            saveBtnDisabled: false
        };
        this.productName = createRef();
        this.price = createRef();
        this.user = props.user;
        this.productRole = createRef();
        this.productUnitName = createRef();
        this.notifyMeWhenRemain = createRef();
        this.productsDefine = this.user.productsDefine;
        this.sites = this.user.sites;
    }

    componentDidMount() {
        // const onLine = window.navigator.onLine;
        // if (!onLine) return alert("There is no internet connection.");
        const rowData = this.props.rowData;
        if (this.productsDefine == "custom") {
            const input = this.productRole.current.input.current.base.querySelector("input");
            input.value = rowData ? rowData.productRole : "";
        }
        const productName = this.productName.current.base.querySelector("input");
        productName.value = rowData ? rowData.productName : "";
        const price = this.price.current.base.querySelector("input");        
        price.value = rowData ? rowData.unitPrice : "";
        const productUnitName = this.productUnitName.current.base.querySelector("input");
        productUnitName.value = rowData ? rowData.productUnitName ? rowData.productUnitName: "" : "";
        const notifyMeWhenRemain = this.notifyMeWhenRemain.current.base.querySelector("input");
        notifyMeWhenRemain.value = rowData ? rowData.notifyMeWhenRemain ? rowData.notifyMeWhenRemain: "" : "";

        if (rowData) {
            this.setState({ saveBtnDisabled: true });
        }
        else {
            this.setState({ saveBtnDisabled: false });
        }
    }

    async _formSubmition(data) {
        const onLine = window.navigator.onLine;
        if (!onLine) return alert("There is no internet connection.");
        const site = this.props.site;
        const isInUserSites = this.sites.includes(site);
        if(!site || !isInUserSites) return alert("No apropriate site selected!");
        let productRole = data.productRole;
        if (!productRole) productRole = "both";
        const rowData = this.props.rowData;
        const primaryId = this.user.primaryId;

        const dataForModel = {
            productName: data.productName.toLowerCase(),
            unitPrice: Number(data.unitPrice),
            productRole,
            productUnitName: data.productUnitName.toLowerCase(),
            notifyMeWhenRemain: Number(data.notifyMeWhenRemain)
        };

        this.setState({ isLoading: true });
        if (!rowData) {
            const res = await ProductModel.addProduct(dataForModel, primaryId, site);
            alert(res.message);
        }
        else {
            const dataToUpdate = {
                productName: data.productName.toLowerCase(),
                productUnitName: data.productUnitName.toLowerCase(),
                unitPrice: Number(data.unitPrice),
                productRole,
                ref: rowData.ref,
                notifyMeWhenRemain: Number(data.notifyMeWhenRemain)
            }

            await ProductModel.updateProduct(dataToUpdate);
        }
        this.setState({ isLoading: false });
        this.props.refleshData();
        closePopup();
    }

    render() {
        const rowData = this.props.rowData;
        const productsDefine = this.user.productsDefine;
        return (
            <>
                <Loading visible={this.state.isLoading} />
                <div className={styles.addNewPurchaseContainer}>
                    <div className={styles.formContainerPoition}>
                        <div>
                            <h2 className={styles.formTitle}>{rowData ? "Update product" : "Add product"}</h2>
                            <Form onSubmit={data => this._formSubmition(data)}>
                                <div>
                                    <TextField onInput={_ => this.setState({ saveBtnDisabled: false })} required ref={this.productName} name="productName" label="Product name" />
                                    <TextField onInput={_ => this.setState({ saveBtnDisabled: false })} ref={this.price} required name="unitPrice" label="Unit price" type="number" />
                                    {
                                        productsDefine == "custom"
                                            ? <Select onChange={_ => this.setState({ saveBtnDisabled: false })} ref={this.productRole} label="Product role" name="productRole">
                                                <option value="product for sale">Product for sale</option>
                                                <option value="product for purchase">Product for purchase</option>
                                                <option value="both">Both</option>
                                            </Select>
                                            : ""

                                    }
                                    <TextField onInput={_ => this.setState({ saveBtnDisabled: false })} ref={this.productUnitName} required name="productUnitName" label="Quantity unit (Ex: kg, piece)" type="text" />
                                    <TextField onInput={_ => this.setState({ saveBtnDisabled: false })} ref={this.notifyMeWhenRemain} required name="notifyMeWhenRemain" label="Notify me when remain" type="text" />

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