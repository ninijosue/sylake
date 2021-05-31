import { Box, Typography } from '@material-ui/core';
import { h, Component } from 'preact';

class TabPanel extends Component {
    render(props) {
        const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={1}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
    }
}

export default TabPanel;