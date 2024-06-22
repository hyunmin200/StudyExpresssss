const express = require("express");
const app = express();

// 폴더 등록
app.use(express.static(__dirname + "/src"));

app.listen(8080, () => {
	console.log("http://localhost:8080 에서 서버 실행중");
});

app.get("/", (요청, 응답) => {
	응답.send("반갑다");
});

app.get("/news", (요청, 응답) => {
	응답.sendFile(__dirname + "/src/index.html");
});

app.get("/shop", (요청, 응답) => {
	응답.send("쇼핑페이지입니다!");
});
