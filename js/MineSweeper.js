/**
 * Created by zdy on 2017/5/27.
 */
"usr strict";
var canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d"),
    result = document.getElementById("result"), resCtx = result.getContext("2d"), closeColor = "#C6E2FF",
    plainColor = "#848fff", map, state, setMineSign;
var w = 10, h = 10, mineCounts = 10;
ctx.textBaseline = 'middle';//设置文本的垂直对齐方式
ctx.textAlign = 'center'; //设置文本的水平对对齐方式
var minePic = new Image;
minePic.src = "img/mine.png";
var flagPic = new Image;
flagPic.src = "img/flag.png";
function initMapData() {
    setMineSign = false;
    map=[];
    state=[];
    var minePos = createMines(w * h, mineCounts);
    for (var i = 0; i < h; i++) {
        state[i] = [];
        map[i] = [];
    }
    for (var index in minePos) {
        map[Math.floor(minePos[index] / w)][minePos[index] % w] = 9;
    }
    for (var i = 0; i < w; i++) {
        for (var j = 0; j < h; j++) {
            //初始 不显示
            state[i][j] = 0;
            if (minePos.indexOf(w * i + j) < 0) {
                var top = (map[i - 1] && map[i - 1][j] == 9) ? 1 : 0;
                var topLeft = (map[i - 1] && map[i - 1][j - 1] == 9) ? 1 : 0;
                var topRight = (map[i - 1] && map[i - 1][j + 1] == 9) ? 1 : 0;
                var bottom = (map[i + 1] && map[i + 1][j] == 9) ? 1 : 0;
                var bottomLeft = (map[i + 1] && map[i + 1][j - 1] == 9) ? 1 : 0;
                var bottomRight = (map[i + 1] && map[i + 1][j + 1] == 9) ? 1 : 0;
                var left = map[i][j - 1] == 9 ? 1 : 0;
                var right = map[i][j + 1] == 9 ? 1 : 0;
                map[i][j] = top + topLeft + topRight + bottom + bottomLeft + bottomRight + left + right;
            }
        }
    }
}
function createMines(blocks, count) {
    var minePos = [];
    while (count) {
        var cur = Math.floor(Math.random() * blocks);
        if (minePos.indexOf(cur) >= 0) {
        } else {
            minePos.push(cur);
            count--;
        }
    }
    return minePos;
}
function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    var blockSize = canvas.width / w;
    for (var i = 0; i < h; i++) {
        for (var j = 0; j < w; j++) {
            if (state[i][j] == 0) {
                ctx.fillStyle = closeColor;
                ctx.fillRect(blockSize * j, blockSize * i, blockSize, blockSize);
            } else if (state[i][j] == 1) {
                if (map[i][j] == 9) {
                    ctx.drawImage(minePic, j * blockSize + blockSize * 0.1, i * blockSize + blockSize * 0.1, blockSize * 0.8, blockSize * 0.8)
                    // ctx.fillStyle = "#000000"
                    // ctx.fillText("地雷", blockSize * j + blockSize / 2, blockSize * i + blockSize / 2);
                } else {
                    ctx.fillStyle = plainColor;
                    ctx.fillRect(blockSize * j, blockSize * i, blockSize, blockSize);
                    if (map[i][j]) {
                        ctx.fillStyle = "#000000";
                        ctx.fillText(map[i][j], blockSize * j + blockSize / 2, blockSize * i + blockSize / 2);
                    }
                }
            } else if (state[i][j] == 2) {
                ctx.drawImage(flagPic, j * blockSize + blockSize * 0.1, i * blockSize + blockSize * 0.1, blockSize * 0.8, blockSize * 0.8)
                // ctx.fillStyle = "#000000";
                // ctx.fillText("旗子", blockSize * j + blockSize / 2, blockSize * i + blockSize / 2);
            }

            ctx.strokeStyle = "#F4F4F4";
            ctx.strokeRect(blockSize * j, blockSize * i, blockSize, blockSize);
        }
    }
}

window.onresize = function () {
    var max = 500, v;
    var w = window.innerWidth - 20;
    var h = window.innerHeight - 20;
    if (w <= h) {
        v = (w >= max) ? max : w;
        canvas.style.width = v + "px";
        result.style.width = v + "px";
    } else {
        v = (h >= max) ? max : h;
        canvas.style.width = v + "px";
        result.style.width = v + "px";
    }
};

