const TwitterSVG = `
<svg xmlns="http://www.w3.org/2000/svg" height="60px" viewBox="-12 -12 48 48" width="60px" fill="#e8eaed">
<path d="M0 0h24v24H0z" fill="none" />
<path
  d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
</svg>`

const messageDiv = `
<div class="twitterYTShareMessage">コピー</div>
`

function waitForElement(selector, callback, timeout = 5000, errorCallback = null) {
    const interval = 50;
    const maxAttempts = timeout / interval;
    let attempts = 0;

    const check = () => {
        if (document.querySelector(selector)) {
            callback();
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(check, interval);
        } else {
            console.log("twitterYTShare: 要素の発見がタイムアウトしました", selector);
            if (errorCallback) errorCallback();
        }
    };
    check();
}

// 特定のクラスを持つ要素があるかどうかをチェックする
function isAlreadyExist(selector) {
    return document.querySelector(selector) ? true : false;
}

function buildButton(targetElement, kind) {
    if (isAlreadyExist(".twitterYTShareButton")) { return; }

    const div = document.createElement("div");
    div.innerHTML = TwitterSVG + messageDiv;
    div.className = "twitterYTShareButton";
    div.title = "コピーする";
    div.addEventListener("click", function () {
        let shareText = "";
        let baseURL = window.location.href;
        let titleElmSelector = "";

        if (kind === "yt") {
            titleElmSelector = "#title > h1 > yt-formatted-string";
            baseURL = baseURL.replace("www.youtube.com", "youtu.be");
        } else if (kind === "ytm") {
            titleElmSelector = "#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.content-info-wrapper.style-scope.ytmusic-player-bar > yt-formatted-string";
            baseURL = baseURL.split("&list=")[0];
        }

        const titleElm = document.querySelector(titleElmSelector);
        // 中身の文字列を取得
        const titleString = titleElm ? titleElm.innerText : "";

        shareText += titleString;

        shareText = shareText.trim();

        // 字数制限のため、タイトルが長い場合は省略
        shareText.length >= 76 ? shareText = shareText.slice(0, 72) + "..." : shareText;

        shareText += " ";
        shareText += baseURL;

        if (kind === "yt") {
            shareText += " @YouTubeより ";
        } else if (kind === "ytm") {
            shareText += " @YouTubeMusicより ";
        }

        // 万が一、128文字を超える場合は、トリムする
        shareText.length >= 128 ? shareText = shareText.slice(0, 124) + "..." : shareText;

        // クリップボードにコピー
        navigator.clipboard.writeText(shareText).then(function () {
            console.log("twitterYTShare: コピーに成功しました");
        }, function () {
            console.error("twitterYTShare: コピーに失敗しました");
        });
        // モーダルを閉じる
        if (kind === "yt") {
            document.querySelector("#close-button .style-scope .ytd-unified-share-panel-renderer").click();
        } else if (kind === "ytm") {
            document.querySelector("body > ytmusic-app > ytmusic-popup-container > tp-yt-paper-dialog > ytmusic-unified-share-panel-renderer > div > tp-yt-paper-icon-button").click();
        }
    });
    targetElement.insertAdjacentElement("beforebegin", div);
    console.log("twitterYTShare: コピーボタンの追加に成功しました");
}

