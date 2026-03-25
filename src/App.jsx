// App.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import "./App.css";

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
  const [users, setUsers] = useState([
    { name: "Sofi", points: 0 },
    { name: "Fede", points: 0 },
  ]);

  const [lastAction, setLastAction] = useState(null);

  const addPoints = (index, pts, label) => {
    const newUsers = [...users];
    newUsers[index].points += pts;
    setUsers(newUsers);
    setLastAction({ index, pts, label, id: Date.now() });
  };

  const redeemIndividual = (index, cost) => {
    const newUsers = [...users];
    if (newUsers[index].points >= cost) {
      newUsers[index].points -= cost;
      setUsers(newUsers);
    }
  };

  const redeemShared = (cost) => {
    if (users.every((u) => u.points >= cost)) {
      setUsers(users.map((u) => ({ ...u, points: u.points - cost })));
    }
  };

  return (
    <div className="container">
      <h1>Juego Fitness 💪</h1>

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
                <button key={idx} onClick={() => addPoints(i, act.points, act.name)}>
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
        <h2>Recompensas compartidas 🤝</h2>
        {rewards.shared.map((r, i) => (
          <button key={i} onClick={() => redeemShared(r.cost)} className="shared">
            {r.name} ({r.cost})
          </button>
        ))}

        <h2>Recompensas individuales 😈</h2>
        {users.map((user, i) => (
          <div key={i}>
            <p>{user.name}</p>
            {rewards.individual.map((r, idx) => (
              <button key={idx} onClick={() => redeemIndividual(i, r.cost)} className="individual">
                {r.name} ({r.cost})
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
