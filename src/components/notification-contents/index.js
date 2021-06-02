import { h, Component } from 'preact';
import { route } from 'preact-router';
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
                                <button unDismissible onClick={evt=> this.delete(evt, notification)} type="button"><svg unDismissible xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path unDismissible d="M0 0h24v24H0z" fill="none"/><path unDismissible d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
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