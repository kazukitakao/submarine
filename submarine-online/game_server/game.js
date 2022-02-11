'use strict';
const crypto = require('crypto');

const gameObj = {
  // ゲームに参加しているプレイヤー情報
  playersMap: new Map(),
  // ミサイル情報
  itemsMap: new Map(),
  // 酸素情報
  airMap: new Map(),
  // ゲーム横幅
  fieldWidth: 1000,
  // ゲーム縦幅
  fieldHeight: 1000,
  // アイテム出現数
  itemTotal: 15,
  airTotal: 10
};

function init() {
  for (let i = 0; i < gameObj.itemTotal; i++) {
    addItem();
  }
  for (let a = 0; a < gameObj.airTotal; a++) {
    addAir();
  }
}
init(); // 初期化（初期化はサーバー起動時に行う

/**
 * 新しくプレイヤーがゲームに参加し、socket接続したときの処理
 * @param {*} socketId 
 * @param {*} displayName 
 * @param {*} thumbUrl 
 * @returns 
 */
function newConnection(socketId, displayName, thumbUrl) {
  const playerX = Math.floor(Math.random() * gameObj.fieldWidth);
  const playerY = Math.floor(Math.random() * gameObj.fieldHeight);
  const playerId = crypto.createHash('sha1').update(socketId).digest('hex');

  const playerObj = {
    x: playerX,
    y: playerY,
    playerId: playerId,
    displayName: displayName,
    thumbUrl: thumbUrl,
    isAlive: true,
    direction: 'right',
    score: 0
  };
  gameObj.playersMap.set(socketId, playerObj);

  const startObj = {
    playerObj: playerObj,
    fieldWidth: gameObj.fieldWidth,
    fieldHeight: gameObj.fieldHeight
  };
  return startObj;
}

/**
 * マップ情報を作成
 * @returns 
 */
function getMapData() {
  const playersArray = [];
  const itemsArray = [];
  const airArray = [];

  for (let [socketId, plyer] of gameObj.playersMap) {
    const playerDataForSend = [];

    playerDataForSend.push(plyer.x);
    playerDataForSend.push(plyer.y);
    playerDataForSend.push(plyer.playerId);
    playerDataForSend.push(plyer.displayName);
    playerDataForSend.push(plyer.score);
    playerDataForSend.push(plyer.isAlive);
    playerDataForSend.push(plyer.direction);

    playersArray.push(playerDataForSend);
  }

  for (let [id, item] of gameObj.itemsMap) {
    const itemDataForSend = [];

    itemDataForSend.push(item.x);
    itemDataForSend.push(item.y);

    itemsArray.push(itemDataForSend);
  }

  for (let [id, air] of gameObj.airMap) {
    const airDataForSend = [];

    airDataForSend.push(air.x);
    airDataForSend.push(air.y);

    airArray.push(airDataForSend);
  }

  return [playersArray, itemsArray, airArray];
}

function disconnect(socketId) {
  gameObj.playersMap.delete(socketId);
}

function addItem() {
  const itemX = Math.floor(Math.random() * gameObj.fieldWidth);
  const itemY = Math.floor(Math.random() * gameObj.fieldHeight);
  const itemKey = `${itemX},${itemY}`;

  if (gameObj.itemsMap.has(itemKey)) { // アイテムの位置が被ってしまった場合は
    return addItem(); // 場所が重複した場合は作り直し
  }

  const itemObj = {
    x: itemX,
    y: itemY,
  };
  gameObj.itemsMap.set(itemKey, itemObj);
}

function addAir() {
  const airX = Math.floor(Math.random() * gameObj.fieldWidth);
  const airY = Math.floor(Math.random() * gameObj.fieldHeight);
  const airKey = `${airX},${airY}`;

  if (gameObj.airMap.has(airKey)) { // アイテムの位置が被ってしまった場合は
    return addAir(); // 場所が重複した場合は作り直し
  }

  const airObj = {
    x: airX,
    y: airY,
  };
  gameObj.airMap.set(airKey, airObj);
}

module.exports = {
  newConnection,
  getMapData,
  disconnect
};