import style from './style.scss';
import { Component } from 'preact';

export default class TextField extends Component {
    render (props) {
        const { leadingIcon, prefixIcon, className, ...transferedProps} = props;
        let {id, type="text" }= props;
        if(!id) id = props.name;
        if(props.type) type = props.type;
        return <div className={`${style.formElement} ${className}`} >
            {props.leadingIcon ? <button className={style.leadingIcon} type="button">
                <img src={props.leadingIcon}/>
            </button> : null}
            
            <input className={props.leadingIcon ? style.withLeadingSpace : ""} {...transferedProps} placeholder={props.label}  type={type} id={id} />
            <label for={id}>{props.label}</label>
            {props.prefixIcon ? <button onClick={_=>{props.onPrefixButtonClick ? props.onPrefixButtonClick(this) : null}} className={style.prefixIcon} type="button">
                {props.prefixIcon}
            </button> : null}
        </div>
}
}