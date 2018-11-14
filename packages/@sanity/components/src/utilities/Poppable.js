import React from 'react'
import PropTypes from 'prop-types'
import {Manager, Reference, Popper} from 'react-popper'
import styles from './styles/Poppable.css'
import Stacked from './Stacked'
import Escapable from './Escapable'
import CaptureOutsideClicks from './CaptureOutsideClicks'

import {Portal} from './Portal'

export default class Poppable extends React.Component {
  static propTypes = {
    onEscape: PropTypes.func,
    onClickOutside: PropTypes.func,
    target: PropTypes.node,
    children: PropTypes.node,
    referenceClassName: PropTypes.string,
    placement: PropTypes.string,
    modifiers: PropTypes.shape({
      preventOverflow: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      customStyle: PropTypes.object,
      flip: PropTypes.object,
      offset: PropTypes.object
    })
  }

  popperNode = undefined

  static defaultProps = {
    placement: 'bottom-start',
    modifiers: {preventOverflow: 'viewport'}
  }

  setPopperNode = node => {
    this.popperNode = node
  }

  handleClickOutside = ev => {
    if (!this.popperNode || !ev.target) {
      return
    }
    if (!this.popperNode.contains(ev.target)) {
      this.props.onClickOutside(ev)
    }
  }
  render() {
    const {onEscape, onClickOutside, target, children, referenceClassName} = this.props

    return (
      <Manager>
        <Reference>
          {({ref}) => (
            <div ref={ref} className={referenceClassName}>
              {target}
            </div>
          )}
        </Reference>
        {children && (
          <Portal>
            <Stacked>
              {isActive => (
                <div className={styles.portal}>
                  <Popper innerRef={this.setPopperNode} modifiers={this.props.modifiers} placement={this.props.placement}>
                    {({ref, placement, style}) => (
                      <div ref={ref} style={style} data-placement={placement}>
                        <Escapable onEscape={isActive ? onEscape : undefined} />
                        {onClickOutside ? (
                          <CaptureOutsideClicks
                            onClickOutside={isActive ? this.handleClickOutside : undefined}
                          >
                            {children}
                          </CaptureOutsideClicks>
                        ) : (
                          children
                        )}
                      </div>
                    )}
                  </Popper>
                </div>
              )}
            </Stacked>
          </Portal>
        )}
      </Manager>
    )
  }
}
