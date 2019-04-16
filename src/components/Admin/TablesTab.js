import React, { Component } from 'react';
import _ from 'underscore';
import { Segment, List, Button, Form } from 'semantic-ui-react';

export default class TablesTab extends Component {
  state = {
    tables: [],
    sortBy: 'Building',
    sortReverse: false,
    newTableInput: '',
    newTableBuilding: '',
  }

  componentDidMount = () => {
    fetch('/admin/table/', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ tables: result.tables })
      } else {
        console.log(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  sort = (type) => {
    if (this.state.sortBy === type) {
      this.setState({ sortReverse: !this.state.sortReverse })
    } else {
      this.setState({ sortBy: type, sortReverse: false })
    }
  }

  deleteTable = (tableId, table, building) => {
    if (!window.confirm(`Are you sure you want to remove table ${table} at ${building} location?`)) return
    fetch('/admin/table/'+tableId, {
      credentials: 'same-origin',
      method: 'DELETE',
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.componentDidMount();
      } else {
        alert(result.error)
      }
    })
    .catch(err => alert(err.message))
  }

  editTable = (tableId, table, building) => {
    const newTableCode = window.prompt(`Please enter new table code for ${table} at ${building} location:`)
    if (newTableCode) {
      fetch('/admin/table/'+tableId, {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          table: newTableCode,
        })
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          this.componentDidMount();
        } else {
          alert(result.error)
        }
      })
      .catch(err => alert(err.message))
    } else {
      alert('Please enter a valid table code')
    }
  }


  addTable = () => {
    if (!this.state.newTableInput || !this.state.newTableBuilding) {
      return alert('Please enter a table code and building location')
    }
    fetch('/admin/table/new', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        table: this.state.newTableInput,
        building: this.state.newTableBuilding,
      })
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        this.setState({ newTableInput: '', newTableBuilding: '' }, this.componentDidMount)
      } else {
        alert(result.error)
      }
    })
    .catch(err => console.log(err.message))
  }

  render() {
    let { tables, sortBy, sortReverse } = this.state
    if (sortBy) {
      tables = _.sortBy(tables, table => {
        if (sortBy === 'Table') {
          return table.table
        } else if (sortBy === 'Building') {
          return table.building
        }
      })
    }
    if (sortReverse) {
      tables = tables.reverse()
    }
    return (
      <div className="tab" >
        <Segment style={ styles.container } >

          <Segment inverted attached="top" style={ styles.header } >
            <div style={ styles.column2 }
                 onClick={ () => this.sort('Building') } >
              Building { sortBy === 'Building' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
            </div>
            <div style={ styles.column2 }
                 onClick={ () => this.sort('Table') } >
              Table { sortBy === 'Table' ? sortReverse ? <span>&darr;</span> : <span>&uarr;</span> : null }
             </div>
            <div style={ styles.column1 } >Actions</div>
          </Segment>

          <List selection style={ styles.list } >
          { tables.map(table => {
            return <List.Item key={table._id} style={ styles.listItem } >
                     <Segment attached={true} style={ styles.wordContainer } >
                       <div style={ styles.column2 } >{ table.building }</div>
                       <div style={ styles.table }>{ table.table }</div>
                       <div style={ styles.column1 } >
                         <Button color='blue'
                                 size="tiny"
                                 compact={true}
                                 onClick={ () => this.editTable(table._id, table.table, table.building) } >Edit</Button>
                         <Button color='red'
                                 size="tiny"
                                 compact={true}
                                 onClick={ () => this.deleteTable(table._id, table.table, table.building) } >Delete</Button>
                       </div>
                     </Segment>
                   </List.Item>
          }) }
          </List>
          <Segment inverted attached="bottom" style={ styles.bottom }>
            <div style={ styles.column2 } >
              <Form size="small" style={{ width: '175px' }}>
                <Form.Field>
                  <input placeholder="Enter building location..."
                         value={ this.state.newTableBuilding }
                         style={styles.input}
                         onChange={ e => this.setState({ newTableBuilding: e.target.value }) } />
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.column2 } >
              <Form size="small" style={{ width: '175px' }}>
                <Form.Field>
                  <input placeholder="Enter new table code..."
                         value={ this.state.newTableInput }
                         style={styles.input}
                         onChange={ e => this.setState({ newTableInput: e.target.value }) } />
                </Form.Field>
              </Form>
            </div>
            <div style={ styles.column1 } >
              <Button compact={true}
                      color='blue'
                      size="tiny"
                      onClick={ this.addTable } >Add</Button>
            </div>

          </Segment>
        </Segment>
      </div>
    )
  }
}

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    marginTop: 0,
    flexDirection: 'column',
    padding: 0,
  },
  header: {
    color: '#00b5ad',
    fontSize: '20px',
    fontWeight: 'bold',
    width: '100%',
    minHeight: '40px',
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0 10%'
  },
  list: {
    margin: 0,
    overflow: 'scroll',
    height: '100%'
  },
  column1: {
    flex: 1,
    textAlign: 'left'
  },
  column2: {
    flex: 2,
    textAlign: 'left'
  },
  bottom: {
    width: '100%',
    minHeight: '40px',
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0 10%'
  },
  listItem: {
    padding: 0,
    margin: 0
  },
  wordContainer: {
    margin: 0,
    width: '100%',
    minHeight: '40px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: '12px',
    padding: '0 10%'
  },
  table: {
    flex: 2,
    textAlign: 'left',
    fontWeight: 'bold',
    color: 'blue'
  },
  input: {
    paddingTop: 0,
    paddingBottom: 0,
    height: '20px'
  }
}