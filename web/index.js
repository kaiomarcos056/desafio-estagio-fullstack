//Bibliotecas e dependencias
const http = require('http');
const express = require('express');
const session = require('express-session');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

//Recursos 
app.use(express.static(__dirname + '/'));
app.use(session({secret:'pneumoultramicroscopicossilicovulcanoconiotico'}));
app.use(bodyParser.urlencoded({extended:true}));

//Config servidor
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, ""));
app.use(express.urlencoded({ extended: false }));
app.listen(3000);
console.log("SERVIDOR FUNCIONANDO");

//Config Banco
const db_name = path.join(__dirname, "db", "banco.db");
const db = new sqlite3.Database(db_name, err => {
	if (err) {
		return console.error(err.message);
	} else {
		console.log("BANCO FUNCIONANDO");
	}
});

//Criar tabelas
const sql_create = "CREATE TABLE IF NOT EXISTS funcionarios(id_func INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nome VARCHAR(100) NOT NULL,email VARCHAR(100) NOT NULL,senha VARCHAR(100) NOT NULL,funcao VARCHAR(100) NOT NULL,foto VARCHAR(200))";
db.run(sql_create, err => {
	if (err) {
		return console.error(err.message);
	} else {
		console.log("TABELA FUNCIONARIOS CRIADA COM SUCESSO");
	}
});

const sql_createe = "CREATE TABLE IF NOT EXISTS chamados(id_chamado INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, titulo VARCHAR(100) NOT NULL,descricao VARCHAR(255) NOT NULL)";
db.run(sql_createe, err => {
	if (err) {
		return console.error(err.message);
	} else {
		console.log("TABELA CHAMADOS CRIADA COM SUCESSO");
	}
});


//Rotas

//Login
app.post('/',(req,res) =>{
	console.log(req.body.email);
	const sql = "SELECT * FROM funcionarios WHERE email='"+req.body.email+"' AND senha='"+req.body.password+"'";
	db.all(sql, [], (err, rows) => {
		if (err) {
			return console.error(err.message);
		} else {
			console.log("RESULTADO:"+rows.length);
			if(rows.length > 0){
				res.render("views/home.ejs", { modelo: rows });
			}else{
				res.redirect("/");
			}			
		}
	})
})

app.get('/', (req, res) => {
	res.render('views/index.ejs');
})

app.get('/cracha/:id', (req, res) => {
	const id = req.params.id;
	const sql = "SELECT * FROM funcionarios WHERE id_func="+id;
	db.all(sql, [], (err, rows) => {
		if (err) {
			return console.error(err.message);
		} else {
			res.render("views/cracha.ejs", { modelo: rows });
		}
	})
})

app.get('/contracheque', (req, res) => {
	res.render('views/contracheque.ejs');
})

//Mostrar funcionarios
app.get('/funcionarios', (req, res) => {
	const sql = "SELECT * FROM funcionarios ORDER BY id_func";
	db.all(sql, [], (err, rows) => {
		if (err) {
			return console.error(err.message);
		} else {
			res.render("views/funcionarios.ejs", { modelo: rows });
		}
	})
})

//Criar novo funcionario
app.get('/criar', (req, res) => {
	res.render('views/criar.ejs', { modelo: {} });
});

//POST Criar
app.post('/criar', (req, res) => {
	const sql = "INSERT INTO funcionarios(nome,email,senha,funcao,foto) VALUES(?,?,?,?,?)";
	const novo_funcionario = [req.body.nome, req.body.email, req.body.senha, req.body.funcao, req.body.foto];
	db.run(sql, novo_funcionario, err => {
		if (err) {
			return console.error(err.message);
		} else {
			res.redirect("/funcionarios");
		}
	})
});

//GET editar
app.get("/editar/:id", (req, res) => {
	const id = req.params.id;
	const sql = "SELECT * FROM funcionarios WHERE id_func=?";
	db.get(sql, id, (err, row) => {
		res.render("views/editarFuncionario.ejs", { modelo: row })
	})
})

//POST editar
app.post("/editar/:id", (req, res) => {
	const id = req.params.id;
	const info_func = [req.body.nome, req.body.email, req.body.senha, req.body.funcao, req.body.foto, id];
	const sql = "UPDATE funcionarios SET nome=?, email=?, senha=?, funcao=?, foto=? WHERE id_func = ?";
	db.run(sql, info_func, err => {
		if (err) {
			return console.error(err.message);
		} else {
			res.redirect("/funcionarios");
		}
	});
})

//GET deletar
app.get("/excluir/:id", (req, res) => {
	const id = req.params.id;
	const sql = "SELECT * FROM funcionarios WHERE id_func=?";
	db.get(sql, id, (err, row) => {
		res.render("views/excluirFuncionario.ejs", { modelo: row })
	})
})

//POST deletar
app.post("/excluir/:id", (req, res) => {
	const id = req.params.id;
	const sql = "DELETE FROM funcionarios WHERE id_func=?";
	db.run(sql, id, err => {
		if (err) {
			return console.error(err.message);
		} else {
			res.redirect("/funcionarios");
		}
	});
})

//=================     CHAMADOS - INICIO     =================  

//Mostrar Chamados
app.get('/chamados', (req, res) => {
	const sql = "SELECT * FROM chamados ORDER BY id_chamado";
	db.all(sql, [], (err, rows) => {
		if (err) {
			return console.error(err.message);
		} else {
			res.render("views/chamados.ejs", { modelo: rows });
		}
	})
})

//Criar novo funcionario
app.get('/abrirChamado', (req, res) => {
	res.render('views/abrirChamado.ejs', { modelo: {} });
});

//POST Criar
app.post('/abrirChamado', (req, res) => {

	const sql = "INSERT INTO chamados(titulo,descricao) VALUES(?,?)";
	const novo_chamado = [req.body.titulo, req.body.descricao];
	db.run(sql, novo_chamado, err => {
		if (err) {
			return console.error(err.message);
		} else {
			res.redirect("/chamados");
		}
	})
});

//ENVIAR EMAIL
app.get('/send',(req,res) =>{
	var transport = nodemailer.createTransport({
		host: "smtp.mailtrap.io",
		port: 2525,
		auth: {
		  user: "81917640a8819e",
		  pass: "c536d0b78bc9e5"
		}
	});
	
	transport.sendMail({
		from:"81917640a8819e",
		to:"teste@gmail.com",
		subject:"Fechamento do Chamado",
		text:"Olá informamos que o seu chamado foi encerrado",
	}).then(info => {
		res.send(info)
	}).catch(error => {
		res.send(error)
	})
})

//GET deletar
app.get("/excluirChamado/:id", (req, res) => {
	const id = req.params.id;
	const sql = "SELECT * FROM chamados WHERE id_chamado=?";
	db.get(sql, id, (err, row) => {
		res.render("views/excluirChamado.ejs", { modelo: row })
	})
})

//POST deletar
app.post("/excluirChamado/:id", (req, res) => {

	const id = req.params.id;
	const sql = "DELETE FROM chamados WHERE id_chamado=?";
	db.run(sql, id, err => {
		if (err) {
			return console.error(err.message);
		} else {
			res.redirect("/chamados");
		}
	});
})


//=================     CHAMADOS - FIM     ================= 

//Sempre deve ficar pro ultimo
app.get('/*', (req, res) => {
	res.render('views/notfound.ejs');
})

