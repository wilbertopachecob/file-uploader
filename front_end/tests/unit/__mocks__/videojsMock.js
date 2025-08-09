const players = {};

function videojs(el) {
  const id = typeof el === "string" ? el : (el && el.id) || "player";
  players[id] = {
    pause: () => {},
    dispose: () => {},
  };
  return players[id];
}

videojs.getPlayers = () => players;

module.exports = videojs;
