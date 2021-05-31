import { h, Component } from 'preact';
import { route } from 'preact-router';
import { closeIcon } from '../../assets/icons/icons';
import styles from "./style.scss";

class NotificationConents extends Component {

    

    directTo(evt, notification){
        const tagName = evt.target.tagName;
        if(tagName == "P" || tagName =="DIV"){
            this.props.hideNotifications();
            route(notification.route);
        };
         
    }

    delete(evt, notification){
        const tagName = evt.target.tagName;
        if(tagName == "P" || tagName == "DIV")return;
        this.props.delete(notification.ref.id);
    }

    render({ showContents, data }, { }) {
        return (
            <div unDismissible className={`${styles.notificationContentsContainerCover} ${showContents ? styles.showContents : ""}`} >
                <div unDismissible className={styles.notifiesContainer}>
                    {
                        data.length !== 0
                        ? data.map(notification => (
                            <div unDismissible onClick={evt=>this.directTo(evt, notification)} className={styles.row}>
                                <p >{notification.message}</p>
                                <button unDismissible onClick={evt=> this.delete(evt, notification)} type="button">{closeIcon}</button>
                            </div>
                        ))
                        : <div className={styles.notificationIsEmpty}><p>Empty</p> </div> 
                    }
                </div>
            </div>
        );
    }
}

export default NotificationConents;