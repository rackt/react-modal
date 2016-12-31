/* eslint-env mocha */
import { renderModal, unmountModal } from './helper';
import TestUtils from 'react-addons-test-utils';
import React from 'react';
import ReactDOM from 'react-dom';
import Modal from '../lib/components/Modal';
import ariaAppHider from '../lib/helpers/ariaAppHider';
const Simulate = TestUtils.Simulate;
import sinon from 'sinon';
import expect from 'expect';

describe('Modal', function () {

  it('scopes tab navigation to the modal');
  it('focuses the last focused element when tabbing in from browser chrome');


  it('can be open initially', function() {
    var component = renderModal({isOpen: true}, 'hello');
    expect(component.portal.refs.content.innerHTML.trim()).toEqual('hello');
    unmountModal();
  });

  it('can be closed initially', function() {
    var component = renderModal({}, 'hello');
    expect(ReactDOM.findDOMNode(component.portal).innerHTML.trim()).toEqual('');
    unmountModal();
  });

  it('accepts appElement as a prop', function() {
    var el = document.createElement('div');
    var node = document.createElement('div');
    ReactDOM.render(
      <Modal
        isOpen={true}
        appElement={el}
      />
    , node);
    expect(el.getAttribute('aria-hidden')).toEqual('true');
    ReactDOM.unmountComponentAtNode(node);
  });

  it('renders into the body, not in context', function() {
    var node = document.createElement('div');
    var App = React.createClass({
      render() {
        return (
          <div>
            <Modal isOpen={true}>
              hello
            </Modal>
          </div>
        );
      }
    });
    Modal.setAppElement(node);
    ReactDOM.render(<App />, node);
    var modalParent = document.body.querySelector('.ReactModalPortal').parentNode;
    expect(modalParent).toEqual(document.body);
    ReactDOM.unmountComponentAtNode(node);
  });

  it('renders children', function() {
    var child = 'I am a child of Modal, and he has sent me here...';
    var component = renderModal({isOpen: true}, child);
    expect(component.portal.refs.content.innerHTML).toEqual(child);
    unmountModal();
  });

  it('renders the modal content with a dialog aria role when provided ', function () {
    var child = 'I am a child of Modal, and he has sent me here...';
    var component = renderModal({isOpen: true, role: 'dialog'}, child);
    expect(component.portal.refs.content.getAttribute('role')).toEqual('dialog');
    unmountModal();
  });

  it('renders the modal with a aria-label based on the contentLabel prop', function () {
    var child = 'I am a child of Modal, and he has sent me here...';
    var component = renderModal({isOpen: true, contentLabel: 'Special Modal'}, child);
    expect(component.portal.refs.content.getAttribute('aria-label')).toEqual('Special Modal');
    unmountModal();
  });

  it('has default props', function() {
    var node = document.createElement('div');
    Modal.setAppElement(document.createElement('div'));
    var component = ReactDOM.render(<Modal />, node);
    var props = component.props;
    expect(props.isOpen).toBe(false);
    expect(props.ariaHideApp).toBe(true);
    expect(props.closeTimeoutMS).toBe(0);
    expect(props.shouldCloseOnOverlayClick).toBe(true);
    ReactDOM.unmountComponentAtNode(node);
    ariaAppHider.resetForTesting();
    Modal.setAppElement(document.body);  // restore default
  });

  it('removes the portal node', function() {
    var component = renderModal({isOpen: true}, 'hello');
    expect(component.portal.refs.content.innerHTML.trim()).toEqual('hello');
    unmountModal();
    expect(!document.querySelector('.ReactModalPortal')).toExist();
  });

  it('focuses the modal content', function() {
    renderModal({isOpen: true}, null, function () {
      expect(document.activeElement).toEqual(this.portal.refs.content);
      unmountModal();
    });
  });

  it('does not focus the modal content when a descendent is already focused', function() {
    var input = (
      <input
        className="focus_input"
        ref={(el) => { el && el.focus(); }}
      />
    );

    renderModal({isOpen: true}, input, function () {
      expect(document.activeElement).toEqual(document.querySelector('.focus_input'));
      unmountModal();
    });
  });

  it('handles case when child has no tabbable elements', function() {
    var component = renderModal({isOpen: true}, 'hello');
    expect(function() {
      Simulate.keyDown(component.portal.refs.content, {key: "Tab", keyCode: 9, which: 9})
    }).toNotThrow;
    unmountModal();
  });

  it('keeps focus inside the modal when child has no tabbable elements', function() {
    var tabPrevented = false;
    var modal = renderModal({isOpen: true}, 'hello');
    expect(document.activeElement).toEqual(modal.portal.refs.content);
    Simulate.keyDown(modal.portal.refs.content, {
        key: "Tab",
        keyCode: 9,
        which: 9,
        preventDefault: function() { tabPrevented = true; }
    });
    expect(tabPrevented).toEqual(true);
  });

  it('supports portalClassName', function () {
    var modal = renderModal({isOpen: true, portalClassName: 'myPortalClass'});
    expect(modal.node.className).toEqual('myPortalClass');
    unmountModal();
  });

  it('supports custom className', function() {
    var modal = renderModal({isOpen: true, className: 'myClass'});
    expect(modal.portal.refs.content.className.indexOf('myClass')).toNotEqual(-1);
    unmountModal();
  });

  it('supports overlayClassName', function () {
    var modal = renderModal({isOpen: true, overlayClassName: 'myOverlayClass'});
    expect(modal.portal.refs.overlay.className.indexOf('myOverlayClass')).toNotEqual(-1);
    unmountModal();
  });

  it('overrides the default styles when a custom classname is used', function () {
    var modal = renderModal({isOpen: true, className: 'myClass'});
    expect(modal.portal.refs.content.style.top).toEqual('');
    unmountModal();
  });

  it('overrides the default styles when a custom overlayClassName is used', function () {
    var modal = renderModal({isOpen: true, overlayClassName: 'myOverlayClass'});
    expect(modal.portal.refs.overlay.style.backgroundColor).toEqual('');
  });

  it('adds --after-open for animations when a custom ClassNames are used', function() {
    var modal = renderModal({isOpen: true, className: 'myClass', overlayClassName: 'myOverlayClass'});
    notEqual(modal.portal.refs.overlay.className.indexOf('myOverlayClass--after-open'), -1);
    notEqual(modal.portal.refs.content.className.indexOf('myClass--after-open'), -1);
    unmountModal();
  });

  it('supports adding style to the modal contents', function () {
    var modal = renderModal({isOpen: true, style: {content: {width: '20px'}}});
    expect(modal.portal.refs.content.style.width).toEqual('20px');
  });

  it('supports overriding style on the modal contents', function() {
    var modal = renderModal({isOpen: true, style: {content: {position: 'static'}}});
    expect(modal.portal.refs.content.style.position).toEqual('static');
  });

  it('supports adding style on the modal overlay', function() {
    var modal = renderModal({isOpen: true, style: {overlay: {width: '75px'}}});
    expect(modal.portal.refs.overlay.style.width).toEqual('75px');
  });

  it('supports overriding style on the modal overlay', function() {
    var modal = renderModal({isOpen: true, style: {overlay: {position: 'static'}}});
    expect(modal.portal.refs.overlay.style.position).toEqual('static');
  });

  it('supports overriding the default styles', function() {
    var previousStyle = Modal.defaultStyles.content.position
    //Just in case the default style is already relative, check that we can change it
    var newStyle = previousStyle === 'relative' ? 'static': 'relative'
    Modal.defaultStyles.content.position = newStyle
    var modal = renderModal({isOpen: true});
    expect(modal.portal.refs.content.style.position).toEqual(newStyle);
    Modal.defaultStyles.content.position = previousStyle
  });

  it('adds class to body when open', function() {
    renderModal({isOpen: false});
    expect(document.body.className.indexOf('ReactModal__Body--open') !== -1).toEqual(false);

    renderModal({isOpen: true});
    expect(document.body.className.indexOf('ReactModal__Body--open')  !== -1).toEqual(true);

    renderModal({isOpen: false});
    expect(document.body.className.indexOf('ReactModal__Body--open')  !== -1).toEqual(false);
    unmountModal();
  });

  it('removes class from body when unmounted without closing', function() {
    renderModal({isOpen: true});
    expect(document.body.className.indexOf('ReactModal__Body--open')  !== -1).toEqual(true);
    unmountModal();
    expect(document.body.className.indexOf('ReactModal__Body--open')  !== -1).toEqual(false);
  });

  it('removes aria-hidden from appElement when unmounted without closing', function() {
    var el = document.createElement('div');
    var node = document.createElement('div');
    ReactDOM.render(React.createElement(Modal, {
      isOpen: true,
      appElement: el
    }), node);
    expect(el.getAttribute('aria-hidden')).toEqual('true');
    ReactDOM.unmountComponentAtNode(node);
    expect(el.getAttribute('aria-hidden')).toEqual(null);
  });

  it('adds --after-open for animations', function() {
    renderModal({isOpen: true});
    var overlay = document.querySelector('.ReactModal__Overlay');
    var content = document.querySelector('.ReactModal__Content');
    expect(overlay.className.match(/ReactModal__Overlay--after-open/)).toExist();
    expect(content.className.match(/ReactModal__Content--after-open/)).toExist();
    unmountModal();
  });

  it('should trigger the onAfterOpen callback', function() {
    var afterOpenCallback = sinon.spy();
    renderModal({
      isOpen: true,
      onAfterOpen: function() {
        afterOpenCallback();
      }
    });
    expect(afterOpenCallback.called).toBeTruthy();
    unmountModal();
  });

  it('check the state of the modal after close with time out and reopen it', function() {
    var modal = renderModal({
      isOpen: true,
      closeTimeoutMS: 2000,
      onRequestClose: function() {}
    });
    modal.portal.closeWithTimeout();
    modal.portal.open();
    modal.portal.closeWithoutTimeout();
    expect(!modal.portal.state.isOpen).toBeTruthy();
    unmountModal();
  });

  describe('should close on overlay click', function() {
    afterEach('Unmount modal', function() {
      unmountModal();
    });

    describe('verify props', function() {
      it('verify default prop of shouldCloseOnOverlayClick', function () {
        var modal = renderModal({isOpen: true});
        expect(modal.props.shouldCloseOnOverlayClick).toEqual(true);
      });

      it('verify prop of shouldCloseOnOverlayClick', function () {
        var modal = renderModal({isOpen: true, shouldCloseOnOverlayClick: false});
        expect(modal.props.shouldCloseOnOverlayClick).toEqual(false);
      });
    });

    describe('verify clicks', function() {
      it('verify overlay click when shouldCloseOnOverlayClick sets to false', function () {
        var requestCloseCallback = sinon.spy();
        var modal = renderModal({
          isOpen: true,
          shouldCloseOnOverlayClick: false
        });
        expect(modal.props.isOpen).toEqual(true);
        var overlay = TestUtils.scryRenderedDOMComponentsWithClass(modal.portal, 'ReactModal__Overlay');
        expect(overlay.length).toEqual(1);
        Simulate.mouseDown(overlay[0]); // click the overlay
        Simulate.mouseUp(overlay[0]);
        expect(!requestCloseCallback.called).toBeTruthy();
      });

      it('verify overlay click when shouldCloseOnOverlayClick sets to true', function() {
        var requestCloseCallback = sinon.spy();
        var modal = renderModal({
          isOpen: true,
          shouldCloseOnOverlayClick: true,
          onRequestClose: function() {
            requestCloseCallback();
          }
        });
        expect(modal.props.isOpen).toEqual(true);
        var overlay = TestUtils.scryRenderedDOMComponentsWithClass(modal.portal, 'ReactModal__Overlay');
        expect(overlay.length).toEqual(1);
        Simulate.mouseDown(overlay[0]); // click the overlay
        Simulate.mouseUp(overlay[0]);
        expect(requestCloseCallback.called).toBeTruthy();
      });

      it('verify overlay mouse down and content mouse up when shouldCloseOnOverlayClick sets to true', function() {
        var requestCloseCallback = sinon.spy();
        var modal = renderModal({
                                  isOpen: true,
                                  shouldCloseOnOverlayClick: true,
                                  onRequestClose: function() {
                                    requestCloseCallback();
                                  }
                                });
        expect(modal.props.isOpen).toEqual(true);
        var overlay = TestUtils.scryRenderedDOMComponentsWithClass(modal.portal, 'ReactModal__Overlay');
        var content = TestUtils.scryRenderedDOMComponentsWithClass(modal.portal, 'ReactModal__Content');
        expect(overlay.length).toEqual(1);
        expect(content.length).toEqual(1);
        Simulate.mouseDown(overlay[0]); // click the overlay
        Simulate.mouseUp(content[0]);
        expect(!requestCloseCallback.called).toBeTruthy();
      });

      it('verify content mouse down and overlay mouse up when shouldCloseOnOverlayClick sets to true', function() {
        var requestCloseCallback = sinon.spy();
        var modal = renderModal({
                                  isOpen: true,
                                  shouldCloseOnOverlayClick: true,
                                  onRequestClose: function() {
                                    requestCloseCallback();
                                  }
                                });
        expect(modal.props.isOpen).toEqual(true);
        var overlay = TestUtils.scryRenderedDOMComponentsWithClass(modal.portal, 'ReactModal__Overlay');
        var content = TestUtils.scryRenderedDOMComponentsWithClass(modal.portal, 'ReactModal__Content');
        expect(content.length).toEqual(1);
        expect(overlay.length).toEqual(1);
        Simulate.mouseDown(content[0]); // click the overlay
        Simulate.mouseUp(overlay[0]);
        expect(!requestCloseCallback.called).toBeTruthy();
      });

      it('should not stop event propagation', function() {
        var hasPropagated = false
        var modal = renderModal({
          isOpen: true,
          shouldCloseOnOverlayClick: true
        });
        var overlay = TestUtils.scryRenderedDOMComponentsWithClass(modal.portal, 'ReactModal__Overlay');
        window.addEventListener('click', function () { hasPropagated = true })
        overlay[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(hasPropagated).toBeTruthy();
      });
    });

    it('verify event passing on overlay click', function() {
      var requestCloseCallback = sinon.spy();
      var modal = renderModal({
        isOpen: true,
        shouldCloseOnOverlayClick: true,
        onRequestClose: requestCloseCallback
      });
      expect(modal.props.isOpen).toEqual(true);
      var overlay = TestUtils.scryRenderedDOMComponentsWithClass(modal.portal, 'ReactModal__Overlay');
      expect(overlay.length).toEqual(1);
      Simulate.mouseDown(overlay[0]); // click the overlay
      Simulate.mouseUp(overlay[0]);
      expect(requestCloseCallback.called).toBeTruthy();
      // Check if event is passed to onRequestClose callback.
      var event = requestCloseCallback.getCall(0).args[0];
      expect(event).toBeTruthy();
      expect(event.constructor).toBeTruthy();
      expect(event.constructor.name).toEqual('SyntheticEvent');
    });
  });

  it('should close on Esc key event', function() {
    var requestCloseCallback = sinon.spy();
    var modal = renderModal({
      isOpen: true,
      shouldCloseOnOverlayClick: true,
      onRequestClose: requestCloseCallback
    });
    expect(modal.props.isOpen).toEqual(true);
    expect(function() {
      Simulate.keyDown(modal.portal.refs.content, {key: "Esc", keyCode: 27, which: 27})
    }).toNotThrow();
    expect(requestCloseCallback.called).toBeTruthy();
    // Check if event is passed to onRequestClose callback.
    var event = requestCloseCallback.getCall(0).args[0];
    expect(event).toBeTruthy();
    expect(event.constructor).toBeTruthy();
    expect(event.constructor.name).toEqual('SyntheticEvent');
  });

  //it('adds --before-close for animations', function() {
    //var node = document.createElement('div');

    //var component = ReactDOM.render(React.createElement(Modal, {
      //isOpen: true,
      //ariaHideApp: false,
      //closeTimeoutMS: 50,
    //}), node);

    //component = ReactDOM.render(React.createElement(Modal, {
      //isOpen: false,
      //ariaHideApp: false,
      //closeTimeoutMS: 50,
    //}), node);

    // It can't find these nodes, I didn't spend much time on this
    //var overlay = document.querySelector('.ReactModal__Overlay');
    //var content = document.querySelector('.ReactModal__Content');
    //ok(overlay.className.match(/ReactModal__Overlay--before-close/));
    //ok(content.className.match(/ReactModal__Content--before-close/));
    //unmountModal();
  //});
});
