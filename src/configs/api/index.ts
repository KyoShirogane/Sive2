const api = {
    players: `${process.env.API_URL}/${process.env.API_VERSION}/players`,
    game: `${process.env.API_URL}/${process.env.API_VERSION}/game`,
    card: `${process.env.API_URL}/${process.env.API_VERSION}/cards`,
}

export default api;