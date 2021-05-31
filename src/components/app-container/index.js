import { h, Component } from 'preact';
import styles from "./style.scss";

export default class AppContainer extends Component {
    render(props) {
        return (
            <div class={styles.appContainer}>
                <div className={styles.apprelative}>
                    {props.children}
                </div>
            </div>
        );
    }
}