function main() {
    // まずはhtmlのtitleを取得

    // yt-share-target-rendererの並んでいる場所の、先頭に追加
    const urlPattern_yt = /https:\/\/www.youtube.com\/watch\?v=[0-9A-Za-z_-]{11}/;
    // const urlPattern_ytMusic = /https:\/\/music.youtube.com.*?/;
    const urlPattern_ytMusic = /https:\/\/music.youtube.com\/watch\?v=[0-9A-Za-z_-]{11}.*?/;

    // そもそも、トリガーとなる共有ボタンの位置
    // このボタンが押されたら、yt-share-target-rendererが表示されるまで待って、それからインジェクトする
    // ytの場合
    // #top-level-buttons-computed > yt-button-view-model
    // yt music の場合
    // #items > ytmusic-menu-navigation-item-renderer:nth-child(11)

    if (urlPattern_yt.test(window.location.href)) { // youtubeの場合
        if (isAlreadyExist(".twitterYTShareButton")) { return; }
        waitForElement("#top-level-buttons-computed > yt-button-view-model", function () {
            const targetElement = document.querySelector("#top-level-buttons-computed > yt-button-view-model");
            if (targetElement) {
                targetElement.addEventListener("click", function () {
                    waitForElement("#contents > yt-share-target-renderer:nth-child(1)", function () {
                        const targetElement2 = document.querySelector("#contents > yt-share-target-renderer:nth-child(1)")
                        if (targetElement2) {
                            buildButton(targetElement2, "yt");
                        } else {
                            console.error("twitterYTShare: targetElementが見つかりませんでした");
                        }
                    });
                });
            } else {
                console.error("twitterYTShare: targetElementが見つかりませんでした");
            }
        });
    } else if (urlPattern_ytMusic.test(window.location.href)) { // youtube musicの場合
        if (isAlreadyExist(".twitterYTShareButton")) { return; }
        waitForElement(
            "#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.middle-controls-buttons.style-scope.ytmusic-player-bar > ytmusic-menu-renderer",
            function () {
                const targetElement1 = document.querySelector("#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.middle-controls-buttons.style-scope.ytmusic-player-bar > ytmusic-menu-renderer");
                if (targetElement1) {
                    targetElement1.addEventListener("click", function () {
                        waitForElement(
                            "#items > ytmusic-menu-navigation-item-renderer:nth-child(11)",
                            function () {
                                const targetElement2 = document.querySelector("#items > ytmusic-menu-navigation-item-renderer:nth-child(11)");
                                if (targetElement2) {
                                    targetElement2.addEventListener("click", function () {
                                        waitForElement("#contents > yt-share-target-renderer:nth-child(1)", function () {
                                            const targetElement3 = document.querySelector("#contents > yt-share-target-renderer:nth-child(1)");
                                            if (targetElement3) {
                                                buildButton(targetElement3, "ytm");
                                            } else {
                                                console.error("twitterYTShare: targetElementが見つかりませんでした");
                                            }
                                        });
                                    });
                                } else {
                                    console.error("twitterYTShare: targetElementが見つかりませんでした");
                                }
                            },
                            250,
                            function () {
                                // 11番目が見つからなかった場合、8番目を探す(ytmusicで動画を再生している場合)
                                waitForElement(
                                    "#items > ytmusic-menu-navigation-item-renderer:nth-child(8)",
                                    function () {
                                        const targetElement2 = document.querySelector("#items > ytmusic-menu-navigation-item-renderer:nth-child(8)");
                                        if (targetElement2) {
                                            targetElement2.addEventListener("click", function () {
                                                waitForElement("#contents > yt-share-target-renderer:nth-child(1)", function () {
                                                    const targetElement3 = document.querySelector("#contents > yt-share-target-renderer:nth-child(1)");
                                                    if (targetElement3) {
                                                        buildButton(targetElement3, "ytm");
                                                    } else {
                                                        console.error("twitterYTShare: targetElementが見つかりませんでした");
                                                    }
                                                });
                                            });
                                        } else {
                                            console.error("twitterYTShare: targetElementが見つかりませんでした");
                                        }
                                    }
                                );
                            }
                        );
                    });
                }
            }
        );
    } else {
        console.log("twitterYTShare: 対象のURLではありません");
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}

// urlのクエリが変わったら再度実行
let oldHref = document.location.href;

function checkUrlChange() {
    if (oldHref !== document.location.href) {
        oldHref = document.location.href;
        console.log("twitterYTShare: URLが変更されました");
        main();
    }
}

// URL変更を監視するために `popstate` イベントをリッスン
window.addEventListener('popstate', checkUrlChange);

// `history.pushState` と `history.replaceState` をオーバーライド
const pushState = history.pushState;
history.pushState = function () {
    pushState.apply(history, arguments);
    checkUrlChange();
};

const replaceState = history.replaceState;
history.replaceState = function () {
    replaceState.apply(history, arguments);
    checkUrlChange();
};

// DOMの変化を監視
const bodyList = document.querySelector("body");
const observer = new MutationObserver(mutations => {
    mutations.forEach(() => {
        checkUrlChange();
    });
});

const config = {
    childList: true,
    subtree: true
};

observer.observe(bodyList, config);
