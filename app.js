const express = require('express');
const socket = require('socket.io');
const http = require('http');
const fs = require('fs');

// express 객체 생성
const app = express();

// express http 서버 생성
const server = http.createServer(app);

// 생성된 서버를 socket.io에 바인딩
const io = socket(server);

// app.get('/', (req, res) => {
//     console.log('유저가 / 으로 접속하였습니다.');
//     res.send('Hello, Express Server!!');
// });

// 정적인 파일을 제공하기 위해 미들웨어를 사용하는 코드
app.use('/css', express.static('./static/css'));
app.use('/js', express.static('./static/js'));

// get 방식으로 / 경로에 접속하면 실행 됨
app.get('/', (req, res) => {
    fs.readFile('./static/index.html', (err, data) => {
        if (err) {
            res.send(console.log(err));
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            res.end();
        }
    });
});

// io.sockets.on('connection', (socket) => {
//     console.log('유저 접속 됨');

//     socket.on('send', (data) => {
//         console.log('전달된 메세지 : ', data.msg);
//     });

//     socket.on('disconnect', () => {
//         console.log('접속 종료');
//     });
// });

io.sockets.on('connection', (socket) => {
    socket.on('newUser', (name) => {
        console.log(name + ' 님이 접속하였습니다.');
        // socket에 이름 저장해두기
        socket.name = name;
        // 모든 socket에 전송
        io.sockets.emit('update', { type: 'connect', name: 'SERVER', message: name + ' 님이 접속하였습니다.' });
    });

    socket.on('out', (name) => {
        console.log(name + ' 님이 퇴장 당했습니다.');
    });

    socket.on('message', (data) => {
        // 받은 데이터 누가 보냈는지 이름을 추가
        data.name = socket.name;
        console.log(data);

        // 보낸 사람을 제외한 나머지 유저에게 메세지 전송
        socket.broadcast.emit('update', data);

        // io.sockets.emit() = 모든 유저(본인 포함)
        // socket.broadcast.emit() = 본인을 제외한 나머지 모두
    });

    socket.on('disconnect', () => {
        console.log(socket.name + ' 님이 나가셨습니다.');
        // 나가는 사람을 제외한 나머지 유저에게 메세지 전송
        socket.broadcast.emit('update', { type: 'disconnect', name: 'SERVER', message: socket.name + ' 님이 나가셨습니다.' });
    });
});

server.listen(8080, () => {
    console.log('서버 실행 중...');
});
