const express = require("express");
const app = express();

// 폴더 등록
app.use(express.static(__dirname + "/src"));

const { MongoClient } = require("mongodb");

let db;
// db접속 url 넣기
const url =
	"mongodb+srv://admin:admin1233@study.7jsoezt.mongodb.net/?retryWrites=true&w=majority&appName=Study";
new MongoClient(url)
	.connect()
	.then((client) => {
		console.log("DB연결성공");
		db = client.db("forum");
		app.listen(8080, () => {
			console.log("http://localhost:8080 에서 서버 실행중");
		});
	})
	.catch((err) => {
		console.log(err);
	});

app.get("/", (요청, 응답) => {
	응답.send("반갑다");
});

app.get("/news", (요청, 응답) => {
	db.collection("post").insertOne({ title: "어쩌구" });
	// 응답.send("오늘 비온다");
});
