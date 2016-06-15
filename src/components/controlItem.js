import React from 'react';
import VertoBaseComponent from './vertobasecomponent';
import * as icons from './svgIcons';

const propTypes = {
  cbActionClick : React.PropTypes.func,
  description : React.PropTypes.string,
  compStyle : React.PropTypes.object,
  label : React.PropTypes.string,
  type : React.PropTypes.string
};
const defaultProps = {
  compStyle : {svgStyle:{fill: '#6b6c6c', height: '24px', width: '24px'}}
};

class Action extends VertoBaseComponent {
  constructor(props){
      super(props);
  }

  getCompStyle() {
    return this.props.compStyle;
  }

  getDefaultStyle(styleName) {
    const styles = {
      controlStyle: {
        cursor: 'pointer',
        fontSize: '10px',
        display: 'flex',
        flexDirection: 'column'
      },
      svgStyle: {
        height: '20px',
        fill: '#65ac43'
      }
    };

    let styleReturn = styles[styleName];
      if(this.props.style && this.props.style[styleName]) {
        styleReturn = {...styleReturn, ...this.props.style[styleName]};
      }
    return styleReturn;
  }


  render(){
    //variable must begin with capital letter or will NOT render.
    let DynamicIcon;
    if(icons.hasOwnProperty(this.props.type)){
      DynamicIcon = icons[this.props.type];
    }
    // console.log('---->',DynamicIcon);
      if (this.props.cbActionClick) {
        return (
          <span style={this.getStyle("controlStyle")}
              onClick={()=>{this.props.cbActionClick();}}
          >
            <DynamicIcon
                svgStyle={this.getStyle("svgStyle")}
            />
            <span style={this.getStyle("labelStyle")}>
              {this.props.label}
            </span>
          </span>
        );
      } else {
        return(
          <span style={this.getStyle("controlStyle")}>
            <DynamicIcon
                svgStyle={this.getStyle("svgStyle")}
            />
            <span style={this.getStyle("labelStyle")}>
              {this.props.label}
            </span>
          </span>
      );
    }
  }
}


Action.propTypes = propTypes;
Action.defaultProps = defaultProps;

export default Action;
