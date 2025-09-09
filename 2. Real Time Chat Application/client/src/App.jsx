import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Picker from 'emoji-picker-react';
import './App.css';

const socket = io.connect('http://localhost:3001');

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const onEmojiClick = (emojiObject) => {
    setMessage((prevInput) => prevInput + emojiObject.emoji);
    setShowPicker(false);
  };

  const joinRoom = () => {
    if (username !== '' && room !== '') {
      socket.emit('join_room', { username, room });
      setLoggedIn(true);
    }
  };

  const sendMessage = () => {
    if (message.trim() !== '') {
      const messageData = {
        room,
        author: username,
        message,
        time: new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      socket.emit('send_message', messageData);
      setMessage('');
    }
  };

  const handleTyping = () => {
    socket.emit('typing', { username, room });
  };

  useEffect(() => {
    socket.on('chat_history', (data) => {
      setMessages(data);
    });

    socket.on('receive_message', (data) => {
      setMessages((list) => [...list, data]);
    });

    socket.on('user_list', (data) => {
      setUsers(data);
    });

    const typingTimeout = setTimeout(() => {
        setTyping(null);
    }, 3000);

    socket.on('typing', (data) => {
      setTyping(`${data.username} is typing...`);
      clearTimeout(typingTimeout);
    });

    return () => {
        socket.off('chat_history');
        socket.off('receive_message');
        socket.off('user_list');
        socket.off('typing');
        clearTimeout(typingTimeout);
    }
  }, []);

  return (
    <div className="App">
      {!loggedIn ? (
        <div className="login-container">
          <h3>Join a Chat Room</h3>
          <input
            type="text"
            placeholder="Username..."
            onChange={(event) => setUsername(event.target.value)}
            onKeyPress={(event) => event.key === 'Enter' && joinRoom()}
          />
          <input
            type="text"
            placeholder="Room..."
            onChange={(event) => setRoom(event.target.value)}
            onKeyPress={(event) => event.key === 'Enter' && joinRoom()}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
      ) : (
        <div className="chat-container">
          <div className="user-list">
            <h4>Online Users</h4>
            <ul>
              {users.map((user) => (
                <li key={user.id}>{user.username}</li>
              ))}
            </ul>
          </div>
          <div className="chat-window">
            <div className="chat-header">
              <p>Live Chat - Room: {room}</p>
            </div>
            <div className="chat-body">
              {messages.map((messageContent, index) => (
                <div
                  key={index}
                  className="message"
                  id={username === messageContent.author ? 'you' : 'other'}
                >
                  <div>
                    <div className="message-content">
                        <p>{messageContent.message}</p>
                    </div>
                    <div className="message-meta">
                      <p id="time">{messageContent.time}</p>
                      <p id="author">{messageContent.author}</p>
                    </div>
                  </div>
                </div>
              ))}
               <div className="typing-indicator">
                <p>{typing}</p>
              </div>
            </div>
            <div className="chat-footer">
                <div className="picker-container">
                    {showPicker && <Picker onEmojiClick={onEmojiClick} />}
                </div>
                <button className="emoji-button" onClick={() => setShowPicker((val) => !val)}>😊</button>
                <input
                    type="text"
                    value={message}
                    placeholder="Hey..."
                    onChange={(event) => {
                    setMessage(event.target.value);
                    handleTyping();
                    }}
                    onKeyPress={(event) => {
                    event.key === 'Enter' && sendMessage();
                    }}
                />
                <button onClick={sendMessage}>&#9658;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;