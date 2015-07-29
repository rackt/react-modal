# react-modal

Accessible modal dialog component for React.JS

## Usage

```xml
<Modal
  isOpen={bool}
  onRequestClose={fn}
  closeTimeoutMS={n}
>
  <h1>Modal Content</h1>
  <p>Etc.</p>
</Modal>
```
## Styles
Styles are passed as an object with 2 keys, 'overlay' and 'body' like so
```js
{
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    'backgroundColor' : 'rgba(255, 255, 255, 0.75)'
  },
  body : {
    position                   : 'absolute',
    top                        : '40px',
    left                       : '40px',
    right                      : '40px',
    bottom                     : '40px',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    'WebkitOoverflowScrolling' : 'touch',
    'borderRadius'             : '4px',
    outline                    : 'none',
    padding                    : '20px'

  }
}
```

Styles passed to the modal are merged in with the above defaults and applied to their respective elements.
At this time, media queries will need to be handled by the consumer.


## Examples
Inside an app:

```js
var React = require('react');
var Modal = require('react-modal');

var appElement = document.getElementById('your-app-element');

/*
By default the modal is anchored to document.body. All of the following overrides are available.

* element
Modal.setAppElement(appElement);

* query selector - uses the first element found if you pass in a class.
Modal.setAppElement('#your-app-element');

*/

var App = React.createClass({

  getInitialState: function() {
    return { modalIsOpen: false };
  },

  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },

  render: function() {
    return (
      <div>
        <button onClick={this.openModal}>Open Modal</button>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
        >
          <h2>Hello</h2>
          <button onClick={this.closeModal}>close</button>
          <div>I am a modal</div>
          <form>
            <input />
            <button>tab navigation</button>
            <button>stays</button>
            <button>inside</button>
            <button>the modal</button>
          </form>
        </Modal>
      </div>
    );
  }
});

React.render(<App/>, appElement);
```

