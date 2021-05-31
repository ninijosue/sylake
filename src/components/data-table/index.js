import { h, Component } from "preact";


export class DataTable extends Component {
    constructor(props) {
        super();
        this.props = props;

        this.state = {
            tableData: props.data || [],
            columns: {},
            selectAll: false,
            selectedRows: new Set()
        };
        if (props.rowDef) this.rowDef = props.rowDef.bind(this);
        if (props.footDef) this.footDef = props.footDef;


        this.getColumns();

        this.onRowClicked = !this.props.onRowClicked ? () => { } : this.props.onRowClicked;
        this.selectAll = this.selectAll.bind(this);

    }
    get selectedRows() {
        return this.state.selectedRows;
    }
    getColumns() {
        const children = Array.isArray(this.props.children) ? this.props.children : [this.props.children];
        for (const child of children) {
            if (child.type != ColDef) continue;
            this.state.columns[child.props.name] = child;
        }
    }

    onRowSectionChange(rowData) {
        const selectedRows = this.state.selectedRows;

        if (selectedRows.has(rowData)) {
            this.deSelectRow(rowData);
        } else {
            this.selectRow(rowData);
        }
        this.setState({
            selectedRows: selectedRows
        });

    }

    rowDef(row, index, rowData) {
        const rowNumbers = this.props.showRowNumbers ? <td>{index + 1}</td> : null;
        const showCheckBoxes = this.props.showCheckBoxes ?
            <td><input onChange={evt => this.onRowSectionChange(rowData)} type="checkbox" checked={this.state.selectedRows.has(rowData)} /></td>
            : null;
        return [
            <tr onClick={evt => this.onRowClicked(evt, rowData, index)}>
                {showCheckBoxes}
                {rowNumbers}
                {Object.entries(row).map((td) => {
                    const [tdName, tdValue] = td;
                    return [
                        <td className={tdName}>{tdValue.toLocaleString()}</td>
                    ]
                })}
            </tr>
        ];
    }

    get selectedRows() {
        return this.state.selectedRows;
    }

    onRowSelection(rowData) {
        if (!this.props.onRowSelection) return;
        this.props.onRowSelection(rowData, this);
    }

    selectRow(row) {
        if (this.state.selectedRows.has(row)) return;
        let selectedRows = this.state.selectedRows;
        selectedRows.add(row);
        this.setState({ selectedRows });
        this.onRowSelection(row);
    }

    deSelectRow(row) {
        if (!this.state.selectedRows.has(row)) return;
        let selectedRows = this.state.selectedRows;
        selectedRows.delete(row);
        this.setState({ selectedRows });
        this.onRowSelection(null);

    }

    selectAll(value) {
        let selectedRows = new WeakSet()

        if (value) {
            this.state.tableData.forEach(row => {
                se > lectedRows.add(row)
            });
        }

        this.setState({
            selectAll: value,
            selectedRows: selectedRows
        });


    }

    renderTableHeader(state) {
        const showCheckBoxes = this.props.showCheckBoxes ? <th><input type="checkbox" disabled onChange={evt => this.selectAll(evt.target.checked)} /></th> : null;
        const rowNumbers = this.props.showRowNumbers ? <th>#</th> : null;
        return [showCheckBoxes, rowNumbers, Object.keys(state.columns).map(columnName => {
            const column = state.columns[columnName];
            return <th onClick={(evt) => { return column.props.sortable ? this.sortBy(columnName) : null }}>{column.props.children}</th>
        })];
    }

    renderTableBody(data) {
        const allowedRows = Object.keys(this.state.columns);
        return data.map((row, index) => {
            const rowData = {};
            for (let col of allowedRows) {
                rowData[col] = row[col];
            }
            const rowComponent = this.rowDef(rowData, index, row);
            return rowComponent;
        });
    }

      /**
     * 
     * @param {[{}]} data 
     */
    renderTableFoot(data) {
        const columns = this.state.columns;
        const result = {};
        for (const col in columns) {
            const func = columns[col];
            const calculate = func.props.calculate;
            if (calculate) {
                const checkedData = data.map(d=>{
                    const forCheck = d[col];
                    if(isNaN(Number(forCheck))) d[col] = 0;
                    return d
                    
                });
                if (checkedData.length !== 0) {
                    const value = checkedData.reduce((acc, currVal) => {
                        return calculate(Number(acc), Number(currVal[col]));
                    }, 0);
                    result[col] = value;
                }
            }
        }
        const row = this.footDef ? (this.footDef(result)) : "";
        return row;
    }

    sortBy(columnName) { }

    /**
     * @param {any} Object 
     * @param {string} queryString 
     * @returns {boolean}
     */
    _searchObject(seachObject = {}, queryString) {
        const searchArray = !seachObject ? [] : Object.values(seachObject);
        let found = false;
        for (const objectValue of searchArray) {
            const valueType = typeof objectValue;
            if (valueType == "boolean" || valueType == "string" || valueType == "number") {
                found = objectValue.toString().toLowerCase().includes(queryString);
                if (found) break;
            }
            else {
                return this._searchObject(objectValue, queryString);
            }
        }
        return found;
    }

    search(queryString) {
        const value = queryString.toLowerCase();
        if (value == "") return;
        this.state.data = this.state.data.filter(singleData => {
            return this._searchObject(singleData, value.trim());
        });
    }

    render(props, state) {
        state.data = props.data;
        const { className, searchValue = "" } = props;
        this.search(searchValue);
        return (
            <div>
                <table className={className} >
                    <thead>
                        <tr>{this.renderTableHeader(state)}</tr>
                    </thead>
                    <tbody>
                        {this.renderTableBody(this.state.data)}
                    </tbody>
                    <tfoot>
                        {this.renderTableFoot(state.data)}
                    </tfoot>
                </table>
            </div>
        );
    }

}
export class ColDef extends DataTable {
    constructor(props, state) {
        super(props, state);
    }
    render(props, state) {
        return (
            <div>{props.children}</div>
        );
    }
}