import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./App.css";

import { db } from "./firebase";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

const activities = [
  { name: "Gym", points: 10 },
  { name: "Caminata", points: 6 },
  { name: "Bici", points: 8 },
  { name: "Actividad extra", points: 10 },
  { name: "Movilidad", points: 4 },
];

const rewards = {
  shared: [
    { name: "Hamburguesa", cost: 120 },
    { name: "Helado", cost: 80 },
  ],
  individual: [
    { name: "Elegir peli", cost: 40 },
    { name: "Día libre", cost: 60 },
  ],
};

export default function App() {
  const [users, setUsers] = useState(null);
  const [history, setHistory] = useState([]);
  const [lastAction, setLastAction] = useState(null);

  const docRef = doc(db, "game", "points");

  // 🟡 Inicializar si no existe
  useEffect(() => {
    const init = async () => {
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        await setDoc(docRef, {
          users: [
            { name: "Sofi", points: 0 },
            { name: "Fede", points: 0 },
          ],
          history: [],
        });
      }
    };

    init();
  }, []);

  // 🔥 Escuchar cambios
  useEffect(() => {
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUsers(data.users);
        setHistory(data.history || []);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!users) return <p>Cargando...</p>;

  const getDate = () => {
    const d = new Date();
    return d.toLocaleDateString();
  };

  // ➕ SUMAR
  const addPoints = async (index, pts, label) => {
    const newUsers = [...users];
    newUsers[index].points += pts;

    const newEntry = {
      text: `${users[index].name} +${pts} por ${label}`,
      date: getDate(),
      type: "add",
      userIndex: index,
      value: pts,
    };

    await setDoc(docRef, {
      users: newUsers,
      history: [newEntry, ...history],
    });

    setLastAction({ index, pts, label, id: Date.now() });
  };

  // 😈 INDIVIDUAL
  const redeemIndividual = async (index, cost, name) => {
    const newUsers = [...users];

    if (newUsers[index].points >= cost) {
      newUsers[index].points -= cost;

      const newEntry = {
        text: `${users[index].name} -${cost} por ${name}`,
        date: getDate(),
        type: "redeem",
        userIndex: index,
        value: cost,
      };

      await setDoc(docRef, {
        users: newUsers,
        history: [newEntry, ...history],
      });
    }
  };

  // 🤝 COMPARTIDO
  const redeemShared = async (cost, name) => {
    if (users.every((u) => u.points >= cost)) {
      const newUsers = users.map((u) => ({
        ...u,
        points: u.points - cost,
      }));

      const newEntry = {
        text: `Ambos -${cost} por ${name}`,
        date: getDate(),
        type: "shared",
        value: cost,
      };

      await setDoc(docRef, {
        users: newUsers,
        history: [newEntry, ...history],
      });
    }
  };

  // ↩️ DESHACER
  const undoLast = async () => {
    if (history.length === 0) return;

    const last = history[0];
    const newUsers = [...users];

    if (last.type === "add") {
      newUsers[last.userIndex].points -= last.value;
    }

    if (last.type === "redeem") {
      newUsers[last.userIndex].points += last.value;
    }

    if (last.type === "shared") {
      newUsers.forEach((u) => (u.points += last.value));
    }

    await setDoc(docRef, {
      users: newUsers,
      history: history.slice(1),
    });
  };

  return (
    <div className="container">
      <h1>Juego Fitness 💪</h1>

      <button onClick={undoLast} className="undo">
        ↩️ Deshacer último
      </button>

      <div className="users">
        {users.map((user, i) => (
          <div key={i} className="card">
            <h2>{user.name}</h2>

            <motion.div
              key={user.points}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="points"
            >
              {user.points} pts
            </motion.div>

            <div className="buttons">
              {activities.map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => addPoints(i, act.points, act.name)}
                >
                  {act.name} +{act.points}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {lastAction && (
        <motion.div
          key={lastAction.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="feedback"
        >
          +{lastAction.pts} pts por {lastAction.label}
        </motion.div>
      )}

      <div className="rewards">
        <h2 class="tit-clase">Recompensas compartidas 🤝</h2>
        {rewards.shared.map((r, i) => (
          <button key={i} onClick={() => redeemShared(r.cost, r.name)} className="shared">
            {r.name} ({r.cost})
          </button>
        ))}

        <h2 class="tit-clase">Recompensas individuales 😈</h2>
        {users.map((user, i) => (
          <div key={i}>
            <p>{user.name}</p>
            {rewards.individual.map((r, idx) => (
              <button
                key={idx}
                onClick={() => redeemIndividual(i, r.cost, r.name)}
                className="individual"
              >
                {r.name} ({r.cost})
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="history">
        <h2 class="tit-clase">Historial 📜</h2>
        {history.map((h, i) => (
          <p key={i}>
            {h.date} — {h.text}
          </p>
        ))}
      </div>
    </div>
  );
}