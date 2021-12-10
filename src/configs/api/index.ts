const api = {
  players: `${process.env.API_URL}/${process.env.API_VERSION}/players`,
  game: `${process.env.API_URL}/${process.env.API_VERSION}/game`,
  card: `${process.env.API_URL}/${process.env.API_VERSION}/cards`,
  quest: `${process.env.API_URL}/${process.env.API_VERSION}/quests`,
  market: `${process.env.API_URL}/${process.env.API_VERSION}/market`,
  tradelist: `${process.env.API_URL}/${process.env.API_VERSION}/my-trades`,
  trade: `${process.env.API_URL}/${process.env.API_VERSION}/trades`
};

export default api;
