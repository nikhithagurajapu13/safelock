if(!sessionStorage.getItem('loggedIn')){
  window.location.href='login.html';
}

function logoutUser(){
  sessionStorage.clear();
  alert('Session expired. Please login again.');
  window.location.href='login.html';
}

let timer;

function resetTimer(){
  clearTimeout(timer);
  timer=setTimeout(logoutUser,180000);
}

window.onload=resetTimer;
document.onmousemove=resetTimer;
document.onkeypress=resetTimer;
document.onclick=resetTimer;
document.onscroll=resetTimer;

window.addEventListener('beforeunload',()=>{
  sessionStorage.clear();
});