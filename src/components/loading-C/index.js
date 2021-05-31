import {h, Component} from "preact";
import styles from "./style.css";
export default class Loading extends Component{
    
    render(props){
        return(
            <div  className={`${styles.loadingContainer} ${props.className ? props.className : ""} ${props.visible ? styles.visible : ""}`}>
                <div className={styles.mainLoading}></div>
            </div>
        );
    }
}