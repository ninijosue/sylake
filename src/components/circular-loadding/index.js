import { h, Component } from 'preact';
import styles from "./style.scss";

class CircularLoading extends Component {
    render({ }, { }) {
        return (
            <div className={styles.circularLoadingWaitter}>
                <svg xmlns="http://www.w3.org/2000/svg" style="margin: auto; background: transparent; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                    <circle cx="50" cy="50" fill="none" stroke="#2262c6" stroke-width="1" r="8" stroke-dasharray="37.69911184307752 14.566370614359172">
                        <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.9174311926605504s" values="0 50 50;360 50 50" keyTimes="0;1" />
                    </circle>
                </svg>
            </div>
        );
    }
}

export default CircularLoading;