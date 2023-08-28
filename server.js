//최종 수정 일시 : 2023.08.27 
//최종 수정자 : 정해찬
//수정할 것 : 

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const session = require("express-session");
const { render } = require("express/lib/response");
const { stringify } = require("nodemon/lib/utils");

const path = require('path');
const multer = require('multer')
const uuid4 = require('uuid4')

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
  
app.post("/", uploadMiddleware, (call, answer) => {
	console.log(call.file);
	answer.send("<script>alert('업로드 완료'); window.location.replace('/')</script>");
  });
  
app.get("/", function (call, answer) {
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

app.listen(process.env.PORT, function () {
	console.log("listening on 8080");
});