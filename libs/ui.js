class UIElement {
    constructor(dom) {
        this.dom = dom;
    }
    add(obj) {
        this.dom.appendChild(obj);
    }
    setInnerHTML( value ) {

		this.dom.innerHTML = value;

	}
    setId( id ) {

		this.dom.id = id;

		return this;

	}
    setClass( name ) {

		this.dom.className = name;

		return this;

	}
}
class UIDiv extends UIElement {

	constructor() {

		super( document.createElement( 'div' ) );

	}

}
export {UIDiv}