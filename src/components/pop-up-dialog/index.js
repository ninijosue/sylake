import {h, Component, render, createRef} from "preact";
import closePopup from "../../helper/closePopUp";
import styles from "./style.scss";

export default class PopUpDialog extends Component{
    constructor(props){
        super(props);
        this.state = {properties: props};
        this.dialog = createRef();
    }
   
    close(){
        this.dialog.current.style.padding = "0px";
        closePopup();
    }
    
    render(){
        return (
            <>
            <div className={`${styles.dialogBg} ${styles.disactive} popupDialog`} >
                <div className={`${styles.mainDialog} main_-dialogContianer`} >
                    <button className={`${styles.closeDialogBtn} closeDialogBtn`} type="button" onClick={_=> this.close()} >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                    <div ref={this.dialog}  className={`${styles.trialPostion} trial`}>
                    </div>
                </div>
            </div>
            </>
        )
        
    }
}