function set(m, n) {
    if (state[m] && state[m][n] == 0) {
        state[m][n] = 1;
        if (map[m][n] == 0) {
            set(m - 1, n - 1);
            set(m - 1, n);
            set(m - 1, n + 1);
            set(m, n - 1);
            set(m, n + 1);
            set(m + 1, n - 1);
            set(m + 1, n);
            set(m + 1, n + 1);
        }
    }
}
function addTouchEvents() {
    $("#canvas").off("touchend touchmove touchcancel").on("touchend touchmove touchcancel", function (e) {
        e.preventDefault();
    }).off("touchstart click contextmenu").on("touchstart click contextmenu", function (e) {
        e.preventDefault();
        var dx = (e.offsetX||(e.targetTouches[0].pageX - canvas.offsetLeft - parseFloat(canvas.style.borderWidth || 0) - parseFloat(canvas.style.paddingLeft || 0))) * canvas.width / parseFloat(canvas.style.width);
        var dy = (e.offsetY||(e.targetTouches[0].pageY - canvas.offsetTop - parseFloat(canvas.style.borderWidth || 0) - parseFloat(canvas.style.paddingTop || 0)))* canvas.width / parseFloat(canvas.style.width);
        var blockSize = canvas.width / w;
        var x = Math.floor(dy / blockSize);
        var y = Math.floor(dx / blockSize);
        if (setMineSign||e.type=="contextmenu") {
            if (state[x][y] == 0) {
                state[x][y] = 2;
            } else if (state[x][y] == 2) {
                state[x][y] = 0;
            }
        } else if (map[x][y] == 9) {
            state[x][y] = 1;
            drawMap();
            fail();
            return;
        } else {
            set(x, y);
        }
        drawMap();
        check();
    })

}

function setMine(sign) {
    setMineSign = sign;
}
function check() {
    var openSign = true;
    var successSign = false;
    for (var i = 0; i < w; i++) {
        for (var j = 0; j < h; j++) {
            if (state[i][j] == 0) {
                openSign = false;
            }
        }
    }
    var count = 0;
    for (var i = 0; i < w; i++) {
        for (var j = 0; j < h; j++) {
            if (state[i][j] == 2) {
                count++;
            }
        }
    }
    if (openSign && count == mineCounts) {
        successSign = true;
        for (var i = 0; i < w; i++) {
            for (var j = 0; j < h; j++) {
                if (map[i][j] == 9) {
                    if (state[i][j] != 2) {
                        successSign = false;
                    }
                }
            }
        }
    }
    if (successSign) {
        success();
    }
}
function initGame(wc, hc, mc) {
    $("#open").click();
    window.onresize();
    w = wc;
    h = hc;
    mineCounts = mc;
    initMapData();
    drawMap();
    addTouchEvents();
}
function success() {
    document.getElementById("mask").style.display = "block";
    result.width = canvas.width;
    result.height = canvas.height;
    var img = new Image();
    img.src = canvas.toDataURL();
    img.onload = function () {
        resCtx.drawImage(img, 0, 0);
    }
    result.style.display = "block";
    document.getElementById("mes").innerHTML = "<p>恭喜你，成功啦！</p>"
}
function fail() {
    document.getElementById("mask").style.display = "block";
    result.width = canvas.width;
    result.height = canvas.height;
    var img = new Image();
    img.src = canvas.toDataURL();
    img.onload = function () {
        resCtx.drawImage(img, 0, 0);
    }
    result.style.display = "block";
    document.getElementById("mes").innerHTML = "<p>很抱歉，失败了！</p>"
}
function start() {
    document.getElementById("mask").style.display = "none";
    result.style.display = "none";
    initGame(w, h, mineCounts)
}
function changeLevel(level) {
    $("#count").attr("max", level * level);
    changeCount($("#count").val());
}
function changeCount(count) {
    var wc = $("#level").val();
    var hc = $("#level").val();
    var mc = $("#count").val();
    $("#levelMes").text(wc + "*" + hc);
    $("#countMes").text(mc);
    initGame(wc, hc, mc);
}
initGame(10, 10, 10);