function registerUser(){
  const username=document.getElementById('username').value;
  const email=document.getElementById('email').value;
  const phone=document.getElementById('phone').value;

  if(username===''||email===''||phone===''){
    alert('Please fill all fields');
    return;
  }

  localStorage.setItem('safeLockUser',JSON.stringify({username,email,phone}));
  alert('Account created successfully');
  window.location.href='login.html';
}

let generatedOTP='';

function sendOTP(){
  const savedUser=JSON.parse(localStorage.getItem('safeLockUser'));
  const username=document.getElementById('loginUsername').value;
  const phone=document.getElementById('loginPhone').value;

  if(!savedUser || savedUser.username!==username || savedUser.phone!==phone){
    alert('Incorrect details');
    return;
  }

  generatedOTP='123456';
  alert('OTP Sent: 123456');
  document.getElementById('otpSection').style.display='block';
}

function verifyOTP(){
  const otp=document.getElementById('otpInput').value;

  if(otp!==generatedOTP){
    alert('Incorrect OTP');
    return;
  }

  sessionStorage.setItem('loggedIn','true');
  sessionStorage.setItem('username',document.getElementById('loginUsername').value);

  window.location.href='dashboard.html';
}