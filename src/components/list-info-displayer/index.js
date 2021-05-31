import { h, Component } from 'preact';
import styles from "./style.scss";

export default class ListInfoDisplayer extends Component {
    constructor() {
        super();
    }

    render(props) {
        return (
            <>
                <div className={styles.listInfoDisplayerContainerFluid}>
                    <div className={styles.contentsContainer}>
                        <div className={styles.contents}>
                            {props.children}
                        </div>
                    </div>
                </div>
            </>
        )
    }
}