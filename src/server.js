const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const session = require("express-session");
const { render } = require("express/lib/response");
const { stringify } = require("nodemon/lib/utils");
const MongoClient = require("mongodb").MongoClient;

const path = require('path');
const multer = require('multer')
const uuid4 = require('uuid4')

const fsExtra = require('fs-extra')
fsExtra.emptyDirSync("files")

require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.engine("ejs", require("ejs").__express);

const newLocal = express.static;
app.use(newLocal("imgs"));

const newLocal2 = express.static;
app.use(newLocal2("public"));  

const upload = multer({
	storage: multer.diskStorage({
	  filename(req, file, done) {
		done(null, file.originalname);
	  },
	  destination(req, file, done) {
		done(null, path.join(__dirname, "files"));
	  },
	}),
	limits: { fileSize: 1024 * 1024 * 10},
  });
  
const uploadMiddleware = upload.single("myFile");
  
var db;
MongoClient.connect(process.env.DB_URL, function (error, client) {
	if (error) return console.log(error);

	db = client.db("cell_classification");

	app.get("/", function (call, answer) {
		answer.render("login.ejs");
	});

	app.post("/", function (call, answer) {
		db.collection("user").insertOne(
			{
				name : call.body.ans
			},
			function (error, result) {
				if (error) {
					console.log("연결 오류");
					answer.send("<script>alert('서버 연결에 실패했습니다.'); window.location.replace('/')</script>");
				} else {
					answer.send("<script>alert('제출했당!'); window.location.replace('/index')</script>");
				}
			}
		);
	});

	app.post("/index", uploadMiddleware, (call, answer) => {
		console.log(call.file);
		answer.send("<script>alert('업로드 완료'); window.location.replace('/index')</script>");
	  });
  
	app.get("/index", function (call, answer) {
		answer.render("index.ejs");
	});
	
	app.get('/classification', (call, answer) => {
		const spawn = require('child_process').spawn;
		const result_01 = spawn('python', ['classification.py'], );
		result_01.stdout.on('data', (result)=>{
			console.log(result.toString());
		});
		answer.render("classification.ejs");
	});

	app.get('/result', (call, answer) => {
		setTimeout(function() {
			db.collection("classification")
			.find()
			.sort({ _id: -1 })
			.toArray(function (error, result) {
				answer.render("result.ejs", {
					posts: result,
				});
			});;
		  }, 5000);
	});

	app.listen(process.env.PORT, function () {
		console.log("listening on 8000");
	});

});