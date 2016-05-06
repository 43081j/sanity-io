import React from 'react'
import Header from './Header'
import ToolSwitcher from './ToolSwitcher'
import RenderTool from './RenderTool'
import {Router, Route, NotFound, Redirect} from 'router:@sanity/base/router'
import styles from '../styles/DefaultLayout.css'
import tools from 'all:tool:@sanity/base/tool'
import absolutes from 'all:component:@sanity/base/absolutes'

class DefaultLayout extends React.Component {
  render() {
    const activeToolName = this.props.params.tool

    return (
      <div className={styles.defaultLayout}>
        <Header className={styles.header} />
        <div className={styles.content}>
          <ToolSwitcher tools={tools} activeToolName={activeToolName} className={styles.toolSwitcher} />
          <div className={styles.toolContainer}>
            <Router>
              <Redirect path="/" to={`/${tools[0].name}`} />
              <Route path="/:tool/*" component={RenderTool} />
            </Router>
          </div>
        </div>
        {absolutes.map((Abs, i) => <Abs key={i} />)}
      </div>
    )
  }
}

export default DefaultLayout
