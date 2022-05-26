import React, { Component, useState, createRef, useEffect } from "react";
import "./Content.css";
import Bubble from "./Bubble";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";
import { getAuth } from "firebase/auth";
import { sendingChat, endChatt } from "../../services/api.service";
import "../../styles/chat.css";


export default class Content extends Component {
  textEndRef = createRef(null);
  //const [chatState, chatState] = useState(false);

  constructor(props) {
    super(props);
    this.state = {
      text: "",
      estado: "",
      messages: [],
      finished:  false,
      iniciadoPor: ""
    };
    this.auth = getAuth(); // Get current firebase auth
  }

  scrollToBottom = () => {
    this.textEndRef.current.scrollIntoView(false);
  };

  
  endChat = () => {
    endChatt(this.props.chatId, 'inactivo');
    console.log('holaaaaaaaaaa');
  };


  componentDidUpdate() {
    this.scrollToBottom();
  }

  attachRealTimeMessageListening() {
    if (this.props.chatId) {
      console.log(this.props.chatId);
      onSnapshot(doc(firestore, "chats", this.props.chatId), (doc) => {
        console.log(doc.data());
        const messages = doc.data().mensajes;
        const estado = doc.data().estado;
        const iniciadoPor = doc.data().iniciadoPor;
        this.setState({ messages, estado, iniciadoPor }, function () {
          this.scrollToBottom();
        });
      });
    }
  }

  componentDidMount() {
    console.log('estado ', this.state.finished);
    this.sendWelcomeMessage();
    this.attachRealTimeMessageListening();
    document.addEventListener("keydown", (e) => {
      if (e.keyCode === 13) {
        this.enviarMensaje();
      }
    });
  }

  onStateChange = (e) => {
    this.setState({ text: e.target.value });
  };

  enviarMensaje = () => {
    sendingChat(this.auth.currentUser.uid, this.props.chatId, this.state.text);
    document.getElementsByClassName("input-message")[0].value = "";
    this.setState({ text: "" });
  };

  // on first load send welcome message from the system
  sendWelcomeMessage() {
    sendingChat("system", this.props.chatId, "Bienvenido a nuestro chat");
  }

  render() {
    return (
      <div className="ChatContent">
        <div className="notifiersDiv">
          <div className="text-[#FFF] text-sm bg-bg2 rounded-3xl w-16 text-center shadow-2xl border-2 border-bg3">
            {this.state.estado}
          </div>
          <button className="endChatBtn" onClick={this.endChat}>
              <p>Terminar chat</p>
          </button>
        </div>
        <div className="content-body">
          <div className="chat-bubbles">
            {this.state.messages.map((message, index) => {
              return (
                <Bubble
                  animationDelay={index + 2}
                  key={message.date}
                  user={
                    this.auth.currentUser.uid === message.enviadoPor
                      ? "me"
                      : "other"
                  }
                  text={message.mensaje}
                  image={""}
                />
              );
            })}
            <div ref={this.textEndRef} />
          </div>
        </div>
        <div className="content-footer">
          {this.props.chatId ? (
            <>
              <div className="sendNewMessage">
                <input
                  className="input-message"
                  type="text"
                  placeholder="Escriba un mensaje"
                  onChange={this.onStateChange}
                  value={this.state.text}
                />
                <button
                  className={this.state.finished ? "btnSendTextN" : "btnSendTextA"}
                  id="sendTextBtn"
                  onClick={() => {
                    this.enviarMensaje();
                  }}
                >
                  <i className="send">Enviar</i>
                </button>
              </div>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }
}
