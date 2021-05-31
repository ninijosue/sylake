import { Component, createRef } from "preact";
export default class Form extends Component {
    state = {
        value: {}
    };
    ref = createRef();
    componentDidMount(){
        // const onLine = window.navigator.onLine;
        // if (!onLine) return alert("There is no internet connection.");
        if (this.ref.current){
            Array.from(this.ref.current.elements).forEach(elt=>{
                elt.oninput = (evt)=>this.updateFormValue(evt);
                elt.onchange = (evt)=>this.updateFormValue(evt);
            })
        }
    }
    updateFormValue(evt) {
        const value = this.state.value;
        value[evt.target.name] = evt.target.value;
        if(!evt.target.getAttribute("name")) return;
        switch (evt.target.type) {
            case "number":
                value[evt.target.name] = Number(evt.target.value);
                break;
            case "date":
                value[evt.target.name] = new Date(evt.target.value);
                break;
            default:
                value[evt.target.name] = evt.target.value;
                break;
        }
        this.setState({
            value
        });
        if(this.props.onUpdateFormValue){
            this.props.onUpdateFormValue(value);
        }
    }
    get value() {
        return this.state.value
    }
    onSubmit(evt) {
        evt.preventDefault();
        const value = {};
        Array.from(this.ref.current.elements)
            .forEach(elt=>{
                if(elt.name) {
                    value[elt.name] = elt.value;
                }
            })
        this.props.onSubmit(value);
    }
    render(props, state) {
        if (this.props.onSubmit) {
            this.onSubmit = this.onSubmit = this.onSubmit
        }
        const propsObj = { ...props, onSubmit: (evt) => { this.onSubmit(evt) } };
        return <form {...propsObj} ref={this.ref}>
            {props.children}
        </form>
    }
}