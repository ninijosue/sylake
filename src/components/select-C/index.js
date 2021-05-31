const { Component, createRef } = require("preact");
import style from "./style";
import TextField from "../text-field"

export default class Select extends Component {
    constructor() {
        super();
        this.state = {
            value: null,
            options: [],
            expanded: false,
            elementList: []
        };
        this.input = createRef();
    }

    componentDidMount() {
        document.addEventListener("click",
            evt => !evt.target.hasAttribute("unDismissible")
                ? this.setState({ expanded: false })
                : ""
        );
    }

    _renderOptions() {
        this.props.children = !Array.isArray(this.props.children) ? [this.props.children] : this.props.children;
        if (this.input.current == undefined) return;
        const input = this.input.current.base.querySelector("input");
        const filteredElement = this.props.children.filter(elt => {
            const childdrenToLowerCase = (elt.props.children.toString()).toLowerCase();
            const inputedValueToLowerCase = (input.value).toLowerCase();
            return childdrenToLowerCase.includes(inputedValueToLowerCase);
        });
        const options = [];
        const optionsVDOM = this.props.children.map((option, index) => {

            if (option.type !== "option") return null;
            const value = option.props.value;
            const label = option.props.children;
            options.push({ value, label });
            return <li role="option" aria-selected={index == this.state.value}
                data-value={value} tabIndex="0" onClick={_ => { this._onSelectChange(index) }}>{label}</li>
        });
        this.state.options = options;
        return optionsVDOM;
    }
    _onSelectChange(value) {
        this.setState({ value, expanded: false });
        const { options } = this.state;

        const optionValue = !!options[value] ? options[value] : null;
        const { onChange = _ => { } } = this.props;
        onChange(optionValue);
    }

    _onfocus(_) {
        this.setState({ expanded: true });
    }

    _onblur(value) {
    }

    render(props, { options, value, expanded }) {

        const { label, className, onChange = _ => { } } = props;
        const optionValue = !!options[value] ? options[value].value : null;
        const optionLabel = !!options[value] ? options[value].label : null;
        const name = props.name || null;

        const dropDrownSVG = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 10l5 5 5-5z" /></svg>;
        return <div unDismissible className={`${style.selectInput} ${className}`} expanded={expanded}>
            <TextField unDismissible disabled={props.disabled == undefined ? false : props.disabled}
                className={this.props.className} ref={this.input} onInput={evt => this._renderOptions()}
                type="text" value={!optionLabel ? props.value : optionLabel}
                label={label} prefixIcon={props.disabled == true ? "" : dropDrownSVG}
                onBlur={evt => { this._onblur(evt.target.value) }}
                onFocus={evt => { this._onfocus(evt) }} />
            <input type="hidden" value={optionValue || props.value} name={name} />
            <ul unDismissible className={style.optionsList} role="listbox">
                {this._renderOptions()}
            </ul>
        </div>
    }
}