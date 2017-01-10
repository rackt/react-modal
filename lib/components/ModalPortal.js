import React, { Component, PropTypes } from 'react';
import Assign from 'lodash.assign';
import scopeTab from '../helpers/scopeTab';
import {
  returnFocus,
  setupScopedFocus,
  teardownScopedFocus,
  markForFocusLater
} from '../helpers/focusManager';


// so that our CSS is statically analyzable
const CLASS_NAMES = {
  overlay: {
    base: 'ReactModal__Overlay',
    afterOpen: 'ReactModal__Overlay--after-open',
    beforeClose: 'ReactModal__Overlay--before-close'
  },
  content: {
    base: 'ReactModal__Content',
    afterOpen: 'ReactModal__Content--after-open',
    beforeClose: 'ReactModal__Content--before-close'
  }
};

export default class ModalPortal extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onAfterOpen: PropTypes.func,
    closeTimeoutMS: PropTypes.number,
    shouldCloseOnOverlayClick: PropTypes.bool,
    onRequestClose: PropTypes.func,
    className: PropTypes.string,
    overlayClassName: PropTypes.string,
    defaultStyles: PropTypes.shape({
      content: PropTypes.object,
      overlay: PropTypes.object
    }),
    style: PropTypes.shape({
      content: PropTypes.object,
      overlay: PropTypes.object
    }),
    role: PropTypes.string,
    children: PropTypes.node,
    contentLabel: PropTypes.string
  };

  static defaultProps = {
    style: {
      overlay: {},
      content: {}
    }
  };

  static afterClose () {
    returnFocus();
    teardownScopedFocus();
  }

  constructor () {
    super();
    this.state = {
      afterOpen: false,
      beforeClose: false
    };
    this.shouldClose = null;
  }

  componentDidMount () {
    // Focus needs to be set when mounting and already open
    if (this.props.isOpen) {
      this.setFocusAfterRender(true);
      this.open();
    }
  }

  componentWillReceiveProps (newProps) {
    // Focus only needs to be set once when the modal is being opened
    if (!this.props.isOpen && newProps.isOpen) {
      this.setFocusAfterRender(true);
      this.open();
    } else if (this.props.isOpen && !newProps.isOpen) {
      this.close();
    }
  }

  componentDidUpdate () {
    if (this.focusAfterRender) {
      this.focusContent();
      this.setFocusAfterRender(false);
    }
  }

  componentWillUnmount () {
    clearTimeout(this.closeTimer);
  }

  setFocusAfterRender (focus) {
    this.focusAfterRender = focus;
  }

  open () {
    if (this.state.afterOpen && this.state.beforeClose) {
      clearTimeout(this.closeTimer);
      this.setState({ beforeClose: false });
    } else {
      setupScopedFocus(this.node);
      markForFocusLater();
      this.setState({ isOpen: true }, () => {
        this.setState({ afterOpen: true });

        if (this.props.isOpen && this.props.onAfterOpen) {
          this.props.onAfterOpen();
        }
      });
    }
  }

  close () {
    if (this.props.closeTimeoutMS > 0) {
      this.closeWithTimeout();
    } else {
      this.closeWithoutTimeout();
    }
  }

  focusContent () {
    // Don't steal focus from inner elements
    if (!this.contentHasFocus()) {
      this.content.focus();
    }
  }

  closeWithTimeout () {
    this.setState({ beforeClose: true }, () => {
      this.closeTimer = setTimeout(this.closeWithoutTimeout, this.props.closeTimeoutMS);
    });
  }

  closeWithoutTimeout = () => {
    this.setState({
      beforeClose: false,
      isOpen: false,
      afterOpen: false,
    }, this.afterClose);
  }

  handleKeyDown = (event) => {
    if (event.keyCode === 9 /* tab*/) scopeTab(this.content, event);
    if (event.keyCode === 27 /* esc*/) {
      event.preventDefault();
      this.requestClose(event);
    }
  }

  handleOverlayClick(event) {
    if (this.props.shouldCloseOnOverlayClick && this.ownerHandlesClose()) {
      this.requestClose(event);
    }
  }

  handleContentClick(event) {
    event.stopPropagation();
  }

  requestClose (event) {
    if (this.ownerHandlesClose()) {
      this.props.onRequestClose(event);
    }
  }

  ownerHandlesClose () {
    return this.props.onRequestClose;
  }

  shouldBeClosed () {
    return !this.props.isOpen && !this.state.beforeClose;
  }

  contentHasFocus () {
    return document.activeElement === this.content || this.content.contains(document.activeElement);
  }

  buildClassName (which, additional) {
    let className = CLASS_NAMES[which].base;
    if (this.state.afterOpen) { className += ` ${CLASS_NAMES[which].afterOpen}`; }
    if (this.state.beforeClose) {
      className += ` ${CLASS_NAMES[which].beforeClose}`;
    }
    return additional ? `${className} ${additional}` : className;
  }

  render () {
    const contentStyles = (this.props.className) ? {} : this.props.defaultStyles.content;
    const overlayStyles = (this.props.overlayClassName) ? {} : this.props.defaultStyles.overlay;

    // Disabling this rule is okay, since we know what is going on here, that being said
    // longterm we should probably do this better.
    /* eslint-disable jsx-a11y/no-static-element-interactions */
    return this.shouldBeClosed() ? <div /> : (
      <div
        ref={(c) => { this.overlay = c; }}
        className={this.buildClassName('overlay', this.props.overlayClassName)}
        style={Assign({}, overlayStyles, this.props.style.overlay || {})}
        onClick={this.handleOverlayClick}
      >
        <div
          ref={(c) => { this.content = c; }}
          style={Assign({}, contentStyles, this.props.style.content || {})}
          className={this.buildClassName('content', this.props.className)}
          tabIndex={-1}
          onKeyDown={this.handleKeyDown}
          onClick={this.handleContentClick}
          role={this.props.role}
          aria-label={this.props.contentLabel}
        >
          {this.props.children}
        </div>
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}
