'use strict'

function createWebSocketServer(io, game) {

  // namespace 通信をグループ分け？？
  const rootIo = io.of('/');

  rootIo.on('connection', (socket) => {

    const displayName = socket.handshake.query.displayName;
    const thumbUrl = socket.handshake.query.thumbUrl;

    // サーバ側でイベント発火する
    const startObj = game.newConnection(socket.id, displayName, thumbUrl);
    socket.emit('start data', startObj);

    socket.on('change direction', (direction) => {
      game.updatePlayerDirection(socket.id, direction);
    });

    socket.on('disconnect', () => {
      game.disconnect(socket.id);
    });
  });

  const socketTicker = setInterval(() => {
      // Volatile events 揮発性イベント
      // 接続が確立されていない場合、送信されない
      // オンラインゲーム等は接続が上手く行かなかった場合、古いデータはいらず最新のデータだけが有用なため
      rootIo.volatile.emit('map data', game.getMapData()); // 全員に送信
    },
    66);
}

module.exports = {
  createWebSocketServer
};