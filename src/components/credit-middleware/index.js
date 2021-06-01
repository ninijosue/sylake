import { AppBar, Tabs } from '@material-ui/core';
import {h, Component} from 'preact';
import TabPanel from '../tab-panel';
import styles from "./style.scss";

export default class CreditMiddleware extends Component{
    constructor() {
        super();
        this.state = {
            currentValue: 0
        }
    }


    a11yProps(index) {
        return {
            id: `simple-_--tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    render(props, state) {
        const value = state.currentValue;
        return (
            <div>
                <AppBar className={styles.barStylified} position="static">
                    <Tabs indicatorColor="primary"
                        value={value}
                        onChange={(evt, newValue) => this.setState({ currentValue: newValue })}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="tabs">
                        <Tab label="Unpaid credits" {...this.a11yProps(0)} />
                        <Tab label="Paid credits" {...this.a11yProps(1)} />
                    </Tabs>
                </AppBar>
                <TabPanel value={value} index={0}>
                    Unpaid credits
                </TabPanel>
                <TabPanel value={value} index={1}>
                    Paid credits
                </TabPanel>
            </div>
        )
    }
}