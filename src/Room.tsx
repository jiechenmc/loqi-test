import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ref, set, onValue, update } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import { database, auth } from "./App";

const Room = () => {
  const { id } = useParams();
  const [msg, setMsgs] = useState<JSX.Element[]>();
  const [count, setCount] = useState();

  const uniLookUp: { [key: string]: string } = {
    "stonybrook.edu": "Stony Brook University",
    "binghamton.edu": "Binghamton University",
  };

  const currUser = auth.currentUser!;
  const domain: string = currUser.email?.match(/\w+.edu/gm)?.toString()!;
  const university = uniLookUp[domain];
  const [message, setMessage] = useState("");
  const inputEl = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (inputEl.current) {
      setMessage(inputEl.current.value);
    }
  };

  useEffect(() => {
    const messagesRef = ref(database, `${university}/rooms/${id}`);
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        const messages = data["messages"];
        let tst = Object.values(data["messages"]).map((e) => {
          let m = e as Message;
          return (
            <div key={uuidv4()} className="border-2">
              {m.author} said {m.content}
            </div>
          );
        });
        setMsgs(tst);
        setCount(data["totalMessages"]);
      }
    });
  }, []);

  useEffect(() => {
    if (message !== "") {
      console.log("YO");
      const messageID = uuidv4();
      let authorName =
        currUser.displayName !== null ? currUser.displayName : currUser.email;
      const dbPath = `${university}/rooms/${id}/messages/` + messageID;
      set(ref(database, dbPath), {
        content: message,
        author: authorName,
        createdAt: Date.now(),
      }).then(() => {
        update(ref(database, `${university}/rooms/${id}/`), {
          totalMessages: count! + 1,
        });
      });
    }
  }, [message]);

  return (
    <div>
      <div>Room {id}</div>
      <label htmlFor="message">Message: </label>
      <input
        ref={inputEl}
        className="border-2"
        type="text"
        name="message"
      ></input>
      <button onClick={handleSend}>Send</button>
      <div className="py-4">
        Messages:
        <div>{msg}</div>
      </div>
    </div>
  );
};

export default Room;