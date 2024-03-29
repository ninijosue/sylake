import { h, Component } from 'preact';
import { AppBar, Box, Tab, Tabs, Typography } from '@material-ui/core';
import TabPanel from '../../components/tab-panel/index';
import styles from "./style.scss";
import UnpaidCredits from './components/unpaid-credits';
import PaidCredits from './components/paid-credits';

export default class LoansList extends Component {
    constructor() {
        super();
        this.state = {
            currentValue: 0
        }
    }


    a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
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
                    <UnpaidCredits site={this.props.site} user={this.props.user} isLoading={status => this.props.isLoading(status)} />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <PaidCredits site={this.props.site} user={this.props.user} isLoading={status => this.props.isLoading(status)} />
                </TabPanel>
            </div>
        )
    }
}