let server;

const port = process.env.PORT || 8080;
module.exports.getServer = () => server;
module.exports.appListen = (app) => {
   server = app.listen(port, () => {
      console.log(`listening to PORT ${port}`);
   });
};
