/* eslint-disable @typescript-eslint/no-var-requires */
const os = require("os");
const path = require("path");
const fs = require("fs");
const utils = require("./utils");
const USER = os.userInfo().username;
const dir = {
  WeChat: {
    forwin10: ` C:\\Users\\${USER}\\AppData\\Local\\Packages\\TencentWeChatLimited.forWindows10_sdtnhv12zgd7a\\LocalCache\\Roaming\\Tencent\\WeChatAppStore\\WeChatAppStore Files`,

    pc: `C:\\Users\\${USER}\\Documents\\WeChat Files`,
    foruwp: `C:\\Users\\${USER}\\AppData\\Local\\Packages\\TencentWeChatLimited.WeChatUWP_sdtnhv12zgd7a\\LocalCache\\Roaming\\Tencent\\WeChatAppStore\\WeChatAppStore Files`,
  },
  QQ: {
    pc: `C:\\Users\\${USER}\\Documents\\Tencent Files`,
  },
};

const removeV = ["All Users", "Applet", "config"];

function getAccountName(app, accountRootPath) {
  switch (app) {
    case "WeChat":
      return fs.readdirSync(path.join(accountRootPath))[0].substr(8);
    case "QQ":
      // TODO: some behaviour here
      return path.basename(accountRootPath);
    default:
      return;
  }
  // fs.readdirSync(path.join(AllWeChat[key], value))[0].substr(8)
}

/**
 *
 * @param {string} app
 * @param {string} accountRootPath
 * @param {array} FolderNeedToCleanSuffix - example ["File","Image"]
 * @returns
 */
function getWaitingPath(app, accountRootPath) {
  let _mid = "";
  let _waitingPath = [];
  let _folderPath = [];

  switch (app) {
    case "WeChat":
      _mid = ["FileStorage"];
      _folderPath = ["File", "Video"];
      break;
    case "QQ":
      _mid = [""];
      _folderPath = ["Audio", "FileRecv", "Image", "Video"];
      break;
    default:
      return [];
  }

  _mid.forEach(_mid => {
    _waitingPath.push(
      _folderPath.map(i => {
        return { status: true, path: path.join(accountRootPath, _mid, i) };
      })
    );
  });

  return _waitingPath.flat();
}

/**
 *
 * @param {String} app
 * @returns {Array}
 */
function getFile(app) {
  let accountsList = [];
  // find Account
  for (const systemType in dir[app]) {
    if (!fs.existsSync(dir[app][systemType])) continue;
    utils
      .removeValue(
        Array.from(new Set(fs.readdirSync(dir[app][systemType]))),
        removeV
      )
      .forEach(i => {
        accountsList.push(path.join(dir[app][systemType], i));
      });
  }
  if (accountsList.length === 0) {
    window.utools.showNotification(`没有安装${app}`);
    return;
  }
  // 遍历 Account ，full waitingFolderList
  return accountsList.map(accountRootPath => {
    return {
      account: getAccountName(app, accountRootPath),
      waitingFolderList: getWaitingPath(app, accountRootPath),
    };
  });
}

async function cleanUpSubItem(List) {
  let delFile = [];
  List.forEach(filepath => {
    fs.readdirSync(filepath).forEach(value => {
      delFile.push(path.join(filepath, value));
    });
  });
  for (let index = 0; index < delFile.length; index++) {
    await utils.deleteFilePromise(delFile[index]);
  }
  window.utools.showNotification("清理完成");
}

window.exports = {
  getFile,
  cleanUpSubItem,
  getFolderSize: utils.getFolderSize,
};
