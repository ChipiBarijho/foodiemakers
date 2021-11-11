
// Modal
const modal = document.querySelector('.modal')
const loginBtn = document.querySelector('.login-mobile')
const closeBtn = document.querySelector('.close')


loginBtn.addEventListener('click', openModal)
closeBtn.addEventListener('click', closeModal)
window.addEventListener('click', outsideClick)


function openModal(){
    modal.style.display = 'block'
}

function closeModal(){
    modal.style.display = 'none'
}

function outsideClick(e){
    if(e.target == modal){
        closeModal()
    }
}







// Login store username/email field after failing to authentincate
document.getElementById('username').onkeyup = function() {
    var username=this.value;
    sessionStorage.setItem('username',username);
    
};
document.getElementById('username').value=sessionStorage.getItem('username')

document.getElementById('email').onkeyup = function() {
    var email=this.value;
    sessionStorage.setItem('email',email);
    
};
document.getElementById('email').value=sessionStorage.getItem('email')




