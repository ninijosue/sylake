import { AppBar, Tab, Tabs } from '@material-ui/core';
import { h, Component } from 'preact';
import TabPanel from '../../components/tab-panel';
import styles from "./style.scss";
import OperatingAccount from './components/operating-account/index';
import CurrentAccount from './components/current-account/index';

class Report extends Component {
    constructor(props) {
        super();
        this.state = {
            currentValue: 0
        }
        this.user = props.user;
        this.primaryId = this.user.primaryId;
    }

    a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }
    
    render({ }, { currentValue }) {
        return (
            <div>
                <AppBar className={styles.barStylified} position="static" >
                    <Tabs
                        value={currentValue}
                        onChange={(evt, value)=>this.setState({currentValue: value})}
                        indicatorColor="primary"
                        // textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="tabs"
                    >
                        <Tab label="Operating account" {...this.a11yProps(0)} />
                        <Tab label="Current account" {...this.a11yProps(1)} />

                    </Tabs>
                </AppBar>
                <TabPanel value={currentValue} index={0}>
                   <OperatingAccount isLoading={status=>this.props.isLoading(status)} site={(this.props.site)} user={this.user} primaryId={this.primaryId} />
                </TabPanel>
                <TabPanel value={currentValue} index={1}>
                    <CurrentAccount isLoading={status=>this.props.isLoading(status)} site={(this.props.site)} user={this.user} primaryId={this.primaryId} />
                </TabPanel>

            </div>
        );
    }
}

export default Report;