const express = require("express");
const app = express();

// 폴더 등록
app.use(express.static(__dirname + "/src"));
app.set("view engin", "ejs");
// 요청.body에서 값 빼기 쉽게 해준다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
	응답.send("오늘 비온다");
});

app.get("/list", async (요청, 응답) => {
	let result = await db.collection("post").find().toArray();
	// 응답.send(result[0].title);

	응답.render("list.ejs", { 글목록: result });
});

app.get("/time", (요청, 응답) => {
	응답.render("time.ejs", { time: new Date() });
});

app.get("/write", (요청, 응답) => {
	응답.render("write.ejs");
});

app.post("/add", async (요청, 응답) => {
	console.log(요청.body);

	try {
		if (요청.body.title == "") {
			응답.send("제목 입력안함");
		} else {
			await db
				.collection("post")
				.insertOne(
					{ title: 요청.body.title, content: 요청.body.content },
					(에러, 결과) => {
						console.log("삽입 완료");
					},
				);
			응답.redirect("/list");
		}
	} catch (e) {
		console.log(e);
		응답.status(500).send("서버 에러남");
	}
});
