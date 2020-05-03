const users = []

//add user. remove user, get user, get user in room

const addUser = ({id, username, room}) => {
    //clean the data

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required!'
        }
    }

    //Check for existing user. if both are true then returns true
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //Validate username
    if(existingUser) {
        return{
            error: 'Username is in use'
        }

    }

    //Store user
    const user = {id,username,room}
    users.push(user)
    return{user}

}



const removeUser = (id)=>{
    const index = users.findIndex((user)=>{  // finds the user and returns the index number of the element 
        return user.id === id
    })

    if(index !== -1) { // -1 if not found but 0 or greater if found.
        return users.splice(index,1)[0] //removing the item at the position of index. 
    }
}


const getUser = (id)=>{
    return users.find((user)=> user.id === id)
}

const getUsersInRoom = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter((user)=>user.room === room)
}



addUser({
    id: 22,
    username: 'Mehdi',
    room:'gelg'
})


addUser({
    id: 1,
    username:'Ryan',
    room:'gelg'
})

addUser({
    id: 44,
    username:'testName',
    room:'testRoom'
})

console.log(users)

const user = getUser(1)
console.log(user)

const userList = getUsersInRoom('gelg')
console.log(userList)
// console.log(res)

// const removedUser = removeUser(22)

// console.log(removedUser)
// console.log(users)


module.exports = {
    addUser, 
    removeUser,
    getUser,
    getUsersInRoom
}