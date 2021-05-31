import { AppBar, Box, Tab, Tabs, Typography } from '@material-ui/core';
import { h, Component } from 'preact';
import TabPanel from '../../components/tab-panel/index';
import styles from "./style.scss";
import ActualExpenses from './components/actual-expenses/index';
import ExpenseCategories from './components/expense-categories';
import Sites from './components/sites/index';

export default class Expense extends Component {
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
                        <Tab label="Sites" {...this.a11yProps(0)} />
                        <Tab label="Expenses" {...this.a11yProps(1)} />
                        <Tab label="expense categories" {...this.a11yProps(2)} />
                    </Tabs>
                </AppBar>
                <TabPanel value={value} index={0}>
                    <Sites user={props.user} isLoading={status => props.isLoading(status)} />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <ActualExpenses site={(props.site)} user={props.user} isLoading={status => props.isLoading(status)} />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <ExpenseCategories site={(props.site)} user={props.user} isLoading={status => props.isLoading(status)} />
                </TabPanel>
            </div>
        )
    }
}



