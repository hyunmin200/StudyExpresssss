const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
// 폴더 등록
app.use(express.static("src"));
app.set("view engin", "ejs");
// 요청.body에서 값 빼기 쉽게 해준다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
	// console.log(요청.body);

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

app.get("/detail/:id", async (요청, 응답) => {
	try {
		let result = await db
			.collection("post")
			.findOne({ _id: new ObjectId(요청.params.id) });
		// console.log(result);
		if (result) {
			응답.render("detail.ejs", {
				title: result.title,
				content: result.content,
			});
		} else {
			응답.status(404).send("이상한 url을 입력하였습니다.");
		}
	} catch (e) {
		console.log(e);
		응답.status(404).send("이상한 url을 입력하였습니다.");
	}
});

app.get("/edit/:id", async (요청, 응답) => {
	let result = await db
		.collection("post")
		.findOne({ _id: new ObjectId(요청.params.id) });
	// console.log(result);
	응답.render("edit.ejs", { result: result });
});

app.put("/edit", async (요청, 응답) => {
	let result = await db
		.collection("post")
		.updateOne(
			{ _id: new ObjectId(요청.body.id) },
			{ $set: { title: 요청.body.title, content: 요청.body.content } },
		);
	응답.redirect("/list");
});

app.delete("/delete", async (요청, 응답) => {
	console.log(요청.query);
	await db
		.collection("post")
		.deleteOne({ _id: new ObjectId(요청.query.docid) });
	응답.send("삭제 완료");
});
