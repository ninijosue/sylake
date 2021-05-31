import { h } from 'preact';
import styles from './style.scss';

const Button = props => {
    const currentProps = props;
    const outClassName = currentProps.className ;
    // currentProps.children ? delete currentProps.children : ""
    return <button  {...currentProps} className={`${styles.overallButton} ${outClassName}`}>{props.children}</button>
}

export default Button;