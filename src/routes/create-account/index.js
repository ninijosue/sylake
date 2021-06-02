import { h, Component, createRef } from 'preact';
import { route } from 'preact-router';
import Button from '../../components/Button';
import CircularLoading from '../../components/circular-loadding';
import Form from '../../components/form';
import TextField from '../../components/text-field';
import Toast from '../../components/toast';
import UsersModel from '../../models/users';
import styles from "./style.scss";

export default class CreateAccount extends Component {
    constructor() {
        super();
        this.state = {
            passwordConfirmVisible: false,
            passwordVisible: false,
            currentView: "info",
            data: {},
            productsDefine: undefined,
            isLoading: false,
            agreed: false,
            evaluater: new Map()
        }
        this.passwordChange = this.passwordChange.bind(this);
    }

    passwordChange() {
        let passwordVisible = this.state.passwordVisible;
        if (passwordVisible) passwordVisible = false;
        else passwordVisible = true;
        this.setState({ passwordVisible });
    }

    passwordConfirmChange() {
        let passwordConfirmVisible = this.state.passwordConfirmVisible;
        if (passwordConfirmVisible) passwordConfirmVisible = false;
        else passwordConfirmVisible = true;
        this.setState({ passwordConfirmVisible });
    }

    submitionOfInfo(formData) {
        const names = formData.names.toLowerCase();
        const email = formData.email;
        const birthDay = formData.birthDay;
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;
        if (!names | !email | !birthDay | !password) return;
        const data = { names, email, birthDay, password };
        if (password !== confirmPassword) return Toast.create("Password didn't match. Please check!", { errorMessage: true });
        this.setState({ currentView: "productsDefine" });

    }



    firstStape() {
        const data = this.state.data;
        const visibility = <svg height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>;

        const unvisibility = <svg height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0z" fill="none" /><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" /></svg>

        return (
            <>

                <Form onSubmit={data => this.submitionOfInfo(data)}>
                    <div className={styles.row}>
                        <TextField onChange={evt => this.setState({ data: { ...data, names: evt.target.value } })} value={data.names ? data.names : ""} className={styles.inputField} name="names" label="Names" type="text" required />
                        <TextField onChange={evt => this.setState({ data: { ...data, email: evt.target.value } })} value={data.email ? data.email : ""} className={styles.inputField} name="email" label="Email" type="email" required />
                    </div>
                    <div className={styles.row}>
                        <TextField onChange={evt => this.setState({ data: { ...data, birthDay: evt.target.value } })} value={data.birthDay ? data.birthDay : ""} className={styles.inputField} label="Birth day" type="date" name="birthDay" required />
                        <TextField onChange={evt => this.setState({ data: { ...data, phoneNumber: evt.target.value } })} value={data.phoneNumber ? data.phoneNumber : ""} className={styles.inputField} name="phoneNumber" label="Phone number" type="tel" required />
                    </div>
                    <div className={styles.row}>
                        <TextField value={data.password ? data.password : ""} onChange={evt => this.setState({ data: { ...data, password: evt.target.value } })} onPrefixButtonClick={_ => this.passwordChange()} prefixIcon={this.state.passwordVisible ? unvisibility : visibility}
                            className={styles.inputField} label="Password" type={this.state.passwordVisible ? "text" : "password"} name={"password"} required />
                        <TextField onChange={evt => this.setState({ data: { ...data, confirmedPassword: evt.target.value } })} value={data.confirmedPassword ? data.confirmedPassword : ""} onPrefixButtonClick={_ => this.passwordConfirmChange()} prefixIcon={this.state.passwordConfirmVisible ? unvisibility : visibility}
                            type={this.state.passwordConfirmVisible ? "text" : "password"} name="confirmPassword" className={styles.inputField} label="Confirm password" required />
                    </div>
                    <div className={styles.nextBtnSec}>
                        <Button type="submit">Next</Button>
                    </div>
                </Form>
            </>
        );
    }

    productsDefineSubmtion(formData) {
        if (!formData) return;
        const data = {
            ...this.state.data,
            productsDefine: this.state.productsDefine
        }
        this.setState({
            data,
            currentView: "moneyRange"
        });
    }

    productsDefineDefaultChecking(checked) {
        let productsDefine = this.state.productsDefine;
        const evaluater = this.state.evaluater;
        if (checked) {
            productsDefine = "default";
            evaluater.set("productsDefine", "defalut");

        }
        else {
            productsDefine = undefined;
            evaluater.set("productsDefine", undefined);

        }
        this.setState({ productsDefine, evaluater });

    }

    productsDefineCustomChecking(checked) {
        let productsDefine = this.state.productsDefine;
        const evaluater = this.state.evaluater;
        if (checked) {
            productsDefine = "cutom";
            evaluater.set("productsDefine", "custom");

        }
        else {
            productsDefine = undefined;
            evaluater.set("productsDefine", undefined);

        }
        this.setState({ productsDefine, evaluater });
    }

    productsDefineDefaultChecking(checked) {
        let productsDefine = this.state.productsDefine;
        if (checked) productsDefine = "default";
        else productsDefine = undefined;
        this.setState({ productsDefine });
    }


