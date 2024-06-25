const router = require("express").Router();

const connectDB = require("../database");

let db;
// db접속 url 넣기
connectDB
	.then((client) => {
		console.log("DB연결성공");
		db = client.db("forum");
	})
	.catch((err) => {
		console.log(err);
	});

router.get("/shirts", async (요청, 응답) => {
	const a = await db.collection("post").find().toArray();
	console.log(a);
	응답.send("셔츠 파는 페이지입니다");
});

router.get("/pants", (요청, 응답) => {
	응답.send("바지 파는 페이지입니다");
});

module.exports = router;
