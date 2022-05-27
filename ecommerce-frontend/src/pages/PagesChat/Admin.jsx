import { getAuth } from "firebase/auth";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import Content from "../../componentes/content/Content";
import { changeState, getAllChats } from "../../services/api.service";

function Admin() {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const fetchAllChats = async () => {
      const waitingChats = await getAllChats("espera");
      const activeChats = await getAllChats("activo");
      const abandonedChats = await getAllChats("abandonado");

      console.log(abandonedChats);

      if (waitingChats.ok && activeChats.ok) {
        setChats([
          ...chats,
          ...waitingChats.chats,
          ...activeChats.chats,
          ...abandonedChats.chats,
        ]);
      }
    };
    fetchAllChats();
  }, []);
  /**
   * Activate a chat
   */
  const activateChat = async (id, state) => {
    console.log(state);
    if (auth.currentUser && state !== "abandonado") {
      await changeState(id, "activo", auth.currentUser.email);
    }
  };
  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-md-3">
          <h1>Chats Disponibles</h1>
          <ul>
            {chats.map((chat) => {
              return (
                <li key={chat.id} className="chat-option">
                  <p>{chat.iniciadoPor}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setCurrentChat(chat.id);
                      activateChat(chat.id, chat.estado);
                    }}
                  >
                    Atender
                  </button>
                  <div className="text-[#FFF] text-sm bg-bg2 rounded-3xl w-75 text-center shadow-2xl border-2 border-bg3">
                    {chat.estado}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        {currentChat ? (
          <div className="col-md-8 p-5 bg-gradient-to-br from-primary2 to-primary1 max-h-[40rem]">
            <Content chatId={currentChat}></Content>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default Admin;
