import Server from './server';

const PORT = process.env.PORT || 5000;
const server = new Server();
server.app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
