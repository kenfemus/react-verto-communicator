import React from 'react';
import VertoBaseComponent from '../../components/vertobasecomponent';
//import Radium from 'radium';
import { connect } from 'react-redux';
//import ReactTooltip from 'react-tooltip';
import VCStatus from '../../components/vcstatus';
import { doSubmitLogin, doSubmitLogOut, doMakeCall, doSendChat, doHangUp, doAnswer, doMuteMic, doHold, doMuteVideo } from './action-creators';
import Splash from '../../components/splash';
import Login from '../../components/login';
import Dialpad from '../../components/dialpad';
import {injectIntl} from 'react-intl';
import CallProgress from '../../components/callprogress';
import IncomingCall from '../../components/incomingcall';
import ChatSession from '../../components/ChatSession';
import Memberlist from '../../components/Memberlist';

class Main extends VertoBaseComponent {
  constructor(props) {
    super(props);

    this.state={};
  }

  componentWillMount() {
  }

  getCompStyle() {
    return this.props.compStyle;
  }

  getDefaultStyle(styleName) {
    const styles = {

        };

    return (styles[styleName]);
  }

  makeCall(number) {
    //console.log('calling ...', number, this.props.app);
    this.props.dispatch(doMakeCall(number, this.props.app));
  }

  render() {
    const { formatMessage } = this.props.intl;

    let loggedInfo;
    let chatSideBar;
    const splashObject = { ...this.props.auth.splash };

    const incomingCall = this.props.callInfo && Object.keys(this.props.callInfo.incomingCalls).map((callId)=>{
      console.log('------- GOT CALL', this.props.callInfo.incomingCalls[callId]);
      return (<IncomingCall key={callId} callData={this.props.callInfo.incomingCalls[callId]} cbHangup={(d)=>{
        console.log('hang up', d);
        this.props.dispatch(doHangUp(d.callID));
      }}
      cbAnswer={(d)=>{
        console.log('Answering: ', d);
        this.props.dispatch(doAnswer(d.callID));
      }}  />);
    })


    switch (this.props.auth.showPage){
      case 'splash':
        switch(this.props.auth.splash.title){
          case 'browser':
            splashObject.title = formatMessage({"id":"BROWSER_COMPATIBILITY", "defaultMessage":"Checking browser compatibility."});
            break;
          case 'media':
            splashObject.title = formatMessage({"id":"CHECK_PERMISSION_MEDIA", "defaultMessage":"Checking media permissions"});
            break;
          case 'resolution':
          default:
            splashObject.title = formatMessage({"id":"CHECK_RESOLUTION", "defaultMessage":"Checking resolution."});
            break;
        }
        break;
      case 'login':
      case 'logout':
        loggedInfo = (
          <div>
            <Login cbClick={(data)=>{
              // fix websocket url
              this.props.dispatch(doSubmitLogin({ ...data, wsURL: data.websocketurl }));
            }} settings={this.props.auth.loginSettings} />
        </div>);
        break;
      case 'resolution_refresh':
        loggedInfo = (<div >Resolution Refresh .... in progress</div>);
        break;
      case 'loggedIn':
        loggedInfo = (
          <div>
            <Dialpad cbCall={this.makeCall.bind(this)} lastNumber={this.props.callInfo.lastNumber} nbrToDial="" />
        </div>);
        break;
      case 'resolution_failed':
        splashObject.title = formatMessage({"id":"CHECK_RESOLUTION", "defaultMessage":"Checking resolution."});
        splashObject.errorObject = {
          header: formatMessage({"id":"ERRORS", "defaultMessage":"Errors"}),
          body: formatMessage({"id":"ERROR_PERMISSION_MEDIA", "defaultMessage":"Error: internal error checking resolution"})
        }
        break;
      case 'bns':
        //console.log('BBBNNNNSSSS', this.props.auth);
        splashObject.title = formatMessage({"id":"BROWSER_COMPATIBILITY", "defaultMessage":"Checking browser compatibility."});
        splashObject.errorObject = {
          header: formatMessage({"id":"ERRORS", "defaultMessage":"Errors"}),
          body: formatMessage({"id":"BROWSER_WITHOUT_WEBRTC", "defaultMessage":"Error: browser doesn't support WebRTC"})
        }
        break;
      case 'noMedia':
        splashObject.title = formatMessage({"id":"CHECK_PERMISSION_MEDIA", "defaultMessage":"Checking media permissions"});
        splashObject.errorObject = {
          header: formatMessage({"id":"ERRORS", "defaultMessage":"Errors"}),
          body: formatMessage({"id":"ERROR_PERMISSION_MEDIA", "defaultMessage":"Error: Media Permission Denied"})
        }
        break;
      case 'call_inprogress':
        //console.log('jjj');
        loggedInfo = (
          <div>
            <CallProgress callData={this.props.callInfo.activeCalls[this.props.callInfo.currentCallId]}
              cbHangup={(callId)=>{
                this.props.dispatch(doHangUp(callId));
              }}
              cbMute ={(callId, mutedDevice='mic' )=>{
                if (mutedDevice === 'mic'){
                  this.props.dispatch(doMuteMic(callId));
                } else {
                  this.props.dispatch(doMuteVideo(callId));
                }
              }}
              cbDTMF={(callId, key)=>{

              }}
              cbHold={(callId)=>{
                this.props.dispatch(doHold(callId));
              }}
            />
          </div>
        );
        // setup chat/memberlist here
        // Extract conference data from currentCall (if it is a conference)
        const confData = this.props.callInfo.activeCalls[this.props.callInfo.currentCallId].conferenceData;
        window.conf = confData;

        // Show chat sidebar only if confData has a value
        //console.log('#### conf data', confData);
        if (confData) {
          chatSideBar = (
            <div className="sidebarWrapper" style={{width: '360px', backgroundColor: "#0dd"}}>
              <ChatSession
                  cbRemove={()=>{}}
                  cbSubmitMessage={(id,msg)=>{this.props.dispatch(doSendChat(msg));}}
                  chatData={confData}
              />
              <Memberlist members={Object.keys(confData.users).map((k)=>confData.users[k])} admin={false}/>
            </div>
          );
        }

        break;
      default:
        break;
    }
    let showSplash;
    if (this.props.auth.splash && this.props.auth.splash.current != this.props.auth.splash.number) {
      const intlTitle = formatMessage({"id": "LOADING", "defaultMessage": "Loading"});
      showSplash = (<Splash step={splashObject} title={intlTitle} />);
    }
    return (
      <div className="chatVideoWrapper" style={{display: 'flex'}}>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
          {incomingCall}
          <video id="webcam" autoplay="autoplay"  style={{display:"none", width:"70%", height:"70%", objectFit:"inherit"}}></video>
          {loggedInfo}
          {showSplash}
        </div>
        {chatSideBar}
      </div>

    );
  }
}

export default connect((state)=>{
  return ({
    auth: state.auth,
    app: state.app,
    callInfo: state.callInfo
  });
})(injectIntl(Main));
