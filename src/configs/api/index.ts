const api = {
  players: `${process.env.API_URL}/${process.env.API_VERSION}/players`,
  game: `${process.env.API_URL}/${process.env.API_VERSION}/game`,
  card: `${process.env.API_URL}/${process.env.API_VERSION}/cards`,
  quest: `${process.env.API_URL}/${process.env.API_VERSION}/quests`,
  market: `${process.env.API_URL}/${process.env.API_VERSION}/market`,
  tradelist: `${process.env.API_URL}/${process.env.API_VERSION}/my-trades`,
  trade: `${process.env.API_URL}/${process.env.API_VERSION}/trades`,
  help: `${process.env.API_URL}/${process.env.API_VERSION}/guideline-config`,
  leaderboard: `${process.env.API_URL}/${process.env.API_VERSION}/leaderboard`,
  work: `${process.env.API_URL}/${process.env.API_VERSION}/work`,
  item: `${process.env.API_URL}/${process.env.API_VERSION}/item`,

};

export default api;