    productsDefine() {
        const data = this.state.data;
        const evaluaterOfProductsDefine = this.state.evaluater.get("productsDefine");
        return (
            <>
                <button title="Back" type="button" onClick={_ => this.setState({ currentView: "info" })} className={styles.backBtn} >
                <svg  height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z"/></svg>
                </button>
                <div className={styles.chooseProductRole}>
                    <Form onSubmit={data => this.productsDefineSubmtion(data)}>
                        <div className={styles.prodRow}>
                            <div className={styles.prodHead}>
                                <input onChange={evt => this.productsDefineDefaultChecking(evt.target.checked)} id="default_product" type="radio" name="productsDefine" value="default" required />
                                <label for="default_product">Default</label>
                            </div>
                            <p for="default_product">
                                Once you hit 67, putting extra money into your super account becomes more difficult as you need to prove you are gainfully employed, which means satisfying the superannuation work test.
                </p>
                        </div>
                        <div className={styles.prodRow}>
                            <div className={styles.prodHead}>
                                <input onChange={evt => this.productsDefineCustomChecking(evt.target.checked)} id="custom_product" type="radio" name="productsDefine" value="custom" required />
                                <label for="custom_product">Custom</label>
                            </div>
                            <p for="custom_product">
                                Once you hit 67, putting extra money into your super account becomes more difficult as you need to prove you are gainfully employed, which means satisfying the superannuation work test.
                </p>
                        </div>
                        <div className={styles.btnSubmitSubmit}>
                            <Button type="submit" >Next</Button>
                        </div>
                    </Form>
                </div>
            </>
        )
    }

    moneyRangeSubmtion(formData) {
        if (!formData) return;
        const data = {
            ...this.state.data,
            moneyDescription: formData.moneyDescription,
        };

        this.setState({ data, currentView: "agreement" });
    }

    moneyRange() {
        return (
            <>
                <button title="Back" type="button" onClick={_ => this.setState({ currentView: "productsDefine" })} className={styles.backBtn} >
                <svg  height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z"/></svg>
                </button>
                <div className={styles.moneyRangeContainer}>
                    <p>Once you hit 67, putting extra money into your super account becomes more difficult as you need to prove .</p>
                    <Form onSubmit={data => this.moneyRangeSubmtion(data)}>
                        <div className={styles.inputSector}>
                            <input type="text" name="moneyDescription" required />
                        </div>
                        <div className={styles.submtionOfMoneyRange}>
                            <Button type="submit" >Next</Button>
                        </div>
                    </Form>
                </div>
            </>
        );
    }

    async create() {
        const data = this.state.data;
        this.setState({ isLoading: true });
        const res = await UsersModel.createAccount(data);
        if (res.status !== 200) {
            Toast.create("Account creation failled. Please try again!", { errorMessage: true })
            this.setState({ isLoading: false, currentView: "info" });
        }
        else route("/");

    }

    agreement() {

        return (
            <>
                <button title="Back" type="button" onClick={_ => this.setState({ currentView: "moneyRange" })} className={styles.backBtn} >
                <svg  height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z"/></svg>
                </button>
                <div className={styles.aggrementRow}>
                    <div className={styles.agreement}>
                        <p>
                            Reaching age 67 is now one of life’s big milestones, as that’s when most Aussies will become eligible for the Age Pension. But unfortunately, when it comes to the super system, it’s also the age when the super contribution rules start to tighten up. <br /> <br />
                                    Once you hit 67, putting extra money into your super account becomes more difficult as you need to prove you are gainfully employed, which means satisfying the superannuation work test. <br /> <br />
                                    Unfortunately, the super work test and the work test exemption can be a little tricky to understand, so here’s a simple guide to the key points.
                                </p>
                    </div>
                    <Form onSubmit={_ => this.create()}>
                        <div className={styles.agree}>
                            <input onChange={evt => this.setState({ agreed: evt.target.checked })} id="IAgree" type="checkbox" required />
                            <label for="IAgree"><span>I agree</span></label>
                        </div>
                        <div className={styles.finishTheStapes}>
                            <Button disabled={!this.state.agreed || this.state.isLoading} type="submit" >Create</Button>
                        </div>
                    </Form>
                </div>
            </>
        )
    }

    toBeRendered() {
        const currentView = this.state.currentView;
        switch (currentView) {
            case "info": return this.firstStape();
            case "productsDefine": return this.productsDefine();
            case "moneyRangeSubmtion": return this.moneyRangeSubmtion();
            case "moneyRange": return this.moneyRange();
            case "agreement": return this.agreement();
            default:
                return this.firstStape();
        }
    }

    render() {
        return (
            <>
                {
                    this.state.isLoading
                        ? <CircularLoading />
                        : (
                            <div className={styles.createAccountContainerFluid}>
                                <div className={styles.container}>
                                    <div className={styles.rows}>
                                        <h1>Create account</h1>
                                        {this.toBeRendered()}
                                    </div>
                                </div>
                            </div>
                        )
                }
            </>
        );
    }
}