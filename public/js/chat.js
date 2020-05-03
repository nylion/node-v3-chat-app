//set the selector for every field in the form to be more conventional we add $ in front of the const name
const $messageForm = document.querySelector('#Message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
//set the selector for share location button 
const $sendLocationButton = document.querySelector('#send-location')


const $messages = document.querySelector('#messages')


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML  //access to the html content of the script tag
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})


//autoscroll
const autoscroll = ()=>{
    //new msg element
    const $newMessage = $messages.lastElementChild // last element added to messages

    //height of new msg
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    //visible height 
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    //how far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}




const socket = io()
socket.on('message',(msg)=>{
    console.log(msg)
    $messageFormInput.focus() // I want it to be focused at the starting ...

    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll()

})

socket.on('locationMessage',(url)=>{
    console.log(url)
    const html = Mustache.render(locationMessageTemplate, {
        username: url.username,
        url:url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)

    autoscroll()
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,   
        users
    })
    document.querySelector('#sidebar').innerHTML = html

})


// socket.on('countUpdated',(count)=>{
//     console.log('The count has  been updated!', count)
// })


// document.querySelector('#increment').addEventListener('click', ()=>{
//     console.log('clicked')

//     socket.emit('increment')
// } )




$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')  // disalbe the send button until the acknowledgement is received!

   // const message = document.querySelector('input').value
    const message = e.target.elements.message.value
    
   socket.emit('sendMessage', message, (error)=>{

        $messageFormButton.removeAttribute('disabled')  // regardless of any error or success, enable the send button
        
        if(error){
           // return console.log(error)
            return alert(error)
        }
        console.log('Message Delivered!')
        $messageFormInput.value = ''  //clean the input form after every text send
        $messageFormInput.focus()  /// refocus on input again
        
        
   })
})

$sendLocationButton.addEventListener('click', ()=>{
   

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your Browser!')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position)=>{

        const lat = position.coords.latitude
        const long = position.coords.longitude
        
        const longlat = {
            lat,
            long
        }

        socket.emit('sendLocation', longlat,()=>{
            console.log('Location Shared!')
            $sendLocationButton.removeAttribute('disabled')
        })


    })


})

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})