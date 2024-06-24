const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");
const methodOverride = require("method-override");
const bcrypt = require("bcrypt");

app.use(methodOverride("_method"));
// 폴더 등록
app.use(express.static("src"));
app.set("view engin", "ejs");
// 요청.body에서 값 빼기 쉽게 해준다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");

app.use(passport.initialize());
app.use(
	session({
		secret: "암호화에 쓸 비번",
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 60 * 60 * 1000 },
		store: MongoStore.create({
			mongoUrl:
				"mongodb+srv://admin:admin1233@study.7jsoezt.mongodb.net/?retryWrites=true&w=majority&appName=Study",
			dbName: "forum",
		}),
	}),
);

app.use(passport.session());

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
	if (!요청.user) {
		응답.send("로그인하세요!");
	}
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

// app.get("/list/:id", async (요청, 응답) => {
// 	let result = await db
// 		.collection("post")
// 		.find()
// 		.skip(5 * (요청.params.id - 1))
// 		.limit(5)
// 		.toArray();
// 	응답.render("list.ejs", { 글목록: result });
// });

app.get("/list/next/:id", async (요청, 응답) => {
	let result = await db
		.collection("post")
		.find({ _id: { $gt: new ObjectId(요청.params.id) } })
		.limit(5)
		.toArray();
	응답.render("list.ejs", { 글목록: result });
});

passport.use(
	new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
		let result = await db
			.collection("user")
			.findOne({ username: 입력한아이디 });
		if (!result) {
			return cb(null, false, { message: "아이디 DB에 없음" });
		}

		if (await bcrypt.compare(입력한비번, result.password)) {
			return cb(null, result);
		} else {
			return cb(null, false, { message: "비번불일치" });
		}
	}),
);

passport.serializeUser((user, done) => {
	process.nextTick(() => {
		done(null, { id: user._id, username: user.username });
	});
});

passport.deserializeUser(async (user, done) => {
	let result = await db
		.collection("user")
		.findOne({ _id: new ObjectId(user.id) });
	delete result.password;
	process.nextTick(() => {
		return done(null, result);
	});
});

app.get("/login", async (요청, 응답) => {
	console.log(요청.user);
	응답.render("login.ejs");
});

app.post("/login", async (요청, 응답, next) => {
	passport.authenticate("local", (error, user, info) => {
		if (error) return 응답.status(500).json(error);
		if (!user) return 응답.status(401).json(info.message);
		요청.logIn(user, (err) => {
			if (err) return next(err);
			응답.redirect("/");
		});
	})(요청, 응답, next);
});

app.get("/mypage", (요청, 응답) => {
	if (!요청.user) {
		응답.send("로그인하세요!");
	}
	응답.render("mypage.ejs", { user: 요청.user });
});

app.get("/register", (요청, 응답) => {
	응답.render("register.ejs");
});

app.post("/register", async (요청, 응답) => {
	let checkUser = await db
		.collection("user")
		.findOne({ username: 요청.body.username });

	if (checkUser) {
		응답.send("중복 아이디입니다.");
	} else {
		let hash = await bcrypt.hash(요청.body.password, 10);

		await db
			.collection("user")
			.insertOne({ username: 요청.body.username, password: hash });
		응답.redirect("/");
	}
});
