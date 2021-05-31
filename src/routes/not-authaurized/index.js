import { h, Component } from 'preact';

class NotAuthorized extends Component {
    render({}, {}) {
        return (
            <div>
                <h1>Not authorized</h1>
            </div>
        );
    }
}

export default NotAuthorized;