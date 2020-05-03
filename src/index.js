const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000


const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))


// let count = 0
// io.on('connection',(socket)=>{
//     console.log('New WebSocket Connection!')

    // socket.emit('countUpdated', count)

    // socket.on('increment',()=>{
    //     count ++
    //  //   socket.emit('countUpdated',count)
    //  io.emit('countUpdated', count)
//     })
// })

const message = 'Welcome to PT Chat room'
io.on('connection',(socket)=>{
    // socket.emit('message', generateMessage(message))
    // socket.broadcast.emit('message', generateMessage('A New User has Joined!'))  //sends message to all user except the new joined user the he is joined.

    socket.on('join', (option, callback) =>{

        const {error, user} = addUser({id:socket.id, ...option})
        
        if(error){
            return callback(error)
        }
        
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin' ,message))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`)) 

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()  //to inform that user was successfully added.

    })


    socket.on('sendMessage', (msg, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(msg)){
            return callback('No profnity allowed!!!!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })

    socket.on('disconnect', ()=>{  // on user disconnection
        const user = removeUser(socket.id)
        
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has Left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }



    })

    socket.on('sendLocation', (coords, callback)=>{
        // io.emit('message',`Longitude: ${coords.lat}, Latitude: ${coords.long}`)
        
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, `https://google.com/maps?q=${coords.lat},${coords.long}`))
        callback()
    })
})



// app.listen(port,()=>{
//     console.log(`Server is up on port ${port}`)
// })


server.listen(port,()=>{
    console.log(`Server is up on port ${port}`)
})