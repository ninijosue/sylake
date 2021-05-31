import { h, Component } from 'preact';
import { route } from 'preact-router';
import { Link } from 'preact-router/match';
import Form from '../../components/form';
import TextField from '../../components/text-field';
import { App, Firebase } from '../../db';
import UsersModel from '../../models/users';
import styles from "./style.scss";

export default class Login extends Component {
    constructor() {
        super();
        this.state = {

        }
    }


    async _logIn(data) {
        this.props.isLoading(true);
        await UsersModel.login(data);
        this.props.isLoading(false);

    }

    render() {

        return (
            <>
                <div className={styles.AdminSignInContainer}>
                    <div className={styles.signInRow}>
                        <div className={styles.row}>
                            <Form onSubmit={(data) => this._logIn(data)}>
                                <h3>Log in</h3>
                                <TextField className={styles.inputField} label="Email" type="email" name="email" required />
                                <TextField className={styles.inputField} label="Password" type="password" name="password" required />
                                <button className={styles.loginbtn} disabled={this.state.disabled} type="submit" >Log In</button>
                            </Form>
                            <div className={styles.createAccountSection}>
                                <p>Do you want an account ? </p>
                                <button className={styles.createAccount} type="button"><Link href="/createAccount">Create account</Link></button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}