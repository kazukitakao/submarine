'use strict';
import $ from 'jquery';
import io from 'socket.io-client';

// グローバル変数として定義
const gameObj = {
  raderCanvasWidth: 500,
  raderCanvasHeight: 500,
  scoreCanvasWidth: 300,
  scoreCanvasHeight: 500,
  itemRadius: 4,
  airRadius: 5,
  deg: 0,
  myDisplayName: $('#main').attr('data-displayName'),
  myThumbUrl: $('#main').attr('data-thumbUrl'),
  fieldWidth: null,
  fieldHeight: null,
  itemsMap: new Map(),
  airMap: new Map()
};

const socketQueryParameters = `displayName=${gameObj.myDisplayName}&thumbUrl=${gameObj.myThumbUrl}`;
const socket = io($('#main').attr('data-ipAddress') + '?' + socketQueryParameters);
console.log(socket);

function init() {

  // ゲーム用のキャンバス
  const raderCanvas = $('#rader')[0];
  raderCanvas.width = gameObj.raderCanvasWidth;
  raderCanvas.height = gameObj.raderCanvasHeight;
  gameObj.ctxRader = raderCanvas.getContext('2d');

  // ランキング用のキャンバス
  const scoreCanvas = $('#score')[0];
  scoreCanvas.width = gameObj.scoreCanvasWidth;
  scoreCanvas.height = gameObj.scoreCanvasHeight;
  gameObj.ctxScore = scoreCanvas.getContext('2d');

  // 潜水艦の画像
  const submarineImage = new Image();
  submarineImage.src = '/images/submarine.png';
  gameObj.submarineImage = submarineImage;
}
init();

/**
 * ゲーム内の時間を刻む関数
 */
function ticker() {
  gameObj.ctxRader.clearRect(0, 0, gameObj.raderCanvasWidth, gameObj.raderCanvasHeight); // まっさら
  drawRadar(gameObj.ctxRader);
  drawSubmarine(gameObj.ctxRader);
}
setInterval(ticker, 33);

function drawRadar(ctxRader) {
  const x = gameObj.raderCanvasWidth / 2; // 横軸
  const y = gameObj.raderCanvasHeight / 2; // 縦軸
  const r = gameObj.raderCanvasWidth * 1.5 / 2; // 対角線の長さの半分

  ctxRader.save(); // セーブ

  ctxRader.beginPath(); // 新しい描画
  ctxRader.translate(x, y); // 座標設定
  ctxRader.rotate(getRadian(gameObj.deg)); // 引数分回転

  ctxRader.fillStyle = 'rgba(0, 220, 0, 0.5)'; // 描画する色と透明度

  ctxRader.arc(0, 0, r, getRadian(0), getRadian(-30), true); // 扇の原点(0,0)を設定して30度だけ描画
  ctxRader.lineTo(0, 0);

  ctxRader.fill();

  ctxRader.restore(); // 元の設定を取得
  gameObj.deg = (gameObj.deg + 5) % 360;
}

function drawSubmarine(ctxRader) {
  ctxRader.save();
  ctxRader.translate(gameObj.raderCanvasWidth / 2, gameObj.raderCanvasHeight / 2);

  ctxRader.drawImage(
      gameObj.submarineImage, -(gameObj.submarineImage.width / 2), -(gameObj.submarineImage.height / 2)
  );
  ctxRader.restore();
}

//websocketでデータ受信したときの処理
/**
 * 新たにプレイヤーが参加したときの処理
 */
socket.on('start data', (startObj) => {
  gameObj.fieldWidth = startObj.fieldWidth;
  gameObj.fieldHeight = startObj.fieldHeight;
  gameObj.myPlayerObj = startObj.playerObj;
});

/**
 * マップデータを取得したときの処理
 */
socket.on('map data', (compressed) => {
  // compressed 圧縮
  const playersArray = compressed[0];
  const itemsArray = compressed[1];
  const airArray = compressed[2];

  gameObj.playersMap = new Map();
  for (let compressedPlayerData of playersArray) {

    const player = {};
    player.x = compressedPlayerData[0];
    player.y = compressedPlayerData[1];
    player.playerId = compressedPlayerData[2];
    player.displayName = compressedPlayerData[3];
    player.score = compressedPlayerData[4];
    player.isAlive = compressedPlayerData[5];
    player.direction = compressedPlayerData[6];

    gameObj.playersMap.set(player.playerId, player);

    // 自分の情報も更新
    if (player.playerId === gameObj.myPlayerObj.playerId) {
      gameObj.myPlayerObj.x = compressedPlayerData[0];
      gameObj.myPlayerObj.y = compressedPlayerData[1];
      gameObj.myPlayerObj.displayName = compressedPlayerData[3];
      gameObj.myPlayerObj.score = compressedPlayerData[4];
      gameObj.myPlayerObj.isAlive = compressedPlayerData[5];
    }
  }

  gameObj.itemsMap = new Map();
  itemsArray.forEach((compressedItemData, index) => {
    gameObj.itemsMap.set(index, { x: compressedItemData[0], y: compressedItemData[1] });
  });

  gameObj.airMap = new Map();
  airArray.forEach((compressedAirData, index) => {
    gameObj.airMap.set(index, { x: compressedAirData[0], y: compressedAirData[1] });
  });
});

/**
 * 角度をラジアンに変換する関数
 * @param {} angle 
 * @returns 
 */
function getRadian(angle) {
  return angle * Math.PI / 180
}